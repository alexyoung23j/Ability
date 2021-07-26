import { DateTime } from 'luxon';
import React, { useContext } from 'react';
import { CalendarContext } from '../../../App';
import { assert } from '../../../assert';
import {
  applyPrepositionActionToFilter,
  extractModifierGroups,
  generateDefaultFilterForModifier,
} from '../../util/QueryTransformUtil';
import { DEFAULT_PREPOSITION_LIBRARY } from '../TransformFixtures';
import {
  CalendarIndexFilter,
  ModifierCategory,
  ModifierGroup,
  ModifierPiece,
  PrepositionPiece,
  QueryTransformEngineProps,
} from '../types';
import ResultEngine from './ResultEngine';
import * as CalendarIndexUtil from '../../util/CalendarIndexUtil';
import _ from 'underscore';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

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

// Renders ResultEngine
export function QueryTransformEngine(
  props: QueryTransformEngineProps
): JSX.Element | null {
  const modifierGroups = extractModifierGroups(props.queryPieces);

  let filter = null;

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
  // if  that bool is false, we intersect one more time with default range

  // Note: These functions need to APPLY each of the filters to specific days when building
  //const calendarData: Array<Day> = filterCalendarIndex(filter);
  // convert Day --> ResultData
  // Note: This functions needs to APPLY the start time, end time, and duration to EACH day when building result data.
  //        These values will have incorrect dates (but correct times) and so they must be converted to match the hard_start and hard_end for each day in resultData
  //const calendarResultData = convert(calendarData);

  console.log(
    '-----------------------------------------------------------------'
  );
  for (const arr of filter.range) {
    for (const date of arr) {
      console.log(date.toLocaleString());
    }
  }
  console.log(filter);
  console.log(
    '-----------------------------------------------------------------'
  );

  const calendarIndex = useContext(CalendarContext);
  // so we're going to convert the filter --> calendar result data here right?
  // Step 1: Convert range to indices
  const dateAtIndexZero: DateTime = CalendarIndexUtil.getDateAtIndex(
    calendarIndex,
    0
  );
  const indices = _.flatten(filter.range).map((date: DateTime) =>
    CalendarIndexUtil.mapDateToIndex(date, dateAtIndexZero)
  );

  // Step 2: Use other parts of filter and build result data for each index in the calendar index (lol)
  indices.map((index) => {
    console.log(
      CalendarIndexUtil.getDateAtIndex(calendarIndex, index).toLocaleString()
    );
  });

  return <ResultEngine calendarResultData={[]} />;
}
