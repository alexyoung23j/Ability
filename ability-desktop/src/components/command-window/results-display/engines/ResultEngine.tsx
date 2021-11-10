import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { useContext, useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import {
  CalculateFreeBlocks,
  HydrateOverlapEvents,
} from '../../../util/command-view-util/CalendarViewUtil';
import { demo1ArrayOfSnippets } from '../../../../constants/old-constants';
import {
  AbilityCalendar,
  RegisteredAccount,
} from '../../../../constants/types';
import CalendarView from '../calendar-display/calendar-body/CalendarView';
import TextEngine from './TextEngine';
import { generateTimeZoneObjects } from '../../../util/command-view-util/TextEngineUtil';
import { RegisteredAccountToCalendarsContext } from 'components/AllContextProvider';
const { DateTime } = require('luxon');

const dropdownArrowNormal = require('/src/content/svg/DropdownArrowNormal.svg');
const dropdownArrowHighlight = require('/src/content/svg/DropdownArrowHighlight.svg');
const redirect = require('/src/content/svg/Redirect.svg');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export type FreeBlock = any;
export interface CalendarResultEvent {
  start_time: string;
  end_time: string;
  title: string;
  url: string;
  color: string;
  calendar: AbilityCalendar;
  index_of_overlapped_events: Array<number>;
  isAllDayEvent: boolean;
}

export interface CalendarResultDay {
  calendar_date: string;
  hard_start: string;
  hard_end: string;
  free_blocks: Array<FreeBlock>;
  events: Array<CalendarResultEvent>;
}
export interface CalendarResultData {
  days: Array<CalendarResultDay>;
  minDuration: number;
}

interface ResultEngineProps {
  calendarResultData: CalendarResultData;
}

export default function ResultEngine(props: ResultEngineProps) {
  // We recieve state from the calendar index query. This is the final time we query the calendar index.
  // Further changes to the data, and its relationship to the text snippet engine, all occur in ResultEngine state
  // effectively modifying our copy of the initial query.
  // In general, we prefer to only REMOVE items from the result.

  // TODO: Replace with calendars from DB/context
  // These are the calendars the user has access to. The selectedForDisplay values are based on the most recent changes to the settings?
  const registeredAccountToCalendars = useContext(
    RegisteredAccountToCalendarsContext
  )?.registeredAccountToCalendars;

  const fetchedCalendars = Object.keys(registeredAccountToCalendars ?? {}).map(
    (accountEmail) => ({
      accountEmail,
      calendars: registeredAccountToCalendars![accountEmail].map(
        (calendar) => ({
          ...calendar,
          selectedForDisplay: true,
        })
      ),
    })
  );

  // TODO: Determine if this is the best way to do this
  const [calendarResultData, setCalendarResultData] = useImmer(
    props.calendarResultData
  ); // The Raw, unfiltered Result Data that contains every event from every calendar
  const [filteredCalendarData, setFilteredCalendarData] = useImmer(
    props.calendarResultData
  ); // The filtered result data that screens out events from calendars that are not selected for display
  const [calendarAccounts, setCalendarAccounts] =
    useImmer<Array<RegisteredAccount>>(fetchedCalendars); // The copy of the calendar accounts we keep in state. This gets updated, though updating the default settings is not yet included
  const [ignoreSlots, setIgnoreSlots] = useState([]); // The free slots that get ignored by the text engine
  const [textEngineLaunched, setTextEngineLaunched] = useState(false); // Defines if our text engine is launched
  const [initialIgnoredSlotsSet, setInitialIgnoredSlotSet] = useState(false);

  let textSnippetArray = demo1ArrayOfSnippets[0]; // DUMMY: The text snippets

  // Checks if an event is part of a calendar that is selected for display
  function _IsSelected(name: string, googleAccount: string) {
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

  function _findIdxInUnfilteredData(day_idx, event_idx) {
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

  // Sets the slots to be all ignored when we first open the text engine
  useEffect(() => {
    if (textEngineLaunched) {
      let slotsToIgnore = [];
      for (
        var day_idx = 0;
        day_idx < filteredCalendarData.days.length;
        day_idx += 1
      ) {
        const blocks = filteredCalendarData.days[day_idx].free_blocks;
        for (var block_idx = 0; block_idx < blocks.length; block_idx += 1) {
          const slots =
            filteredCalendarData.days[day_idx].free_blocks[block_idx]
              .free_slots;
          for (var slot_idx = 0; slot_idx < slots.length; slot_idx += 1) {
            slotsToIgnore.push([day_idx, block_idx, slot_idx]);
          }
        }
      }
      setIgnoreSlots(slotsToIgnore);
    }
  }, [filteredCalendarData]);

  useEffect(() => {
    if (textEngineLaunched) {
      setInitialIgnoredSlotSet(true);
    } else {
      setInitialIgnoredSlotSet(false);
    }
  }, [ignoreSlots]);

  // Listen for updates to the unfiltered data, the accounts, and the text engine launch status
  useEffect(() => {
    // If text engine launched, make intervals 1 hour
    UpdateFilteredData();
  }, [textEngineLaunched, calendarResultData, calendarAccounts]);

  // When raw unfiltered data changes, update the free slots on the filtered data
  // Also makes the interval size between free slots larger when the text engine is launched to simplify UI and text generation
  function UpdateFilteredData() {
    setFilteredCalendarData((draft) => {
      // TODO: this is probably inefficient
      for (let i = 0; i < calendarResultData.days.length; i++) {
        let currentDay = calendarResultData.days[i];

        let validEvents: Array<CalendarResultEvent> = [];

        for (const event of currentDay.events) {
          let eventCalendar = event.calendar;

          if (
            _IsSelected(eventCalendar.name, eventCalendar.accountEmail) &&
            !event.isAllDayEvent
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

  // ----------------------------------- CALLBACKS ----------------------------------- //

  // Handles the creation of our array that stores the free_slots that we plan to ignore when creating the text
  // The text engine will set some initial slot state, then we can remove or add to it via the UI
  // Index of the form [x, y, z] where x = day_idx, y = free_block idx, z = free_slot idx
  const updateIgnoredSlots = (index: number[], action: string): void => {
    if (action === 'remove') {
      setIgnoreSlots([...ignoreSlots, index]);
    } else if (action === 'add-back') {
      let newSlots = ignoreSlots.filter(
        (slot) => JSON.stringify(slot) != JSON.stringify(index)
      );
      setIgnoreSlots(newSlots);
    }
  };

  // Checks if two times are on the same day
  function isSameDay(time, originalTime) {
    const newTime = DateTime.fromISO(time);
    const oldTime = DateTime.fromISO(originalTime);

    return newTime.ordinal == oldTime.ordinal && newTime.year == oldTime.year;
  }

  const deleteEvent = (
    start_time: string,
    end_time: string,
    title: string,
    url: string,
    calendar: AbilityCalendar,
    day_idx: number,
    orig_event_idx: number
  ): void => {
    // TODO: Delete Event Instance with Calendar API

    let event_idx = _findIdxInUnfilteredData(day_idx, orig_event_idx);

    // Save a copy of the original events (from which this event originated)
    const origDayIdx = day_idx;
    let origEvents = JSON.parse(
      JSON.stringify(calendarResultData.days[origDayIdx].events)
    );

    // Remove the event from our list of events
    origEvents.splice(event_idx, 1);

    // Recalculate the Overlaps
    origEvents = HydrateOverlapEvents(origEvents);

    // Update local calendar data
    setCalendarResultData((draft) => {
      draft.days[origDayIdx].events = origEvents;
    });

    setCalendarResultData((draft) => {
      draft.days[origDayIdx].free_blocks = CalculateFreeBlocks(
        draft.days[origDayIdx].hard_start,
        draft.days[origDayIdx].hard_end,
        60,
        60,
        30,
        origEvents
      );
    });
  };

  // Handles new events, makes API call to create them in the calendar, and updates local results to change ui
  const scheduleNewEvent = (
    start_time: string,
    end_time: string,
    title: string,
    url: string,
    calendar: AbilityCalendar,
    day_idx: number
  ): void => {
    // TODO: Need to actually do the scheduling here with the calendar API

    // Find position to insert into events
    const newEventStartTime = DateTime.fromISO(start_time);
    const newEventEndTime = DateTime.fromISO(end_time);

    // Check which day we should be identifying
    if (
      !isSameDay(start_time, calendarResultData.days[day_idx].calendar_date)
    ) {
      let idx = 0;

      while (
        idx < calendarResultData.days.length &&
        !isSameDay(start_time, calendarResultData.days[idx].calendar_date)
      ) {
        idx += 1;
      }

      // Either update the day idx or end the function call
      if (idx > calendarResultData.days.length - 1) {
        return;
      } else {
        day_idx = idx;
      }
    }

    // Copy events into variable for manipulation in this funciton
    let events = JSON.parse(
      JSON.stringify(calendarResultData.days[day_idx].events)
    );

    let insertIdx = 0;

    // Insert Event into correct position (by START time, as is convention for events)
    while (insertIdx < events.length) {
      const eventStartTime = DateTime.fromISO(events[insertIdx].start_time);

      if (newEventStartTime < eventStartTime) {
        break;
      }
      insertIdx += 1;
    }

    // Add the event into our local copy of the events
    events.splice(insertIdx, 0, {
      start_time: start_time,
      end_time: end_time,
      title: title,
      url: url,
      color: calendar.color,
      calendar: calendar,
      index_of_overlapped_events: [],
    });

    // Reset the overlaps
    events = HydrateOverlapEvents(events);

    // Update the events array
    setCalendarResultData((draft) => {
      draft.days[day_idx].events = events;
    });

    // Update the free blocks to reflect change
    setCalendarResultData((draft) => {
      draft.days[day_idx].free_blocks = CalculateFreeBlocks(
        draft.days[day_idx].hard_start,
        draft.days[day_idx].hard_end,
        60,
        60,
        30,
        events
      );
    });
  };

  // Modifies information for some existing event
  const modifyExistingEvent = (
    start_time: string,
    end_time: string,
    title: string,
    url: string,
    calendar: AbilityCalendar,
    day_idx: number,
    orig_event_idx: number
  ) => {
    // TODO: Need to actually do the scheduling here with the calendar API

    let event_idx = _findIdxInUnfilteredData(day_idx, orig_event_idx);

    // Find position to insert into events
    const newEventStartTime = DateTime.fromISO(start_time);
    const newEventEndTime = DateTime.fromISO(end_time);

    // Save a copy of the original events (from which this event originated)
    const origDayIdx = day_idx;
    let origEvents = JSON.parse(
      JSON.stringify(calendarResultData.days[origDayIdx].events)
    );

    // Check which day we should be identifying
    if (
      !isSameDay(start_time, calendarResultData.days[day_idx].calendar_date)
    ) {
      // Update the original day by removing the event
      origEvents.splice(event_idx, 1);

      let idx = 0;

      while (
        idx < calendarResultData.days.length &&
        !isSameDay(start_time, calendarResultData.days[idx].calendar_date)
      ) {
        idx += 1;
      }

      // Either update the day idx or end the function call
      if (idx > calendarResultData.days.length - 1) {
        // Our new day is outside the visible range, so update our original day and exit
        origEvents = HydrateOverlapEvents(origEvents);

        setCalendarResultData((draft) => {
          draft.days[origDayIdx].events = origEvents;
        });

        setCalendarResultData((draft) => {
          draft.days[origDayIdx].free_blocks = CalculateFreeBlocks(
            draft.days[origDayIdx].hard_start,
            draft.days[origDayIdx].hard_end,
            60,
            60,
            30,
            origEvents
          );
        });

        return;
      } else {
        day_idx = idx;
      }
    }

    // Copy events into variable for manipulation in this funciton
    let events = JSON.parse(
      JSON.stringify(calendarResultData.days[day_idx].events)
    );

    // Remove the original event from our copy

    if (day_idx == origDayIdx) {
      events.splice(event_idx, 1);
    }

    let insertIdx = 0;

    // Insert Event into correct position (by START time, as is convention for events). We do this because modifying the event time might change the order
    while (insertIdx < events.length) {
      const eventStartTime = DateTime.fromISO(events[insertIdx].start_time);

      if (newEventStartTime < eventStartTime) {
        break;
      }
      insertIdx += 1;
    }

    // Add the event into our local copy of the events
    events.splice(insertIdx, 0, {
      start_time: start_time,
      end_time: end_time,
      title: title,
      url: url,
      color: calendar.color,
      calendar,
      index_of_overlapped_events: [],
    });

    // Reset the overlaps
    events = HydrateOverlapEvents(events);

    setCalendarResultData((draft) => {
      draft.days[day_idx].events = events;
    });

    // Update the free blocks to reflect change
    setCalendarResultData((draft) => {
      draft.days[day_idx].free_blocks = CalculateFreeBlocks(
        draft.days[day_idx].hard_start,
        draft.days[day_idx].hard_end,
        60,
        60,
        30,
        events
      );
    });

    // Fix the original day
    if (day_idx != origDayIdx) {
      origEvents = HydrateOverlapEvents(origEvents);

      setCalendarResultData((draft) => {
        draft.days[origDayIdx].events = origEvents;
      });

      setCalendarResultData((draft) => {
        draft.days[origDayIdx].free_blocks = CalculateFreeBlocks(
          draft.days[origDayIdx].hard_start,
          draft.days[origDayIdx].hard_end,
          60,
          60,
          30,
          origEvents
        );
      });
    }
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <CalendarView
          calendarData={calendarResultData}
          ignoreHandler={updateIgnoredSlots}
          ignoredSlots={ignoreSlots}
          textEngineLaunched={textEngineLaunched}
          scheduleNewEvent={scheduleNewEvent}
          modifyExistingEvent={modifyExistingEvent}
          deleteEvent={deleteEvent}
          filteredCalendarData={filteredCalendarData}
          calendarAccounts={calendarAccounts}
          setCalendarAccounts={setCalendarAccounts}
        />
        <Scheduler
          textEngineLaunched={textEngineLaunched}
          setTextEngineLaunched={setTextEngineLaunched}
          ignoreHandler={updateIgnoredSlots}
          setIgnoreSlots={setIgnoreSlots}
          calendar_data={filteredCalendarData}
        />
        {textEngineLaunched && initialIgnoredSlotsSet && (
          <TextEngine
            ignoredSlots={ignoreSlots}
            calendar_data={filteredCalendarData}
            timeZoneObjectList={generateTimeZoneObjects()}
          />
        )}
      </div>
    </MuiPickersUtilsProvider>
  );
}

// Button for opening up the text engine
function Scheduler(props: {
  textEngineLaunched;
  setTextEngineLaunched;
  ignoreHandler;
  setIgnoreSlots;
  calendar_data;
}) {
  const {
    textEngineLaunched,
    setTextEngineLaunched,
    ignoreHandler,
    setIgnoreSlots,
    calendar_data,
  } = props;

  const className =
    textEngineLaunched === true
      ? 'launchTextEngineTextLaunched'
      : 'launchTextEngineTextStandard';

  const arrowToDisplay =
    textEngineLaunched === true ? dropdownArrowHighlight : dropdownArrowNormal;

  function launchTextEngine() {
    // Set Every Slot to be ignored (we want you to add in the slots you like)

    if (textEngineLaunched) {
      setIgnoreSlots([]);
    }

    // Launch Engine
    setTextEngineLaunched(!textEngineLaunched);
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '15px',
        marginBottom: '20px',
      }}
    >
      <div
        onClick={() => launchTextEngine()}
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{ marginLeft: '35px', marginRight: '10px' }}
          className={className}
        >
          scheduler
        </div>
        <img src={arrowToDisplay} style={{ height: '8px', width: '8px' }} />
      </div>
      <img src={redirect} style={{ height: '16px', marginLeft: '430px' }} />
    </div>
  );
}
