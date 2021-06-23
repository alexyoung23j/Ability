import {
  ModifierCategory,
  ModifierPiece,
  QueryPieceType,
} from './autocomplete/types';

export const ALL_MODIFIER_CATEGORIES = [
  ModifierCategory.TIME,
  ModifierCategory.DURATION,
  ModifierCategory.DATE,
  ModifierCategory.RANGE
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
      calendar_date: '2021-12-30',
      hard_start: '2021-06-09T08:00:00Z',
      hard_end: '2021-06-09T21:00:00Z',
      free_blocks: [
        {
          start_time: '2021-06-09T13:00:00Z',
          end_time: '2021-06-09T16:00:00Z',
          free_slots: [
            {
              start_time: '2021-06-09T13:00:00Z',
              end_time: '2021-06-09T14:00:00Z',
            },
            {
              start_time: '2021-06-09T14:00:00Z',
              end_time: '2021-06-09T15:00:00Z',
            },
            {
              start_time: '2021-06-09T15:00:00Z',
              end_time: '2021-06-09T16:00:00Z',
            },
           
          ]
        },
        {
          start_time: '2021-06-09T18:00:00Z',
          end_time: '2021-06-09T21:00:00Z',
          free_slots: [
            {
              start_time: '2021-06-09T18:00:00Z',
              end_time: '2021-06-09T19:00:00Z',
            },
            {
              start_time: '2021-06-09T19:00:00Z',
              end_time: '2021-06-09T20:00:00Z',
            },
            {
              start_time: '2021-06-09T20:00:00Z',
              end_time: '2021-06-09T21:00:00Z',
            },
          ]
        },
      ],
      events: [
        {
          start_time: '2021-06-09T10:00:00Z',
          end_time: '2021-06-09T11:45:00Z',
          title: 'Company All Hands',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'red',
        },
        {
          start_time: '2021-06-09T11:50:00Z',
          end_time: '2021-06-09T12:45:00Z',
          title: 'Lunch',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'red',
        },
        {
          start_time: '2021-06-09T16:00:00Z',
          end_time: '2021-06-09T18:00:00Z',
          title: 'Meeting w/ James',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'blue',
        },
      ],
    },
   
    
    
    
  
  ],
};