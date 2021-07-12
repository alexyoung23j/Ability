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





export const calendarDummyResults = {
  days: [
    {
      calendar_date: '2021-06-09',
      hard_start: '2021-06-09T08:00:00-07:00',
      hard_end: '2021-06-09T21:10:00-07:00',
      free_blocks: [
        {
          start_time: '2021-06-09T13:00:00-07:00',
          end_time: '2021-06-09T16:00:00-07:00',
          free_slots: [
            {
              start_time: '2021-06-09T13:00:00-07:00',
              end_time: '2021-06-09T14:00:00-07:00',
            },
            {
              start_time: '2021-06-09T14:00:00-07:00',
              end_time: '2021-06-09T15:00:00-07:00',
            },
            {
              start_time: '2021-06-09T15:00:00-07:00',
              end_time: '2021-06-09T16:00:00-07:00',
            },
           
          ]
        },
        {
          start_time: '2021-06-09T18:00:00-07:00',
          end_time: '2021-06-09T21:00:00-07:00',
          free_slots: [
            {
              start_time: '2021-06-09T18:00:00-07:00',
              end_time: '2021-06-09T19:00:00-07:00',
            },
            {
              start_time: '2021-06-09T19:00:00-07:00',
              end_time: '2021-06-09T20:00:00-07:00',
            },
            {
              start_time: '2021-06-09T20:00:00-07:00',
              end_time: '2021-06-09T21:00:00-07:00',
            },
          ]
        },
      ],
      events: [
        {
          start_time: '2021-06-09T11:00:00-07:00',
          end_time: '2021-06-09T13:30:00-07:00',
          title: 'Company All Hands',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'red',
          calendar: {
            name: "Alex's Calendar",
            color: "red"
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-06-09T11:30:00-07:00',
          end_time: '2021-06-09T12:30:00-07:00',
          title: 'Hidden Event',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'green',
          calendar: {
            name: "Alex's Calendar 2",
            color: "blue"
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-06-09T16:10:00-07:00',
          end_time: '2021-06-09T18:00:00-07:00',
          title: 'Meeting w/ James',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'blue',
          calendar: {
            name: "Alex's Calendar 3",
            color: "blue"
          },
          index_of_overlapped_events: [],
        },
     
      ],
    },
    {
      calendar_date: '2021-06-10',
      hard_start: '2021-06-10T08:00:00-07:00',
      hard_end: '2021-06-10T21:10:00-07:00',
      free_blocks: [
        {
          start_time: '2021-06-10T13:00:00-07:00',
          end_time: '2021-06-10T16:00:00-07:00',
          free_slots: [
            {
              start_time: '2021-06-109T13:00:00-07:00',
              end_time: '2021-06-10T14:00:00-07:00',
            },
            {
              start_time: '2021-06-10T14:00:00-07:00',
              end_time: '2021-06-10T15:00:00-07:00',
            },
            {
              start_time: '2021-06-10T15:00:00-07:00',
              end_time: '2021-06-10T16:00:00-07:00',
            },
           
          ]
        },
        {
          start_time: '2021-06-10T18:00:00-07:00',
          end_time: '2021-06-10T21:00:00-07:00',
          free_slots: [
            {
              start_time: '2021-06-10T18:00:00-07:00',
              end_time: '2021-06-10T19:00:00-07:00',
            },
            {
              start_time: '2021-06-10T19:00:00-07:00',
              end_time: '2021-06-10T20:00:00-07:00',
            },
            {
              start_time: '2021-06-10T20:00:00-07:00',
              end_time: '2021-06-10T21:00:00-07:00',
            },
          ]
        },
      ],
      events: [
        {
          start_time: '2021-06-10T16:10:00-07:00',
          end_time: '2021-06-10T18:00:00-07:00',
          title: 'Meeting w/ James',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'blue',
          calendar: {
            name: "Alex's Calendar 3",
            color: "blue"
          },
          index_of_overlapped_events: [],
        },
     
      ],
    },
  
  ],
};