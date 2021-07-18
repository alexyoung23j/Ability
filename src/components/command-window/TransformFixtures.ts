import {
  ModifierCategory,
  ModifierPiece,
  Piece,
  PrepositionPiece,
  QueryPieceType,
} from './types';

import { PREPOSITION_FIXTURES } from './AutocompleteFixtures';
import { DateTime } from 'luxon';

export const DEFAULT_PREPOSITION_LIBRARY = {
  DURATION: PREPOSITION_FIXTURES[0], // "for"
  TIME: PREPOSITION_FIXTURES[1], // "at"
  DATE: PREPOSITION_FIXTURES[4], // "this"
  RANGE: PREPOSITION_FIXTURES[4], // "this"
};

export const DurationModifiersDurationMap = {
  hour: 60,
  hours: 60,
  mins: 1,
  minutes: 1,
  min: 1,
  minute: 1,
};

export const MonthToMonthIndexMap = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

// TODO: Maybe should make these start and end time markers be a type or somethin
export const TimeModifierStartAndEndMap = {
  morning: {
    start_time: 'HARD_START',
    end_time: '2021-01-01T12:00:00',
  },
  evening: {
    start_time: '2021-01-01T17:00:00', // Choose 5 pm arbitrarily
    end_time: 'HARD_STOP',
  },
  afternoon: {
    start_time: '2021-01-01T12:00:00',
    end_time: '2021-01-01T17:00:00', // Choose 5 pm arbitrarily
  },
  night: {
    start_time: '2021-01-01T19:00:00', // Choose 7 pm arbitrarily
    end_time: 'HARD_STOP',
  },
  noon: {
    start_time: '2021-01-01T12:00:00', // Choose 7 pm arbitrarily
    end_time: 'IMPLIED',
  },
  pm: {
    start_time: 'PM', // Indicates that time we find will be a time in PM
    end_time: 'IMPLIED',
  },
  am: {
    start_time: 'AM', // Indicates that time we find will be a time in AM
    end_time: 'IMPLIED',
  },
};
