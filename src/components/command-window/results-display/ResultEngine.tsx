import React, { useState, useEffect } from 'react';
import { useImmer } from 'use-immer';
import CalendarView from './calendar_display/CalendarView';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { textSnippet } from '../../../types';
import { ContentState } from 'draft-js';
import {
  calendarDummyResults,
  demoPart1Results,
  demo1ArrayOfSnippets,
  part2SnippetArray,
  demoPart2Results,
  demoPart3Results,
} from '../constants';
import {
  generateIntervals,
  roundToNearestInterval,
  CalculateFreeBlocks,
  HydrateOverlapEvents,
} from '../../util/CalendarUtil';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
const { DateTime } = require('luxon');

// pick a date util library
import DateFnsUtils from '@date-io/date-fns';
import { Piece } from '../autocomplete/types';
const dropdownArrowNormal = require('/src/content/svg/DropdownArrowNormal.svg');
const dropdownArrowHighlight = require('/src/content/svg/DropdownArrowHighlight.svg');
const redirect = require('/src/content/svg/Redirect.svg');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface ResultEngineProps {
  // TODO: create an actual type for this
  calendarResultData: any;
}

export default function ResultEngine(props: ResultEngineProps) {
  // We recieve state from the calendar index query. This is the final time we query the calendar index.
  // Further changes to the data, and its relationship to the text snippet engine, all occur in ResultEngine state
  // effectively modifying our copy of the initial query.
  // In general, we prefer to only REMOVE items from the result.

  // State
  // TODO: use the prop instead of state
  const [calendarResultData, setCalendarResultData] =
    useImmer(demoPart1Results);
  const [ignoreSlots, setIgnoreSlots] = useState([]);
  const [textEngineLaunched, setTextEngineLaunched] = useState(false);
  const [demoSnippetIdx, setDemoSnippetIdx] = useState(0);

  // ----------------------------------- CALLBACKS ----------------------------------- //

  // Handles the creation of our array that stores the free_slots that we plan to ignore when creating the text
  // The text engine will set some initial slot state, then we can remove or add to it via the UI
  // Index of the form [x, y, z] where x = day_idx, y = free_block idx, z = free_slot idx
  const updateIgnoredSlots = (index: number[], action: string) => {
    if (action === 'remove') {
      setIgnoreSlots([...ignoreSlots, index]);
    } else if (action === 'add-back') {
      let newSlots = ignoreSlots.filter(
        (slot) => JSON.stringify(slot) != JSON.stringify(index)
      );
      setIgnoreSlots(newSlots);
    }
  };

  // Just for demoing
  /* useEffect(() => {
    if (ignoreSlots.length > 0) {
      setDemoSnippetIdx((demoSnippetIdx + 1) % 3)
    }
    
  }, [ignoreSlots]) */

  // This useeffect makes the interval size between free slots larger when the text engine is launched to simplify UI and text generation
  // Note that this means the Ignored Slots apply only to the "post engine launch" free slots
  useEffect(() => {
    // If text engine launched, make intervals 1 hour
    if (textEngineLaunched) {
      setCalendarResultData((draft) => {
        for (var i = 0; i < calendarResultData.days.length; i++) {
          draft.days[i].free_blocks = CalculateFreeBlocks(
            draft.days[i].hard_start,
            draft.days[i].hard_end,
            60,
            60,
            60,
            draft.days[i].events
          );
        }
      });
    } else {
      // if text engine not launched, make intervals 30 minutes
      setIgnoreSlots([]);
      setCalendarResultData((draft) => {
        for (var i = 0; i < calendarResultData.days.length; i++) {
          console.log(draft.days[i]);
          draft.days[i].free_blocks = CalculateFreeBlocks(
            draft.days[i].hard_start,
            draft.days[i].hard_end,
            60,
            60,
            30,
            draft.days[i].events
          );
        }
      });
    }
  }, [textEngineLaunched]);

  // Checks if two times are on the same day
  function isSameDay(time, originalTime) {
    const newTime = DateTime.fromISO(time);
    const oldTime = DateTime.fromISO(originalTime);

    return newTime.ordinal == oldTime.ordinal && newTime.year == oldTime.year;
  }

  // Handles new events, makes API call to create them in the calendar, and updates local results to change ui
  const scheduleNewEvent = (
    start_time: string,
    end_time: string,
    title: string,
    url: string,
    color: string,
    calendar_name: string,
    calendar_color: string,
    day_idx: number
  ) => {
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
      color: color,
      calendar: {
        name: calendar_name,
        color: calendar_color,
      },
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
    color: string,
    calendar_name: string,
    calendar_color: string,
    day_idx: number,
    event_idx: number
  ) => {
    // TODO: Need to actually do the scheduling here with the calendar API

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
      color: color,
      calendar: {
        name: calendar_name,
        color: calendar_color,
      },
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

  // ---------------------------- DUMMY ------------------------- //
  // Filler for the text snippet (replace with the real values)
  /*  var myContentState1 = ContentState.createFromText(
    'Would any of the following times work for you? \n\nTuesday 3/18 - 4:00 PM, 5:00 PM, or 6:30 PM\n\nI think a one hour meeitng would be great and oh that is just so fucking cool im '
  );
  var myContentState2 = ContentState.createFromText(
    'Would any of the following times work for you? 👍'
  );

  let textSnippetArray: textSnippet[];
  textSnippetArray = [
    { content: myContentState1, id: '1', title: 'email' },
    { content: myContentState2, id: '2', title: 'slack' },
  ]; */

  let textSnippetArray = demo1ArrayOfSnippets[0];

  //let textSnippetArray=part2SnippetArray

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <CalendarView
          calendar_data={calendarResultData}
          ignoreHandler={updateIgnoredSlots}
          ignoredSlots={ignoreSlots}
          textEngineLaunched={textEngineLaunched}
          scheduleNewEvent={scheduleNewEvent}
          modifyExistingEvent={modifyExistingEvent}
        />
        <Scheduler
          textEngineLaunched={textEngineLaunched}
          setTextEngineLaunched={setTextEngineLaunched}
        />
        {textEngineLaunched && (
          <TextSnippetDropdown snippetPayload={textSnippetArray} />
        )}
      </div>
    </MuiPickersUtilsProvider>
  );
}

// Button for opening up the text engine
function Scheduler(props: { textEngineLaunched; setTextEngineLaunched }) {
  const { textEngineLaunched, setTextEngineLaunched } = props;

  const className =
    textEngineLaunched === true
      ? 'launchTextEngineTextLaunched'
      : 'launchTextEngineTextStandard';

  const arrowToDisplay =
    textEngineLaunched === true ? dropdownArrowHighlight : dropdownArrowNormal;

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
        onClick={() => setTextEngineLaunched(!textEngineLaunched)}
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
