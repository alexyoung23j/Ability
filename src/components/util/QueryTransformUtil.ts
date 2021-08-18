import { DateTime } from 'luxon';
import { assert } from '../../assert';
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
} from '../command-window/types';
import {
  DEFAULT_PREPOSITION_LIBRARY,
  DurationModifiersDurationMap,
  MonthToMonthIndexMap,
  TimeModifierStartAndEndMap,
  modifierStringToRangeGeneratorMap,
} from '../command-window/TransformFixtures';

const TODAY = DateTime.now().startOf('day');

export const ONE_OR_MORE_NUMBERS = /\d+/g;

// USER SETTINGS, SHOULD EVENTUALLY BE A CONTEXT OBJECT I GUESS
// TODO: This should be in context, and also should be probably be imported from a functional component or passed as parameters to the function
const user_settings = {
  day_hard_start: '2021-01-01T08:00:00', // the date is arbitrary, this gets overwritten at some point
  day_hard_stop: '2021-01-01T21:00:00', // the date is arbitrary, this gets overwritten at some point
  default_block_duration: 60, // The number of minutes to find a block for a specific time, (i.e. "at 2:00 pm" will block out 2pm - 3pm)
  time_zone_offset: -7, // Offset from UTC
};

// Object that contains configs to be passed to DateTime.fromObject()
export const USER_SETTINGS_DATE_TIME_CONFIG = {
  hard_start_hours: { hour: 8 },
  hard_stop_hours: { hour: 21 },
};

export const USER_SETTINGS_DEFAULT_FILTERS = {
  duration: 60,
  startTime: DateTime.now().startOf('day').plus({ hours: 8 }),
  endTime: DateTime.now().startOf('day').plus({ hours: 21 }),
  range: [[DateTime.now().startOf('day')]], // TODO: This only shows today, maybe we should be showing the entire week?
};

export function chooseYearForDateFilter(day: number, month: number): number {
  const toCompareTo = DateTime.fromObject({ day, month });
  const now = DateTime.now().startOf('day');

  const year = toCompareTo < now ? now.year + 1 : now.year;
  return year;
}

// --------------- MODIFIER GROUP STUFF -------------- //
// Handles base case for all modifiers
export function generateDefaultFilterForModifier(
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

// Takes raw query pieces and groups them into modifier groups
export function extractModifierGroups(
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
      modifierGroups.push({
        prepositionPiece: null,
        modifierPiece: currentPiece,
      });
      i += 1;
    }
  }

  return modifierGroups;
}

// ---------------- NON PREPOSITION FILTER STUFF ------------ //

