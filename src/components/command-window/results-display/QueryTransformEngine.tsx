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
} from '../types';
import {
  DEFAULT_PREPOSITION_LIBRARY,
  DurationModifiersDurationMap,
  MonthToMonthIndexMap,
  TimeModifierStartAndEndMap,
  modifierStringToRangeGeneratorMap,
} from '../TransformFixtures';
import ResultEngine from './ResultEngine';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// USER SETTINGS, SHOULD EVENTUALLY BE A CONTEXT OBJECT I GUESS
const user_settings = {
  day_hard_start: '2021-01-01T08:00:00', // the date is arbitrary, this gets overwritten at some point
  day_hard_stop: '2021-01-01T21:00:00', // the date is arbitrary, this gets overwritten at some point
  default_block_duration: 60, // The number of minutes to find a block for a specific time, (i.e. "at 2:00 pm" will block out 2pm - 3pm)
  time_zone_offset: -7, // Offset from UTC
};

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
  let modifierGroups: Array<ModifierGroup> = [];

  let i = 0;

  while (i < queryPieces.length) {
    const currentPiece = queryPieces[i];

    if (isPrepositionPiece(currentPiece) && i < queryPieces.length - 1) {
      const nextPiece = queryPieces[i + 1];
      if (isModifierPiece(nextPiece)) {
        let handledPrepositionGroup: ModifierGroup = {
          prepositionPiece: currentPiece,
          modifierPiece: nextPiece,
        };
        modifierGroups.push(handledPrepositionGroup);
      }
      i += 2;
    } else if (isModifierPiece(currentPiece)) {
      let defaultPrepositionGroup: ModifierGroup = {
        prepositionPiece: DEFAULT_PREPOSITION_LIBRARY[currentPiece.category],
        modifierPiece: currentPiece,
      };
      modifierGroups.push(defaultPrepositionGroup);
      i += 1;
    }
  }

  return modifierGroups;
}

interface CalendarIndexFilter {
  range: Array<Array<DateTime>> | null; // Each subarray is a contiguous chunk of datetimes
  startTime: DateTime | null;
  endTime: DateTime | null;
  duration: number | null;
}

// Creates filter for duration modifiers
function durationFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {
  // Extract number
  const multiplier = parseFloat(modifierPiece.value.match(/\d+\.?\d*/)[0]);

  // Get plain word
  const durationModifierString = modifierPiece.value
    .replace(/\d+\.?\d*/, '')
    .trim();

  // pair word with map to number of minutes, multiply this default by our extracted number
  let durationInMinutes = DurationModifiersDurationMap[durationModifierString];
  durationInMinutes *= multiplier;

  return {
    range: null,
    startTime: null, //meaningless
    endTime: null, // meaningless
    duration: durationInMinutes,
  };
}

const ONE_OR_MORE_NUMBERS = /\d+/g;

// Creates filter for duration modifiers
function timeFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {
  const numbers: Array<string> = modifierPiece.value.match(ONE_OR_MORE_NUMBERS);
  const timeModifierString = modifierPiece.value
    .replace(ONE_OR_MORE_NUMBERS, '')
    .replace(':', '')
    .trim();

  let hour = 0;
  let minute = 0;

  if (numbers != null && numbers.length > 1) {
    hour = parseFloat(numbers[0]);
    minute = parseFloat(numbers[1]);
  } else if (numbers != null && numbers.length > 0) {
    hour = parseFloat(numbers[0]);
  }

  let mapRes = TimeModifierStartAndEndMap[timeModifierString];
  let extracted_start_time = mapRes.start_time;
  let extracted_end_time = mapRes.end_time;

  let start_time;
  let end_time = null;

  const default_time = DateTime.fromISO('2021-01-01T12:00:00-00:00');

  switch (extracted_start_time) {
    case 'HARD_START':
      start_time = DateTime.fromISO(user_settings.day_hard_start);
      break;

    case 'PM':
      start_time = default_time.set({ hour: hour + 12, minute: minute });
      break;

    case 'AM':
      start_time = default_time.set({ hour: hour, minute: minute });
      break;

    default:
      start_time = DateTime.fromISO(extracted_start_time);
      break;
  }

  switch (extracted_end_time) {
    case 'HARD_STOP':
      end_time = DateTime.fromISO(user_settings.day_hard_stop);
      break;

    case 'IMPLIED':
      // This is arbitrary, maybe we should do it in a more sophisticated way
      if (start_time.minute > 30) {
        end_time = start_time.set({ hour: start_time.hour + 2, minute: 0 });
      } else {
        end_time = start_time.set({ hour: start_time.hour + 1, minute: 0 });
      }
      break;

    default:
      end_time = DateTime.fromISO(extracted_end_time);
      break;
  }

  return {
    range: null,
    startTime: start_time,
    endTime: end_time,
    duration: null,
  };
}

