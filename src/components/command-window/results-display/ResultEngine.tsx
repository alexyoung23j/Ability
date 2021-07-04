import React, { useState, useEffect } from 'react';
import { useImmer } from "use-immer";
import CalendarView from './calendar_display/CalendarView';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { textSnippet } from '../../../types';
import { ContentState } from 'draft-js';
import { calendarDummyResults } from '../constants';
import { generateIntervals, roundToNearestInterval, CalculateFreeBlocks, HydrateOverlapEvents } from '../../util/CalendarUtil';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
const { DateTime } = require("luxon");


// pick a date util library
import DateFnsUtils from '@date-io/date-fns';
const dropdownArrowNormal = require('/src/content/svg/DropdownArrowNormal.svg');
const dropdownArrowHighlight = require('/src/content/svg/DropdownArrowHighlight.svg');
const redirect = require('/src/content/svg/Redirect.svg');



var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function ResultEngine() {
  // We recieve state from the calendar index query. This is the final time we query the calendar index.
  // Further changes to the data, and its relationship to the text snippet engine, all occur in ResultEngine state
  // effectively modifying our copy of the initial query. 
  // In general, we prefer to only REMOVE items from the result. 

  // State
  const [calendarResultData, setCalendarResultData] = useImmer(calendarDummyResults)
  const [ignoreSlots, setIgnoreSlots] = useState([])
  const [textEngineLaunched, setTextEngineLaunched] = useState(false)

  // ----------------------------------- CALLBACKS ----------------------------------- //

  // Handles the creation of our array that stores the free_slots that we plan to ignore when creating the text
  // The text engine will set some initial slot state, then we can remove or add to it via the UI
  // Index of the form [x, y, z] where x = day_idx, y = free_block idx, z = free_slot idx
  const updateIgnoredSlots = (index: number[], action: string) => {
    if (action === "remove") {
      setIgnoreSlots([...ignoreSlots, index])
    } else if (action === "add-back") {
      let newSlots = ignoreSlots.filter(slot => JSON.stringify(slot) != JSON.stringify(index))
      setIgnoreSlots(newSlots)
    }
  }

  useEffect(() => {
    //myConsole.log("updated: ", calendarResultData.days[0].events)
    //myConsole.log("here: ",
  }, [calendarResultData])

  

  // Handles new events, makes API call to create them in the calendar, and updates local results to change ui
  const scheduleNewEvent = (start_time: string, end_time: string, title: string, url: string, color: string, day_idx: number) => {
    // TODO: Need to actually do the scheduling here with the calendar API

    // Find position to insert into events
    const newEventStartTime = DateTime.fromISO(start_time)
    const newEventEndTime = DateTime.fromISO(end_time)

    // Copy events into variable for manipulation in this funciton
    let events = JSON.parse(JSON.stringify(calendarResultData.days[day_idx].events))

    let insertIdx = 0
    
    // Insert Event into correct position (by START time, as is convention for events)
    while (insertIdx < events.length) {
      const eventStartTime = DateTime.fromISO(events[insertIdx].start_time)

      if (newEventStartTime < eventStartTime) {
        break
      }
      insertIdx += 1
    }

    // Add the event into our local copy of the events
    events.splice(insertIdx, 0, {
      start_time: start_time,
      end_time: end_time,
      title: title,
      url: url,
      color: color,
      index_of_overlapped_events: []
    })


    // Reset the overlaps 
    events = HydrateOverlapEvents(events)

    // Update the events array
    setCalendarResultData(draft => {
      draft.days[day_idx].events = events
    })

    // Update the free blocks to reflect change
    setCalendarResultData(draft => {
      draft.days[day_idx].free_blocks = CalculateFreeBlocks(draft.days[day_idx].hard_start, draft.days[day_idx].hard_end, 60, 60, 30, events)
    })
  }

  




  // ---------------------------- DUMMY ------------------------- //
  // Filler for the text snippet (replace with the real values)
  var myContentState1 = ContentState.createFromText(
    'Would any of the following times work for you? \n\nTuesday 3/18 - 4:00 PM, 5:00 PM, or 6:30 PM\n\nI think a one hour meeitng would be great and oh that is just so fucking cool im looking forward to it'
  );
  var myContentState2 = ContentState.createFromText(
    'Would any of the following times work for you?'
  );

  let textSnippetArray: textSnippet[];
  textSnippetArray = [
    { content: myContentState1, id: '1', title: 'email' },
    { content: myContentState2, id: '2', title: 'slack' },
  ];

  
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <div style={{display: "flex", flexDirection: "column"}}>
            <CalendarView 
              calendar_data={calendarResultData} 
              ignoreHandler={updateIgnoredSlots} 
              ignoredSlots={ignoreSlots}
              textEngineLaunched={textEngineLaunched}
              scheduleNewEvent={scheduleNewEvent}
            />
            <Scheduler textEngineLaunched={textEngineLaunched} setTextEngineLaunched={setTextEngineLaunched}/>
            {textEngineLaunched && (<TextSnippetDropdown snippetPayload={textSnippetArray} />)}
          </div>
    </MuiPickersUtilsProvider>
    
  );
}

// Button for opening up the text engine
function Scheduler(props: {textEngineLaunched, setTextEngineLaunched}) {

  const {textEngineLaunched, setTextEngineLaunched} = props;

  const color = textEngineLaunched === true ? "rgb(125, 189, 220)" : "#7D7D7D"

  const arrowToDisplay = textEngineLaunched === true ? dropdownArrowHighlight : dropdownArrowNormal


  return (
    <div
      style={{display: "flex", alignItems: "center", marginTop: "15px", marginBottom: "20px"}}
    >
      <div
        onClick={() => setTextEngineLaunched(!textEngineLaunched)}
        style={{cursor: "pointer", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}
      >
        <div 
          style={{color: color, marginLeft: "35px", marginRight: "10px"}}
          className="launchTextEngineText"
        >
          scheduler
        </div>
        <img src={arrowToDisplay} style={{height: "8px", width: "8px"}}/>
      </div>
      <img src={redirect} style={{height: "16px", marginLeft: "430px"}}/>
      
    </div>
  )
}