// Creates filter for duration modifiers
export function durationFilter(
  modifierPiece: ModifierPiece
): CalendarIndexFilter {
  // Extract number
  const multiplier = parseFloat(modifierPiece.value.match(/\d+\.?\d*/)[0]);

  // Get plain word
  const durationModifierString = modifierPiece.value
    .replace(/\d+\.?\d*/, '')
    .trim()
    .toLowerCase();

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

// Creates filter for duration modifiers
export function timeFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {
  const numbers: Array<string> = modifierPiece.value.match(ONE_OR_MORE_NUMBERS);
  const timeModifierString = modifierPiece.value
    .replace(ONE_OR_MORE_NUMBERS, '')
    .replace(':', '')
    .trim()
    .toLowerCase();

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
      if (hour >= 12) {
        //handles 12 pm
        start_time = default_time.set({ hour: hour, minute: minute });
      } else {
        start_time = default_time.set({ hour: hour + 12, minute: minute });
      }

      break;

    case 'AM':
      if (hour === 12) {
        start_time = default_time.set({ hour: 0, minute: minute });
      } else {
        start_time = default_time.set({ hour: hour, minute: minute });
      }

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

// Creates filter for date modifiers
export function dateFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {
  // Extract out string arg from date modifier (e.g. 15 February --> "February")
  const dateModifierStringArg = modifierPiece.value
    .replace(ONE_OR_MORE_NUMBERS, '')
    .replace('/', '')
    .trim()
    .toLowerCase();

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

export function rangeFilter(modifierPiece: ModifierPiece): CalendarIndexFilter {
  const rangeModifierString = modifierPiece.value
    .replace(ONE_OR_MORE_NUMBERS, '')
    .trim()
    .toLowerCase();

  return {
    range: _generateRangeArrays(rangeModifierString),
    startTime: null,
    endTime: null,
    duration: null,
  };
}

// ---------------- NON PREPOSITION FILTER STUFF ------------ //

// Changes an existing filter based on preposition actions
export function applyPrepositionActionToFilter(
  preposition: PrepositionPiece,
  modifier: ModifierPiece,
  filter: CalendarIndexFilter
): CalendarIndexFilter {
  let finalFilter: CalendarIndexFilter;
  switch (modifier.category) {
    case ModifierCategory.DURATION:
      // Do nothing interesting
      finalFilter = filter;
      break;

    case ModifierCategory.TIME:
      switch (preposition.value.toLowerCase()) {
        case 'at':
          finalFilter = filter;
          break;
        case 'after':
          // check if it contains numbers
          if (modifier.value.match(ONE_OR_MORE_NUMBERS)) {
            finalFilter = {
              ...filter,
              endTime: DateTime.fromISO(user_settings.day_hard_stop),
            };
            break;
          } else {
            finalFilter = {
              ...filter,
              startTime: filter.endTime,
              endTime: DateTime.fromISO(user_settings.day_hard_stop),
            };
            break;
          }
        case 'before':
          finalFilter = {
            ...filter,
            startTime: DateTime.fromISO(user_settings.day_hard_start),
            endTime: filter.startTime,
          };
          break;
        case 'this':
          // We have to modify the range in this case
          finalFilter = {
            ...filter,
            range: _generateRangeArrays('today'),
          };
          break;
        default:
          assert(
            false,
            'we have some other preposition that is not allowed for a time modifier'
          );
      }
      break;

    case ModifierCategory.DATE:
      switch (preposition.value.toLowerCase()) {
        case 'this':
          // take first occurence
          finalFilter = {
            ...filter,
            range: [filter.range[0]],
          };
          break;
        case 'first': // TODO: Handle this, it isnt going to work. We want 'first monday in july' but currently "july" will return us july and "first monday" will give us just the next monday from today
          // take first occurence
          finalFilter = {
            ...filter,
            range: [filter.range[0]],
          };
          break;
        case 'on':
          // take first occurence
          finalFilter = {
            ...filter,
            range: [filter.range[0]],
          };
          break;
        case 'next':
          // Are we dealing with a series of dates or just one
          if (filter.range.length > 1) {
            // If the first occurence is today, show the second occurence
            if (TODAY == filter.range[0][0]) {
              finalFilter = {
                ...filter,
                range: [filter.range[1]],
              };
              break;
            }

            // If first occurence is before the next monday (its this week), show both first and second
            let startOfNextWeek = DateTime.now()
              .startOf('week')
              .plus({ weeks: 1 });

            if (filter.range[0][0] < startOfNextWeek) {
              finalFilter = {
                ...filter,
                range: [filter.range[0], filter.range[1]],
              };
            } else {
              finalFilter = {
                ...filter,
                range: [filter.range[1]],
              };
            }
            break;
          } else {
            // Since we only have one filter value, do nothing interesting
            finalFilter = filter;
            break;
          }
        case 'week of':
          // grab first occurence
          let weekStart = filter.range[0][0].startOf('week');

          // Grab next 7 days
          finalFilter = {
            ...filter,
            range: [_generateNextNDays(weekStart, 7)],
          };
      }
      break;

    case ModifierCategory.RANGE:
      // Find the number if it exists
      const numbers: Array<string> =
        modifier.value.match(ONE_OR_MORE_NUMBERS) ?? [];

      // We have a number
      if (numbers.length > 0) {
        const number = parseFloat(numbers[0]);
        switch (preposition.value.toLowerCase()) {
          case 'this':
            {
              finalFilter = {
                ...filter,
                range: filter.range.slice(0, number),
              };
            }
            break;
          case 'next':
            {
              let i = 0;
              while (i < filter.range.length) {
                const currentRangeBlock = filter.range[i];
                if (
                  TODAY <= currentRangeBlock[currentRangeBlock.length - 1] &&
                  TODAY >= currentRangeBlock[0]
                ) {
                  finalFilter = {
                    ...filter,
                    range: filter.range.slice(i + 1, i + 1 + number),
                  };
                  break;
                }
                i += 1;
              }
            }
            break;
          case 'in': {
            // TODO: Decide if this is sufficient. We are not actualyl skippnig forward a certain number of days, we are finding the nth occurence of a "week" or "month", etc
            finalFilter = {
              ...filter,
              range: [filter.range[number]],
            };
            break;
          }
          default: {
            assert(
              false,
              'We have a number but cant do our preposition with a range modifier'
            );
          }
        }
      } else {
        switch (preposition.value.toLowerCase()) {
          case 'this':
            {
              finalFilter = {
                ...filter,
                range: [filter.range[0]],
              };
            }
            break;
          case 'next':
            {
              if (
                filter.range.length > 1 &&
                filter.range[0].filter((dateTime: DateTime) =>
                  dateTime.equals(TODAY)
                ).length === 1
              ) {
                // if (filter.range.length > 1 && filter.range[0].includes(TODAY)) {
                finalFilter = {
                  ...filter,
                  range: [filter.range[1]],
                };
              } else {
                finalFilter = {
                  ...filter,
                  range: [filter.range[0]],
                };
              }
            }
            break;
          case 'in':
            {
              let i = 0;
              while (i < filter.range.length) {
                const currentRangeBlock = filter.range[i];
                if (
                  TODAY <= currentRangeBlock[currentRangeBlock.length - 1] &&
                  TODAY >= currentRangeBlock[0]
                ) {
                  finalFilter = {
                    ...filter,
                    range: [currentRangeBlock],
                  };
                  break;
                }
                if (TODAY < currentRangeBlock[0]) {
                  finalFilter = {
                    ...filter,
                    range: [currentRangeBlock],
                  };
                  break;
                }
                i += 1;
              }
            }
            break;
          default:
            assert(
              false,
              'We have no number but cant do our preposition with a range modifier'
            );
        }
      }

      break;

    default:
      assert(false, 'wtff');
  }

  return finalFilter;
}

// -------------------- FILTER HELPERS -------------- //

// Creates a range of numDays days following (including) an initial date. Agnostic as to what that date is
// Returns them all as one array, meant to be a single block of range
export function _generateNextNDays(
  date: DateTime,
  numDays: number
): Array<DateTime> {
  let ranges = [];
  let i = 0;
  while (i < numDays) {
    ranges.push(date.plus({ days: i }));
    i += 1;
  }

  return ranges;
}

// TODO: make sure this actually works ?
export function _chooseYearForDateFilter(day: number, month: number): number {
  const toCompareTo = DateTime.fromObject({ day, month });
  const now = TODAY;

  const year = toCompareTo < now ? now.year + 1 : now.year;
  return year;
}

export function _generateRangeArrays(
  rangeString: string
): Array<Array<DateTime>> {
  // Strip out the s from the end of some plurals
  if (rangeString[rangeString.length - 1] == 's') {
    rangeString = rangeString.slice(0, rangeString.length - 1);
  }

  const actionType = modifierStringToRangeGeneratorMap[rangeString];

  const rangeArrays = [];
  const now = DateTime.now();
  let baseDate: DateTime;

  switch (actionType) {
    case 'WEEKDAY': {
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
      break;
    }
    case 'WEEK': {
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
      break;
    }
    case 'WEEKEND': {
      // find the next saturday, unless today is sunday or saturday

      /* if (now.weekday == 6 || now.weekday == 7) {
        baseDate = now.startOf('week').plus({ days: 5 });
      } else {
        baseDate = now.plus({ weeks: 1 }).startOf('week').plus({ days: 5 });
      } */

      // Basedate should now be the first saturday we want to add
      baseDate = now.startOf('week').plus({ days: 5 });
      let i = 0;
      while (i < 365) {
        let rangeArray: Array<DateTime> = [];
        rangeArray.push(baseDate.plus({ days: i }));
        rangeArray.push(baseDate.plus({ days: i + 1 }));

        rangeArrays.push(rangeArray);

        i += 7;
      }
      break;
    }
    case 'MONTH': {
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
      break;
    }

    case 'YEAR': {
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
      break;
    }

    case 'DAY': {
      // Grab the next 100 days (since 3 digit numbers are not allowed)
      let i = 0;
      baseDate = now.startOf('day');

      while (i < 100) {
        rangeArrays.push([baseDate.plus({ days: i })]);
        i += 1;
      }
      break;
    }

    case 'MONTH_NAME': {
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
      break;
    }

    case 'TODAY': {
      baseDate = now.startOf('day');
      rangeArrays.push([baseDate]);
      break;
    }

    case 'TOMORROW': {
      baseDate = now.plus({ days: 1 }).startOf('day');
      rangeArrays.push([baseDate]);
      break;
    }

    case 'YESTERDAY': {
      baseDate = now.minus({ days: 1 }).startOf('day');
      rangeArrays.push([baseDate]);
      break;
    }

    default:
      assert(false, `Somehow we dont have an action type: ${actionType}`);
  }

  return rangeArrays;
}