// TODO: make sure this actually works ?
export function _chooseYearForDateFilter(day: number, month: number): number {
  const toCompareTo = DateTime.fromObject({ day, month });
  const now = DateTime.now().startOf('day');

  const year = toCompareTo < now ? now.year + 1 : now.year;
  return year;
}

// Creates filter for date modifiers
function dateFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {
  // Extract out string arg from date modifier (e.g. 15 February --> "February")
  const dateModifierStringArg = modifierPiece.value
    .replace(ONE_OR_MORE_NUMBERS, '')
    .replace('/', '')
    .trim();

  // Get numbers from modifier
  const numbers: Array<string> =
    modifierPiece.value.match(ONE_OR_MORE_NUMBERS) ?? [];

  assert(
    numbers.length >= 0 && numbers.length <= 3,
    `Found modifier piece with more than 3 numbers ${modifierPiece}`
  );

  // If there's zero numbers, the modifier must be a day (e.g. "Thursday")
  //    This would be a collection of non-consecutive days as well
  if (numbers.length === 0) {
    return {
      range: _generateRangeArrays(dateModifierStringArg),
      startTime: null,
      endTime: null,
      duration: null,
    };
  }

  let day: number;
  let month: number;
  let year: number;

  // If there's one number, it must be an actual day number (e.g. the 15th)
  if (numbers.length === 1) {
    day = parseFloat(numbers[0]); // 15
    month = MonthToMonthIndexMap[dateModifierStringArg]; // February
    year = _chooseYearForDateFilter(day, month);
  }

  // If there's two numbers, it must be a month number followed by a day number (e.g. 7/15)
  // TODO - if we choose to support "January 12, 2021", numbers[0] and numbers[1] become a day and year, respectively
  else if (numbers.length === 2) {
    [month, day] = numbers.map((number) => parseFloat(number)); // 7, 15
    year = _chooseYearForDateFilter(day, month);
  }

  // If there's three numbers, it must be a month, followed by day, followed by year (e.g. 7/15/2021)
  else if (numbers.length === 3) {
    [month, day, year] = numbers.map((number) => parseFloat(number)); // 7, 15, 2021
    // TODO - think about what if month,day,year are before today?
  }

  return {
    range: [[DateTime.fromObject({ day, month, year })]],
    startTime: null,
    endTime: null,
    duration: null,
  };
}

