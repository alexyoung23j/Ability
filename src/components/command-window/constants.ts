import { ContentState } from 'draft-js';

// ---------------------- Demo Video ------------------- //

// ------------- Part 1: "week of july 26 after 2 pm" -------- //

const emailContent1 = ContentState.createFromText(
  'Would any of the following times work for you? \n\nMonday 7/26: 3:00 PM, 5:00-7:00 PM \nTuesday 7/27: 5:00 PM \nWednesday 7/28: 7:00 PM \nThursday 7/27: 2:00 PM, 5:00-7:00 PM \nFriday 7/30: 3:00 PM, 5:00-6:00 PM \n\nLet me know what makes sense.'
);

const emailContent2 = ContentState.createFromText(
  'Would any of the following times work for you? \n\nMonday 7/26: 3:00 PM, 5:00-7:00 PM \nWednesday 7/28: 7:00 PM \nThursday 7/27: 2:00 PM, 5:00-7:00 PM \nFriday 7/30: 3:00 PM, 5:00-6:00 PM \n\nLet me know what makes sense. '
);

const emailContent3 = ContentState.createFromText(
  'Would any of the following times work for you? \n\nMonday 7/26: 3:00 PM, 5:00-7:00 PM \nThursday 7/27: 2:00 PM, 5:00-7:00 PM \nFriday 7/30: 3:00 PM, 5:00-6:00 PM \n\nLet me know what makes sense.'
);

const snippetArrayOne = [
  { content: emailContent1, id: '1', title: 'email' },
  { content: emailContent1, id: '1', title: 'slack' },
  { content: emailContent1, id: '1', title: 'personal' },
];

const snippetArrayTwo = [
  { content: emailContent2, id: '1', title: 'email' },
  { content: emailContent2, id: '1', title: 'slack' },
  { content: emailContent2, id: '1', title: 'personal' },
];

const snippetArrayThree = [
  { content: emailContent3, id: '1', title: 'email' },
  { content: emailContent3, id: '1', title: 'slack' },
  { content: emailContent3, id: '1', title: 'personal' },
];

export const demo1ArrayOfSnippets = [
  snippetArrayOne,
  snippetArrayTwo,
  snippetArrayThree,
];

export const demoPart1Results = {
  days: [
    {
      calendar_date: '2021-07-20',
      hard_start: '2021-07-26T14:00:00-07:00',
      hard_end: '2021-07-26T20:00:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-07-26T11:00:00-07:00',
          end_time: '2021-07-26T12:00:00-07:00',
          title: 'Team Standup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-26T13:00:00-07:00',
          end_time: '2021-07-26T15:00:00-07:00',
          title: 'Sprint Planning',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-26T16:00:00-07:00',
          end_time: '2021-07-26T17:00:00-07:00',
          title: 'Investor Call',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-26T19:00:00-07:00',
          end_time: '2021-07-26T19:45:00-07:00',
          title: 'Facetime w/ Fam',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#33b679',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
      ],
    },

    {
      calendar_date: '2021-07-27',
      hard_start: '2021-07-27T14:00:00-07:00',
      hard_end: '2021-07-27T20:00:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-07-27T13:00:00-07:00',
          end_time: '2021-07-27T15:00:00-07:00',
          title: 'Team Standup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-27T15:30:00-07:00',
          end_time: '2021-07-27T17:00:00-07:00',
          title: 'Company All Hands',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-27T18:00:00-07:00',
          end_time: '2021-07-27T20:00:00-07:00',
          title: 'Jiu Jitsu',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
      ],
    },
    {
      calendar_date: '2021-07-28',
      hard_start: '2021-07-28T14:00:00-07:00',
      hard_end: '2021-07-28T20:00:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-07-28T14:15:00-07:00',
          end_time: '2021-07-28T15:00:00-07:00',
          title: 'Team Standup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-28T15:30:00-07:00',
          end_time: '2021-07-28T18:00:00-07:00',
          title: 'Investor Calls',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-28T18:00:00-07:00',
          end_time: '2021-07-28T19:00:00-07:00',
          title: 'Jiu Jitsu',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
      ],
    },
    {
      calendar_date: '2021-07-29',
      hard_start: '2021-07-29T14:00:00-07:00',
      hard_end: '2021-07-29T20:00:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-07-29T11:00:00-07:00',
          end_time: '2021-07-29T12:00:00-07:00',
          title: 'Team Standup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-29T15:00:00-07:00',
          end_time: '2021-07-29T17:00:00-07:00',
          title: 'Investor Calls',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-29T19:00:00-07:00',
          end_time: '2021-07-29T19:45:00-07:00',
          title: 'Facetime w/ Fam',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#33b679',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
      ],
    },
    {
      calendar_date: '2021-07-30',
      hard_start: '2021-07-30T14:00:00-07:00',
      hard_end: '2021-07-30T20:00:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-07-30T11:00:00-07:00',
          end_time: '2021-07-30T12:00:00-07:00',
          title: 'Team Standup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-30T13:00:00-07:00',
          end_time: '2021-07-30T15:00:00-07:00',
          title: 'Sprint Planning',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-30T16:00:00-07:00',
          end_time: '2021-07-30T17:00:00-07:00',
          title: 'Investor Call',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-30T18:30:00-07:00',
          end_time: '2021-07-30T19:30:00-07:00',
          title: 'Facetime w/ Fam',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#33b679',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
      ],
    },
  ],
};

