import { QueryPieceType } from '../../types';
import { ModifierCategory, ModifierPiece } from './TreeNode';

export const ALL_MODIFIER_CATEGORIES = [
  ModifierCategory.TIME,
  ModifierCategory.DURATION,
  ModifierCategory.DATE,
];

export const DATE_MODIFIERS = ['tomorrow', 'today'];

const DATE_PIECES: Array<ModifierPiece> = [
  {
    value: 'tomorrow',
    category: ModifierCategory.DATE,
    type: QueryPieceType.MODIFIER,
  },
  {
    value: 'tomorrow',
    category: ModifierCategory.DATE,
    type: QueryPieceType.MODIFIER,
  },
];

const PREPOSITIONS = ['on', 'next'];

const prepositionToModifierCategories = {
  on: ModifierCategory.DATE,
  next: ModifierCategory.DATE,
  //   at: ModifierCategory.HOUR,
  for: ModifierCategory.DURATION,
};

// DATE: [days, week]
// TIME: [hour]
//

// at <TIME>
// after <TIME> / <DATE>
// for <DURATION>
// next <DATE> /
// on
// this
// in (after from now)
//

// duration --> range

// on Sunday
//

// at Sunday - NOT ALLOWED
// at 3 pm
// at noon
// at afternoon (ew)
//

export const calendarDummyResults = {
  days: [
    {
      calendar_date: '2021-06-09',
      hard_start: '2021-06-09T08:15:00Z',
      hard_end: '2021-06-09T20:45:00Z',
      free_blocks: [
        {
          start_time: '2021-06-09T12:00:00Z',
          end_time: '2021-06-09T14:00:00Z',
          free_slots: [
            {
              start_time: '2021-06-09T12:00:00Z',
              end_time: '2021-06-09T13:00:00Z',
            },
            {
              start_time: '2021-06-09T12:30:00:00Z',
              end_time: '2021-06-09T13:30:00Z',
            },
            {
              start_time: '2021-06-09T13:00:00:00Z',
              end_time: '2021-06-09T14:00:00Z',
            },
          ]
        },
        {
          start_time: '2021-06-09T19:00:00Z',
          end_time: '2021-06-09T20:45:00Z',
          free_slots: [
            {
              start_time: '2021-06-09T19:00:00Z',
              end_time: '2021-06-09T20:00:00Z',
            },
            {
              start_time: '2021-06-09T19:45:00Z',
              end_time: '2021-06-09T20:45:00Z',
            },

          ]
        },
      ],
      events: [
        {
          start_time: '2021-06-09T03:00:00Z',
          end_time: '2021-06-09T05:30:00Z',
          title: 'Event 1',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'red',
        },
        {
          start_time: '2021-06-09T10:00:00Z',
          end_time: '2021-06-09T11:45:00Z',
          title: 'Event 1',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'red',
        },
        {
          start_time: '2021-06-09T16:00:00Z',
          end_time: '2021-06-09T19:00:00Z',
          title: 'Event 2',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'blue',
        },
      ],
    },
  ],
};