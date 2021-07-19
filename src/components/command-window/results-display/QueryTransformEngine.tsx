import { DateTime } from 'luxon';
import React from 'react';
import { assert } from '../../../assert';
import {
  isModifierPiece,
  isPrepositionPiece,
  ModifierCategory,
  ModifierPiece,
  Piece,
  PrepositionPiece,
  ModifierGroup,
  CalendarIndexFilter,
  QueryTransformEngineProps,
} from '../types';
import {
  DEFAULT_PREPOSITION_LIBRARY,
  DurationModifiersDurationMap,
  MonthToMonthIndexMap,
  TimeModifierStartAndEndMap,
  modifierStringToRangeGeneratorMap,
} from '../TransformFixtures';
import {
  durationFilter,
  timeFilter,
  dateFilter,
  rangeFilter,
  ONE_OR_MORE_NUMBERS,
  _generateNextNDays,
  _generateRangeArrays,
  extractModifierGroups,
  applyPrepositionActionToFilter,
  generateDefaultFilterForModifier,
} from '../../util/QueryTransformUtil';
import ResultEngine from './ResultEngine';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// USER SETTINGS, SHOULD EVENTUALLY BE A CONTEXT OBJECT I GUESS

function intersectFilters(
  filter1: CalendarIndexFilter,
  filter2: CalendarIndexFilter
): CalendarIndexFilter {
  // If cannot intersect, throw InvalidQueryException
  return filter1;
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

    // Intersect filters and note errors
    try {
      filter = intersectFilters(filter, currentFilter);
    } catch (exception) {
      // if (isInvalidQueryException(exception)) {
      //  alert to user that they fukekd up
      // }
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
