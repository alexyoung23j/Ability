import { DateTime } from 'luxon';
import React, { useContext, useState } from 'react';
import { CalendarContext } from '../../../App';
import { assert } from '../../../assert';
import {
  applyPrepositionActionToFilter,
  extractModifierGroups,
  generateDefaultFilterForModifier,
  USER_SETTINGS_DATE_TIME_CONFIG,
  USER_SETTINGS_DEFAULT_FILTERS,
} from '../../util/QueryTransformUtil';
import { DEFAULT_PREPOSITION_LIBRARY } from '../TransformFixtures';
import {
  CalendarIndexFilter,
  ModifierCategory,
  ModifierGroup,
  ModifierPiece,
  PrepositionPiece,
  QueryTransformEngineProps,
  Piece,
  QueryPieceType,
} from '../types';
import ResultEngine, {
  CalendarResultData,
  CalendarResultEvent,
} from './ResultEngine';
import * as CalendarIndexUtil from '../../util/CalendarIndexUtil';
import _ from 'underscore';
import ErrorResult from './ErrorResult';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// Renders ResultEngine
export function QueryTransformEngine(
  props: QueryTransformEngineProps
): JSX.Element | null {
  const calendarIndex = useContext(CalendarContext);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null); // Keeps track of the last index we displayed

  let filter = createFilter(props.queryPieces);

  // so we're going to convert the filter --> calendar result data here right?
  // Step 1: Convert range to indices
  const dateAtIndexZero: DateTime = CalendarIndexUtil.getDateAtIndex(
    calendarIndex,
    0
  );
  const indices = _.flatten(filter.range).map((date: DateTime) =>
    CalendarIndexUtil.mapDateToIndex(date, dateAtIndexZero)
  );

  let calendarResultData: CalendarResultData = null;
  let showError = false;

  if (indices.includes(-1)) {
    showError = true;
  } else {
    // Step 2: Use other parts of filter and build result data for each index in the calendar index (lol)
    const daysFromCalendarIndex = indices.map((index) =>
      CalendarIndexUtil.getDayAtIndex(calendarIndex, index)
    );

    calendarResultData = transformToResultData(daysFromCalendarIndex, filter);
  }

  return (
    // TODO: Add handling for different error messages
    <div>
      {(!showError && (
        <ResultEngine calendarResultData={calendarResultData} />
      )) || <ErrorResult errorType="out-of-range" />}
    </div>
  );
}

function intersectFilters(
  filter1: CalendarIndexFilter,
  filter2: CalendarIndexFilter
): CalendarIndexFilter {
  if (filter1.range == null || filter2.range == null) {
    return {
      range: filter1.range ?? filter2.range,
      duration: filter1.duration ?? filter2.duration,
      startTime: filter1.startTime ?? filter2.startTime,
      endTime: filter1.endTime ?? filter2.endTime,
    };
  }

  const set1 = new Set();
  const set2 = new Set();

  for (const arr of filter1.range) {
    for (const date of arr) {
      set1.add(date.toISODate());
    }
  }
  for (const arr of filter2.range) {
    for (const date of arr) {
      set2.add(date.toISODate());
    }
  }

  const intersection = [
    [...set1]
      .filter((x) => set2.has(x))
      .map((isoString: string) => DateTime.fromISO(isoString).startOf('day')),
  ];
  return {
    range: intersection,
    duration: filter1.duration ?? filter2.duration,
    startTime: filter1.startTime ?? filter2.startTime,
    endTime: filter1.endTime ?? filter2.endTime,
  };
}

// Edge case: In the case that a Date Modifier does not have a preposition AND a range is provided. (e.g. Monday in April)
// We should skip applying the default preposition for the date. ("this" should not be applied to "Monday")
function shouldApplyPreposition(
  rangeModifierExists: boolean,
  modifierPiece: ModifierPiece,
  prepositionPiece: PrepositionPiece | null
): boolean {
  return !(
    modifierPiece.category === ModifierCategory.DATE &&
    rangeModifierExists &&
    prepositionPiece === null
  );
}

