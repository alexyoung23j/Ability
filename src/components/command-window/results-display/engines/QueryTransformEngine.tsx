import { DateTime } from 'luxon';
import React, { useContext, useState } from 'react';
import { CalendarContext } from '../../../../components/AllContextProvider';
import { assert } from '../../../util/test-util/assert';
import {
  applyPrepositionActionToFilter,
  extractModifierGroups,
  generateDefaultFilterForModifier,
  USER_SETTINGS_DATE_TIME_CONFIG,
  USER_SETTINGS_DEFAULT_FILTERS,
} from '../../../util/command-view-util/QueryTransformUtil';
import { DEFAULT_PREPOSITION_LIBRARY } from '../../../../constants/TransformConstants';
import {
  CalendarIndexFilter,
  ModifierCategory,
  ModifierGroup,
  ModifierPiece,
  PrepositionPiece,
  QueryTransformEngineProps,
  Piece,
  QueryPieceType,
} from '../../../../constants/types';
import ResultEngine, {
  CalendarResultData,
  CalendarResultEvent,
} from './ResultEngine';
import * as CalendarIndexUtil from '../../../util/command-view-util/CalendarIndexUtil';
import _ from 'underscore';
import ErrorResult from '../error-handling/ErrorResult';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export enum FilterErrorType {
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  ILLOGICAL_QUERY = 'ILLOGICAL_QUERY',
}

interface FilterError {
  errorStatus: boolean;
  errorType: FilterErrorType;
}

// Renders ResultEngine
export function QueryTransformEngine(
  props: QueryTransformEngineProps
): JSX.Element | null {
  const calendarIndex = useContext(CalendarContext);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null); // Keeps track of the last index we displayed

  var queryError: FilterError = { errorStatus: false, errorType: null };

  let { filter, filterError } = createFilter(props.queryPieces);

  // if the filter has an error when it gets created, set queryError so we display the error message instead
  if (filterError && filterError.errorStatus) {
    queryError = filterError;
  }

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
  //let showError = false;

  if (indices.includes(-1)) {
    queryError = {
      errorStatus: true,
      errorType: FilterErrorType.OUT_OF_RANGE,
    };
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
      {(!queryError.errorStatus && (
        <ResultEngine calendarResultData={calendarResultData} />
      )) || <ErrorResult errorType={queryError.errorType} />}
    </div>
  );
}

function intersectFilters(
  filter1: CalendarIndexFilter,
  filter2: CalendarIndexFilter
): { filter: CalendarIndexFilter; filterError: FilterError | null } {
  if (filter1.range == null || filter2.range == null) {
    return {
      filter: {
        range: filter1.range ?? filter2.range,
        duration: filter1.duration ?? filter2.duration,
        startTime: filter1.startTime ?? filter2.startTime,
        endTime: filter1.endTime ?? filter2.endTime,
      },
      filterError: null,
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

  if (intersection[0].length === 0) {
    return {
      filter: {
        range: intersection,
        duration: filter1.duration ?? filter2.duration,
        startTime: filter1.startTime ?? filter2.startTime,
        endTime: filter1.endTime ?? filter2.endTime,
      },
      filterError: {
        errorStatus: true,
        errorType: FilterErrorType.ILLOGICAL_QUERY,
      },
    };
  } else {
    return {
      filter: {
        range: intersection,
        duration: filter1.duration ?? filter2.duration,
        startTime: filter1.startTime ?? filter2.startTime,
        endTime: filter1.endTime ?? filter2.endTime,
      },
      filterError: null,
    };
  }
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

// Returns an array where index 0 is the filter and index 1 is either null or a FilterError if one emerges
function createFilter(queryPieces: Array<Piece>): {
  filter: CalendarIndexFilter;
  filterError: FilterError | null;
} {
  let modifierGroups: Array<ModifierGroup>;

  modifierGroups = extractModifierGroups(queryPieces);

  let filter: CalendarIndexFilter | null = null;
  let filterError: FilterError | null = null;

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
      let intersectResult = intersectFilters(filter, currentFilter);
      filter = intersectResult.filter;

      if (intersectResult.filterError != null) {
        filterError = intersectResult.filterError;
      }
    }
  }

  // Replace null values with defaults
  filter = _hydrateNullFields(filter);

  return { filter: filter, filterError: filterError };
}
function _hydrateNullFields(filter: CalendarIndexFilter): CalendarIndexFilter {
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