function _generateRangeArrays(rangeString: string): Array<Array<DateTime>> {
  // Strip out the s from the end of some plurals
  if (rangeString[rangeString.length - 1] == 's') {
    rangeString = rangeString.slice(0, rangeString.length - 1);
  }

  const actionType = modifierStringToRangeGeneratorMap[rangeString];

  const rangeArrays = [];
  const now = DateTime.now();
  let baseDate: DateTime;

  if (actionType == 'WEEKDAY') {
    // "monday", "tuesday" .. find the next 52 occurences of these
    for (let i = 0; i < 7; i++) {
      const day = now.plus({ days: i });
      if (day.weekdayLong.toLowerCase() === rangeString) {
        baseDate = day.startOf('day');
        break;
      }
    }
    assert(
      baseDate != null,
      `Received a modifier piece with no numbers that isn't a day of the week: ${rangeString}`
    );

    // Build up one years worth of days

    let i = 0;
    while (i < 365) {
      rangeArrays.push([baseDate.plus({ days: i })]);
      i += 7;
    }
  } else if (actionType == 'WEEK') {
    // Starting from the current week, find the next 52 weeks
    baseDate = now.startOf('week');

    let i = 0;
    while (i < 365) {
      let j = 0;
      let rangeArray: Array<DateTime> = [];
      while (j < 7) {
        rangeArray.push(baseDate.plus({ days: i }));
        i += 1;
        j += 1;
      }
      // Note weeks start on mondays
      rangeArrays.push(rangeArray);
    }
  } else if (actionType == 'MONTH') {
    // Starting from the current month, find the next 11 months
    baseDate = now.startOf('month');
    let originalMonth = baseDate.month;

    let i = 0;
    while (
      i < baseDate.daysInMonth ||
      baseDate.plus({ days: i }).month != originalMonth
    ) {
      let j = 0;
      let rangeArray: Array<DateTime> = [];

      // Calculate how many days we need to add to this object
      let daysInThisMonth = baseDate.plus({ days: i }).daysInMonth;

      while (j < daysInThisMonth) {
        rangeArray.push(baseDate.plus({ days: i }));
        i += 1;
        j += 1;
      }
      // Note weeks start on mondays
      rangeArrays.push(rangeArray);
    }
  } else if (actionType == 'YEAR') {
    // Add the next two years
    baseDate = now.startOf('year');

    // This year
    let i = 0;
    let rangeArray = [];
    while (i < 365) {
      rangeArray.push(baseDate.plus({ days: i }));
      i += 1;
    }
    rangeArrays.push(rangeArray);

    // Next year
    rangeArray = [];
    while (i < 730) {
      rangeArray.push(baseDate.plus({ days: i }));
      i += 1;
    }
    rangeArrays.push(rangeArray);
  } else if (actionType == 'DAY') {
    // Grab the next 100 days (since 3 digit numbers are not allowed)
    let i = 0;
    baseDate = now.startOf('day');

    while (i < 100) {
      rangeArrays.push([baseDate.plus({ days: i })]);
      i += 1;
    }
  } else if (actionType == 'MONTH_NAME') {
    // Get the month this year and the next year
    const monthIdx = MonthToMonthIndexMap[rangeString.toLowerCase()];
    baseDate = now.set({ month: monthIdx }).startOf('month');

    // The month in this year
    let i = 0;
    let rangeArray = [];
    while (i < baseDate.daysInMonth) {
      rangeArray.push(baseDate.plus({ days: i }));
      i += 1;
    }
    rangeArrays.push(rangeArray);

    i = 0;
    rangeArray = [];
    baseDate = baseDate.set({ year: now.year + 1 });

    while (i < baseDate.daysInMonth) {
      rangeArray.push(baseDate.plus({ days: i }));
      i += 1;
    }
    rangeArrays.push(rangeArray);
  } else if (actionType == 'TODAY') {
    baseDate = now.startOf('day');
    rangeArrays.push([baseDate]);
  } else if (actionType == 'TOMORROW') {
    baseDate = now.plus({ days: 1 }).startOf('day');
    rangeArrays.push([baseDate]);
  } else if (actionType == 'YESTERDAY') {
    baseDate = now.minus({ days: 1 }).startOf('day');
    rangeArrays.push([baseDate]);
  }

  return rangeArrays;
}

function rangeFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {
  const rangeModifierString = modifierPiece.value
    .replace(ONE_OR_MORE_NUMBERS, '')
    .trim();

  return {
    range: _generateRangeArrays(rangeModifierString),
    startTime: null,
    endTime: null,
    duration: null,
  };
}

// Handles base case for all modifiers
function generateDefaultFilterForModifier(
  modifierPiece: ModifierPiece
): CalendarIndexFilter {
  switch (modifierPiece.category) {
    case ModifierCategory.DURATION:
      return durationFilter(modifierPiece);

    case ModifierCategory.TIME:
      return timeFilter(modifierPiece);

    case ModifierCategory.DATE:
      return dateFilter(modifierPiece);

    case ModifierCategory.RANGE:
      return rangeFilter(modifierPiece);

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
    case ModifierCategory.DURATION:
      // Do nothing interesting
      return filter;

    case ModifierCategory.TIME:
      switch (preposition.value) {
        case 'at':
          return filter;
        case 'after':
          // check if it contains numbers
          if (modifier.value.match(ONE_OR_MORE_NUMBERS)) {
            return {
              ...filter,
              endTime: DateTime.fromISO(user_settings.day_hard_stop),
            };
          } else {
            return {
              ...filter,
              startTime: filter.endTime,
              endTime: DateTime.fromISO(user_settings.day_hard_stop),
            };
          }
        case 'before':
          return {
            ...filter,
            startTime: DateTime.fromISO(user_settings.day_hard_start),
            endTime: filter.startTime,
          };
        case 'this':
          // We have to modify the range in this case
          return {
            ...filter,
            range: _generateRangeArrays('today'),
          };
        default:
          assert(
            false,
            'we have some other preposition that is not allowed for a time modifier'
          );
      }

    case ModifierCategory.DATE:
      switch (preposition.value) {
        case 'this':
          // take first occurence
          return {
            ...filter,
            range: [filter.range[0]],
          };
        case 'first': // TODO: Handle this, it isnt going to work. We want 'first monday in july' but currently "july" will return us july and "first month" will give us just the next monday from today
          // take first occurence
          return {
            ...filter,
            range: [filter.range[0]],
          };
        case 'on':
          // take first occurence
          return {
            ...filter,
            range: [filter.range[0]],
          };
        case 'next':
      }

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

    assert(
      Object.values(currentFilter).filter((value) => value != null).length !==
        0,
      'Found only null values in currentFilter'
    );

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
