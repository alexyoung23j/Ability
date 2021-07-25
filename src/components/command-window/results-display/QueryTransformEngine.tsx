import { DateTime } from 'luxon';
import React from 'react';
import { assert } from '../../../assert';
import {
  applyPrepositionActionToFilter,
  extractModifierGroups,
  generateDefaultFilterForModifier,
} from '../../util/QueryTransformUtil';
import { CalendarIndexFilter, QueryTransformEngineProps } from '../types';
import ResultEngine from './ResultEngine';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

function intersectFilters(
  filter1: CalendarIndexFilter,
  filter2: CalendarIndexFilter
): CalendarIndexFilter {
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

// Renders ResultEngine
export function QueryTransformEngine(
  props: QueryTransformEngineProps
): JSX.Element | null {
  const modifierGroups = extractModifierGroups(props.queryPieces);

  let filter = null;

  for (const { modifierPiece, prepositionPiece } of modifierGroups) {
    // Convert range to be array of calendar index indices later
    let currentFilter: CalendarIndexFilter =
      generateDefaultFilterForModifier(modifierPiece);

    assert(
      Object.values(currentFilter).filter((value) => value != null).length !==
        0,
      'Found only null values in currentFilter'
    );

    // Apply preposition to filter
    currentFilter = applyPrepositionActionToFilter(
      prepositionPiece,
      modifierPiece,
      currentFilter
    );

    console.log(currentFilter);
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

  // Note: These functions need to APPLY each of the filters to specific days when building
  //const calendarData: Array<Day> = filterCalendarIndex(filter);
  // convert Day --> ResultData
  // Note: This functions needs to APPLY the start time, end time, and duration to EACH day when building result data.
  //        These values will have incorrect dates (but correct times) and so they must be converted to match the hard_start and hard_end for each day in resultData
  //const calendarResultData = convert(calendarData);

  return <ResultEngine calendarResultData={[]} />;
}