// ----------- Part 2: "afternoon this weekend for 2 hours" ------ //

// REMEMBER to change the demo to have min duration be 2 hours
const emailContentPart2 = ContentState.createFromText(
  'Would any of the following times work for you? \n\nSaturday 7/24: 1:00-4:00PM, 5:00-7:00 PM Sunday 7/25: 12:00-3:00 PM, 4:00-6:00 PM \n\nLet me know what makes sense.'
);

const personalContentPart2 = ContentState.createFromText(
  "I'm free Saturday the 24th from 1-4 or 5-7, and the following Sunday 12-3 or 4-6 😊"
);

export const part2SnippetArray = [
  { content: emailContentPart2, id: '1', title: 'email' },
  { content: emailContent1, id: '1', title: 'slack' },
  { content: personalContentPart2, id: '1', title: 'personal' },
];

export const demoPart2Results = {
  days: [
    {
      calendar_date: '2021-07-24',
      hard_start: '2021-07-24T12:00:00-07:00',
      hard_end: '2021-07-24T19:00:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-07-24T11:30:00-07:00',
          end_time: '2021-07-24T13:00:00-07:00',
          title: 'Yoga Class',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#33b679',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-24T16:00:00-07:00',
          end_time: '2021-07-24T17:00:00-07:00',
          title: 'Group Meetup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#33b679',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
      ],
    },
    {
      calendar_date: '2021-07-25',
      hard_start: '2021-07-25T12:00:00-07:00',
      hard_end: '2021-07-25T19:00:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-07-25T13:00:00-07:00',
          end_time: '2021-07-25T14:00:00-07:00',
          title: 'Group Meetup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#33b679',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-25T14:30:00-07:00',
          end_time: '2021-07-25T16:00:00-07:00',
          title: 'Group Meetup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#33b679',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
      ],
    },
  ],
};

//---------- Part 3: "tomorrow" ------ //
export const demoPart3Results = {
  days: [
    {
      calendar_date: '2021-07-23',
      hard_start: '2021-07-23T08:00:00-07:00',
      hard_end: '2021-07-23T20:00:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-07-23T10:00:00-07:00',
          end_time: '2021-07-23T11:00:00-07:00',
          title: 'Team Standup',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-23T12:00:00-07:00',
          end_time: '2021-07-23T13:00:00-07:00',
          title: 'Lunch w/ Kevin',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#33b679',
          calendar: {
            name: "Alex's Personal Calendar",
            color: '#33b679',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-23T14:00:00-07:00',
          end_time: '2021-07-23T15:30:00-07:00',
          title: 'Sprint Review',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#7986cb',
          calendar: {
            name: 'Work Calendar',
            color: '#7986cb',
          },
          index_of_overlapped_events: [],
        },
        {
          start_time: '2021-07-23T14:30:00-07:00',
          end_time: '2021-07-23T15:00:00-07:00',
          title: 'Onboarding Call',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: '#f5511d',
          calendar: {
            name: 'Marketing Team Calendar',
            color: '#f5511d',
          },
          index_of_overlapped_events: [],
        },
      ],
    },
  ],
};

export const calendarDummyResults = {
  days: [
    {
      calendar_date: '2021-06-09',
      hard_start: '2021-06-09T08:00:00-07:00',
      hard_end: '2021-06-09T21:10:00-07:00',
      free_blocks: [],
      events: [
        {
          start_time: '2021-06-09T11:00:00-07:00',
          end_time: '2021-06-09T13:30:00-07:00',
          title: 'Company All Hands',
          url: 'https://calendar.google.com/calendar/u/4/r/week/2021/6/10',
          color: 'red',
          calendar: {
            name: "Alex's Calendar",
            color: 'red',
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
            color: 'blue',
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
            color: 'blue',
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
          ],
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
          ],
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
            color: 'blue',
          },
          index_of_overlapped_events: [],
        },
      ],
    },
  ],
};
