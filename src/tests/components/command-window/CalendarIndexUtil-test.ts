import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import { DateTime } from 'luxon';

import { EVENT_1A, EVENT_1B, EVENT_2A, EVENT_3A } from '../../EventsFixtures';
import * as CalendarIndexUtil from '../../../components/command-window/CalendarIndexUtil';

chai.use(dirtyChai);

const { start: EVENT_START, end: EVENT_END } = EVENT_1A;

describe('CalendarIndexUtil', () => {
  it('splits multi-day events', () => {
    const numDays = 4;
    const multiDayEvent = {
      ...EVENT_1A,
      start: { dateTime: DateTime.now().toISO() },
      end: { dateTime: DateTime.now().plus({ days: numDays }).toISO() },
    };
    const splitEvents = CalendarIndexUtil.splitMultiDayEvent(multiDayEvent);

    expect(splitEvents).length(numDays + 1);

    // Verify first event
    expect(splitEvents[0].start.dateTime).equal(multiDayEvent.start.dateTime);
    expect(splitEvents[0].end.dateTime).equal(
      DateTime.fromISO(multiDayEvent.start.dateTime).endOf('day').toISO()
    );

    // Verify middle events
    for (let i = 1; i < numDays; i++) {
      expect(splitEvents).length(numDays + 1);
      expect(splitEvents[i].start.dateTime).equal(
        DateTime.fromISO(multiDayEvent.start.dateTime)
          .plus({ days: i })
          .startOf('day')
          .toISO()
      );
      expect(splitEvents[i].end.dateTime).equal(
        DateTime.fromISO(multiDayEvent.start.dateTime)
          .plus({ days: i })
          .endOf('day')
          .toISO()
      );
    }

    // Verify last event
    expect(splitEvents[numDays].start.dateTime).equal(
      DateTime.fromISO(multiDayEvent.end.dateTime).startOf('day').toISO()
    );
    expect(splitEvents[numDays].end.dateTime).equal(multiDayEvent.end.dateTime);
  });

  it.only('calculates position in calendar index based on date and date at position 0', () => {
    const today = DateTime.now();
    expect(CalendarIndexUtil._mapDateToIndex(today)).equal(0);
    expect(CalendarIndexUtil._mapDateToIndex(today.plus({ days: 1 }))).equal(1);
    expect(CalendarIndexUtil._mapDateToIndex(today.plus({ days: 5 }))).equal(5);

    // Index 0 is yesterday
    expect(
      CalendarIndexUtil._mapDateToIndex(
        today.plus({ days: 5 }),
        today.minus({ days: 1 })
      )
    ).equal(6);

    expect(() =>
      CalendarIndexUtil._mapDateToIndex(today.plus({ days: 400 }))
    ).throws();
  });

  it.only('generates a valid calendar index', () => {
    const event1 = {
      ...EVENT_1A,
      start: { dateTime: DateTime.now().toISO() },
      end: { dateTime: DateTime.now().plus({ hours: 2 }).toISO() },
    };

    const event2 = {
      ...EVENT_1A,
      start: { dateTime: DateTime.now().plus({ days: 100 }).toISO() },
      end: { dateTime: DateTime.now().plus({ days: 100, hours: 2 }).toISO() },
    };

    const multiDayEvent = {
      ...event1,
      start: {
        dateTime: DateTime.fromISO(event1.start.dateTime)
          .plus({ hours: 1 })
          .toISO(),
      },
      end: {
        dateTime: DateTime.fromISO(event1.start.dateTime)
          .plus({ days: 4 })
          .toISO(),
      },
    };

    const mockCalsAndEvents = [
      {
        calendarId: '',
        allEvents: [event1, multiDayEvent, event2],
      },
    ];

    const calendarIndex =
      CalendarIndexUtil.parseCalendarApiResponse(mockCalsAndEvents);
    expect(calendarIndex).length(365);

    // event1 & Part 1 / 5 of multiDayEvent
    expect(calendarIndex[0].events).length(2);

    // Full day (Part 2 / 5) for multiDayEvent
    expect(calendarIndex[1].events).length(1);

    // event2
    expect(calendarIndex[100].events).length(1);

    // Empty for other days with no events
    expect(calendarIndex[101].events).length(0);
  });
});
