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
  QueryPieceType,
} from '../types';
import {
  DEFAULT_PREPOSITION_LIBRARY, DurationModifiersDurationMap, TimeModifierStartAndEndMap
} from '../TransformFixtures'
import ResultEngine from './ResultEngine';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// USER SETTINGS, SHOULD EVENTUALLY BE A CONTEXT OBJECT I GUESS
const user_settings = {
  day_hard_start: '2021-01-01T08:00:00', // the date is arbitrary, this gets overwritten at some point
  day_hard_stop: '2021-01-01T21:00:00', // the date is arbitrary, this gets overwritten at some point
  default_block_duration: 60, // The number of minutes to find a block for a specific time, (i.e. "at 2:00 pm" will block out 2pm - 3pm)
  time_zone_offset: -7 // Offset from UTC
}

interface InvalidQueryException {}

interface QueryTransformEngineProps {
  queryPieces: Array<Piece>;
}

interface ModifierGroup {
  prepositionPiece: PrepositionPiece; // TODO: I think im handling the types wrong but this caused a problem in the extractModifierGroups function if we forced it to be a PrepositionPiece type
  modifierPiece: ModifierPiece;
}

// Takes raw query pieces and groups them into modifier groups
function extractModifierGroups(
  queryPieces: Array<Piece>
): Array<ModifierGroup> {

  let modifierGroups: Array<ModifierGroup> = []

  let i = 0

  while (i < queryPieces.length) {
    const currentPiece = queryPieces[i]

    if (isPrepositionPiece(currentPiece) && i < queryPieces.length-1) {
      const nextPiece = queryPieces[i+1]
      if (isModifierPiece(nextPiece)) {
        let handledPrepositionGroup: ModifierGroup = {prepositionPiece: currentPiece, modifierPiece: nextPiece}
        modifierGroups.push(handledPrepositionGroup)
      }
      i += 2
      
    } else if (isModifierPiece(currentPiece)) {
      let defaultPrepositionGroup: ModifierGroup = {prepositionPiece: DEFAULT_PREPOSITION_LIBRARY[currentPiece.category], modifierPiece: currentPiece}
      modifierGroups.push(defaultPrepositionGroup)
      i+=1
    }
  }

  return modifierGroups;
}

interface CalendarIndexFilter {
  range: Array<DateTime> | null;
  startTime: DateTime | null;
  endTime: DateTime | null;
  duration: number | null;
}

// Creates filter for duration modifiers
function durationFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {

  // Extract number
  const multiplier = parseFloat(modifierPiece.value.match(/\d+\.?\d*/)[0]);
  
  // Get plain word
  const durationModifierString = modifierPiece.value.replace(/\d+\.?\d*/, '').trim()

  // pair word with map to number of minutes, multiply this default by our extracted number
  let durationInMinutes = DurationModifiersDurationMap[durationModifierString]
  durationInMinutes *= multiplier

  return {
    range: null,
    startTime: null, //meaningless
    endTime: null, // meaningless
    duration: durationInMinutes,
  };

}

function timeFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {

  const numbers = modifierPiece.value.match(/\d+/g)
  const timeModifierString = modifierPiece.value.replace(/\d+/g, '').replace(':', '').trim()

  myConsole.log(timeModifierString)

  let hour = null
  let minute = null

  if (numbers != null && numbers.length > 1) {
    hour = parseFloat(numbers[0])
    minute = parseFloat(numbers[1])
  } else if (numbers != null && numbers.length > 0) {
    hour = parseFloat(numbers[0])
  }

  let {extracted_start_time, extracted_end_time} = TimeModifierStartAndEndMap[timeModifierString]

  let start_time = DateTime.fromISO(extracted_start_time)
  let end_time = DateTime.fromISO(extracted_end_time)

  switch (extracted_start_time) {
    case 'HARD_START':
      start_time = DateTime.fromISO(user_settings.day_hard_start)
    case 'PM':

    case 'AM':
      
  }
  




  return {
    range: [],
    startTime: start_time,
    endTime: end_time,
    duration: null,
  };
}

// Handles base case for all modifiers
function generateDefaultFilterForModifier(
  modifierPiece: ModifierPiece
): CalendarIndexFilter {

  switch (modifierPiece.category) {
    case ModifierCategory.DURATION:
      return durationFilter(modifierPiece)

    case ModifierCategory.TIME:
      return timeFilter(modifierPiece)

    case ModifierCategory.DATE:
      return {
        range: [],
        startTime: DateTime.now(),
        endTime: DateTime.now(),
        duration: 0,
      };

    case ModifierCategory.RANGE:
      return {
        range: [],
        startTime: DateTime.now(),
        endTime: DateTime.now(),
        duration: 0,
      };

    default:
      assert(false, 'wtff');
  }
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
      // Do nothing interesting
      return filter

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

    //myConsole.log(currentFilter)

    currentFilter = applyPrepositionActionToFilter(
      prepositionPiece,
      modifierPiece,
      currentFilter
    );

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
