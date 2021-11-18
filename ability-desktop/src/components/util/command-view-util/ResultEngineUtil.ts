import {
  CalendarResultData,
  CalendarResultEvent,
} from 'components/command-window/results-display/engines/ResultEngine';
import { CalculateFreeBlocks } from './CalendarViewUtil';
import { RegisteredAccount } from 'constants/types';
import { Updater } from 'use-immer';
import { DateTime } from 'luxon';

// Checks if an event is part of a calendar that is selected for display
export function _IsSelected(
  name: string,
  googleAccount: string,
  calendarAccounts
) {
  for (const group of calendarAccounts) {
    for (const calendar of group.calendars) {
      if (
        group.accountEmail === googleAccount &&
        calendar.name === name &&
        calendar.selectedForDisplay
      ) {
        return true;
      }
    }
  }
  return false;
}

// Finds the index of a
export function _findIdxInUnfilteredData(
  day_idx: number,
  event_idx: number,
  filteredCalendarData: CalendarResultData,
  calendarResultData: CalendarResultData
): number {
  // Grab data to identify the event we are looking for
  const { start_time, end_time, title, url } =
    filteredCalendarData.days[day_idx].events[event_idx];

  for (let i = 0; i < calendarResultData.days[day_idx].events.length; i++) {
    let potentialMatch = calendarResultData.days[day_idx].events[i];

    if (
      potentialMatch.start_time == start_time &&
      potentialMatch.end_time == end_time &&
      potentialMatch.title == title &&
      potentialMatch.url == url
    ) {
      return i;
    }
  }

  return -1;
}

// When raw unfiltered data changes, update the free slots on the filtered data
// Also makes the interval size between free slots larger when the text engine is launched to simplify UI and text generation
export function UpdateFilteredData(
  setFilteredCalendarData: Updater<CalendarResultData>,
  calendarResultData: CalendarResultData,
  calendarAccounts: Array<RegisteredAccount>,
  textEngineLaunched: boolean,
  setIgnoreSlots: React.Dispatch<React.SetStateAction<number[]>>
) {
  setFilteredCalendarData((draft) => {
    // TODO: this is probably inefficient
    for (let i = 0; i < calendarResultData.days.length; i++) {
      let currentDay = calendarResultData.days[i];

      let validEvents: Array<CalendarResultEvent> = [];

      for (const event of currentDay.events) {
        let eventCalendar = event.calendar;

        if (
          !event.isAllDayEvent &&
          _IsSelected(
            eventCalendar.name,
            eventCalendar.accountEmail,
            calendarAccounts
          )
        ) {
          validEvents.push(event);
        }
      }

      draft.days[i].events = validEvents;
    }
  });

  if (textEngineLaunched) {
    setFilteredCalendarData((draft) => {
      for (var i = 0; i < calendarResultData.days.length; i++) {
        draft.days[i].free_blocks = CalculateFreeBlocks(
          draft.days[i].hard_start,
          draft.days[i].hard_end,
          draft.minDuration,
          60,
          60,
          draft.days[i].events
        );
      }
    });
  } else {
    // if text engine not launched, make intervals 30 minutes
    setIgnoreSlots([]);
    setFilteredCalendarData((draft) => {
      for (var i = 0; i < calendarResultData.days.length; i++) {
        draft.days[i].free_blocks = CalculateFreeBlocks(
          draft.days[i].hard_start,
          draft.days[i].hard_end,
          draft.minDuration,
          60,
          30,
          draft.days[i].events
        );
      }
    });
  }
}

// Checks if two times are on the same day
export function isSameDay(time, originalTime) {
  const newTime = DateTime.fromISO(time);
  const oldTime = DateTime.fromISO(originalTime);

  return newTime.ordinal == oldTime.ordinal && newTime.year == oldTime.year;
}