function createFilter(queryPieces: Array<Piece>): CalendarIndexFilter {
  let modifierGroups: Array<ModifierGroup>;

  modifierGroups = extractModifierGroups(queryPieces);

  let filter: CalendarIndexFilter | null = null;

  const rangeModifierExists =
    modifierGroups.findIndex(
      ({ modifierPiece }: ModifierGroup) =>
        modifierPiece.category === ModifierCategory.RANGE
    ) !== -1;

  for (let { modifierPiece, prepositionPiece } of modifierGroups) {
    // Convert range to be array of calendar index indices later
    let currentFilter: CalendarIndexFilter =
      generateDefaultFilterForModifier(modifierPiece);

    assert(
      Object.values(currentFilter).filter((value) => value != null).length !==
        0,
      'Found only null values in currentFilter'
    );

    // Apply preposition to filter
    if (
      shouldApplyPreposition(
        rangeModifierExists,
        modifierPiece,
        prepositionPiece
      )
    ) {
      currentFilter = applyPrepositionActionToFilter(
        // Use default preposition if preposition is null
        prepositionPiece ?? DEFAULT_PREPOSITION_LIBRARY[modifierPiece.category],
        modifierPiece,
        currentFilter
      );
    }

    // Intersect filters and note errors
    if (filter == null) {
      filter = currentFilter;
    } else {
      try {
        filter = intersectFilters(filter, currentFilter);
      } catch (exception) {
        // if (isInvalidQueryException(exception)) {
        //  alert to user that they fukekd up
        // }
      }
    }
  }

  // Replace null values with defaults
  filter = _hydrateNullFields(filter);

  return filter;
}
function _hydrateNullFields(filter: CalendarIndexFilter): CalendarIndexFilter {
  console.log(filter);
  return {
    duration: filter.duration ?? USER_SETTINGS_DEFAULT_FILTERS.duration,
    startTime: filter.startTime ?? USER_SETTINGS_DEFAULT_FILTERS.startTime,
    endTime: filter.endTime ?? USER_SETTINGS_DEFAULT_FILTERS.endTime,
    range: filter.range ?? USER_SETTINGS_DEFAULT_FILTERS.range,
  };
}

function transformToResultData(
  daysFromCalendarIndex: Array<CalendarIndexUtil.CalendarIndexDay>,
  filter: CalendarIndexFilter
): CalendarResultData {
  return {
    minDuration: filter.duration,
    days: daysFromCalendarIndex.map((calendarIndexDay) => {
      const hard_start_hour =
        filter.startTime?.hour ??
        USER_SETTINGS_DATE_TIME_CONFIG.hard_start_hours.hour;
      const hard_stop_hour =
        filter.endTime?.hour ??
        USER_SETTINGS_DATE_TIME_CONFIG.hard_stop_hours.hour;

      const { day, month, year } = calendarIndexDay.date;

      return {
        calendar_date: calendarIndexDay.date.toISODate(),
        hard_start: DateTime.fromObject({
          day,
          month,
          year,
          hour: hard_start_hour,
        }).toISO(),
        hard_end: DateTime.fromObject({
          day,
          month,
          year,
          hour: hard_stop_hour,
        }).toISO(),
        free_blocks: [],
        events: calendarIndexDay.events.map(
          ({
            startTime,
            endTime,
            summary,
            eventHtmlLink,
          }): CalendarResultEvent => ({
            start_time: startTime.dateTime,
            end_time: endTime.dateTime,
            color: 'blue',
            title: summary,
            url: eventHtmlLink,
            calendar: {
              name: 'Work Calendar',
              googleAccount: 'testAccount1@gmail.com',
              color: 'blue',
            },
            index_of_overlapped_events: [],
          })
        ),
      };
    }),
  };
}
