import React, { useState, useEffect } from 'react';
import { useImmer } from "use-immer";
import CalendarView from './calendar_display/CalendarView';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { textSnippet } from '../../../types';
import { ContentState } from 'draft-js';
import { calendarDummyResults } from '../constants';
import { generateIntervals } from '../../util/CalendarUtil';
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


  const scheduleNewEvent = (start_time: string, end_time: string, title: string, url: string, color: string, day_idx: number) => {
    // TODO: Need to actually do the scheduling here

    // We need to update the events, the free blocks, and the free slots
    // For events, we just need to add the new event 
    // For free blocks, we need to recalculate the edges, and then change the free slots to reflect that.

    // Find position to insert into events
    const newEventStartTime = new Date(end_time).getTime()
    const newEventEndTime = new Date(end_time).getTime()
    const events = calendarResultData.days[day_idx].events 

    let insertIdx = 0
    
    while (insertIdx < events.length) {
      const eventEndTime = new Date(events[insertIdx].end_time).getTime()

      if (newEventEndTime < eventEndTime) {
        break
      }
      insertIdx += 1
    }

    // Update the events array
    setCalendarResultData(draft => {
      draft.days[day_idx].events.splice(insertIdx, 0, {
        start_time: start_time,
        end_time: end_time,
        title: title,
        url: url,
        color: color,
      })
    })

    const freeBlocks = calendarResultData.days[day_idx].free_blocks 
    
    for (let i = 0; i < freeBlocks.length; i++) {
      const block = freeBlocks[i]
      const blockStartTime = new Date(block.start_time).getTime()
      const blockEndTime = new Date(block.end_time).getTime()

      myConsole.log(blockStartTime)
      myConsole.log(generateIntervals(start_time, end_time, 30))

      if (blockStartTime <= newEventStartTime && blockEndTime >= newEventEndTime) {

      } else if (blockStartTime <= newEventStartTime) {
        // Block starts before; update block to start at end time (as long as block still is long enough). Then update the slots

        // ensure we start on the 30 min mark or the hour 
        

      } else if (blockEndTime >= newEventEndTime) {

      }
      


    }







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

