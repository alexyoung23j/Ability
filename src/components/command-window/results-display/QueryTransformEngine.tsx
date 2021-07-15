import { DateTime } from 'luxon';
import React from 'react';
import { assert } from 'src/assert';
import {
  ModifierCategory,
  ModifierPiece,
  Piece,
  PrepositionPiece,
} from '../autocomplete/types';
import ResultEngine from './ResultEngine';

interface InvalidQueryException {}

interface QueryTransformEngineProps {
  queryPieces: Array<Piece>;
}

interface ModifierGroup {
  prepositionPiece: PrepositionPiece;
  modifierPiece: ModifierPiece;
}

function extractModifierGroups(
  queryPieces: Array<Piece>
): Array<ModifierGroup> {
  return [];
}

interface CalendarIndexFilter {
  range: Array<DateTime>;
  startTime: DateTime;
  endTime: DateTime;
  duration: number;
}

// TODO
function generateDefaultFilterForModifier(
  modifierPiece: ModifierPiece
): CalendarIndexFilter {
  return {
    range: [],
    startTime: DateTime.now(),
    endTime: DateTime.now(),
    duration: 0,
  };
}

// TODO
function applyPrepositionActionToFilter(
  preposition: PrepositionPiece,
  modifier: ModifierPiece,
  filter: CalendarIndexFilter
): CalendarIndexFilter {
  switch (modifier.category) {
    case ModifierCategory.TIME:
      switch (preposition.value) {
        case 'at':
          break;
        case 'after':
      }
    case ModifierCategory.DATE:
    case ModifierCategory.DURATION:
    case ModifierCategory.RANGE:
      break;
    default:
      assert(false, 'wtff');
  }

  return filter;
}

function intersectFilters(
  filter1: CalendarIndexFilter,
  filter2: CalendarIndexFilter
): CalendarIndexFilter {
  // If cannot intersect, throw InvalidQueryException
  return filter1;
}

export function QueryTransformEngine(
  props: QueryTransformEngineProps
): JSX.Element | null {
  const modifierGroups = extractModifierGroups(props.queryPieces);

  let filter = null;

  for (const { modifierPiece, prepositionPiece } of modifierGroups) {
    // Convert range to be array of calendar index indices later
    let currentFilter: CalendarIndexFilter =
      generateDefaultFilterForModifier(modifierPiece);

    currentFilter = applyPrepositionActionToFilter(
      prepositionPiece,
      modifierPiece,
      currentFilter
    );

    try {
      filter = intersectFilters(filter, currentFilter);
    } catch (exception) {
      if (isInvalidQueryException(exception)) {
        //  alert to user that they fukekd up
      }
    }
  }

  const calendarData: Array<Day> = filterCalendarIndex(filter);
  // convert Day --> ResultData
  const calendarResultData = convert(calendarData);

  return <ResultEngine calendarResultData={calendarResultData} />;
}
