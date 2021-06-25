import React, { useState, useEffect } from 'react';
import { useImmer } from "use-immer";
import CalendarView from './calendar_display/CalendarView';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { textSnippet } from '../../../types';
import { ContentState } from 'draft-js';
import { calendarDummyResults } from '../constants';
import { generateIntervals, roundToNearestInterval, CalculateFreeBlocks } from '../../util/CalendarUtil';
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
    myConsole.log("here: ",CalculateFreeBlocks(calendarResultData.days[0].hard_start, calendarResultData.days[0].hard_end, 60, 60, 30, calendarResultData.days[0].events))
  }, [calendarResultData])

  

  // Handles new events, makes API call to create them in the calendar, and updates local results to change ui
  const scheduleNewEvent = (start_time: string, end_time: string, title: string, url: string, color: string, day_idx: number) => {
    // TODO: Need to actually do the scheduling here

    // We need to update the events, the free blocks, and the free slots
    // For events, we just need to add the new event 
    // For free blocks, we need to recalculate the edges, and then change the free slots to reflect that.

    // Find position to insert into events
    const newEventStartTime = new Date(start_time).getTime()
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
    let updates = []
    
    for (let i = 0; i < freeBlocks.length; i++) {
      const block = freeBlocks[i]
      const blockStartTime = new Date(block.start_time).getTime()
      const blockEndTime = new Date(block.end_time).getTime()


      if (blockStartTime <= newEventStartTime && blockEndTime >= newEventEndTime) {
        

      } else if (blockStartTime < newEventEndTime && newEventEndTime < blockEndTime) {
          // New event starts before a block and ends within it

          // TODO: change to to allow for prop to dictate the minimum size of a free block; here defualting to 60 minutes
          const newFreeSlots = generateIntervals(end_time, block.end_time, 30, 60, true)        

          const update = {index: i, free_slots: newFreeSlots, start_time: roundToNearestInterval(new Date(end_time), 30, true).toISOString(), end_time: block.end_time, action: "MODIFY"}
          updates.push(update)
          
      } else if (blockStartTime < newEventStartTime && newEventStartTime < blockEndTime) {
        // New Event starts in a block and ends after it
        // TODO: change to to allow for prop to dictate the minimum size of a free block; here defualting to 60 minutes
          const newFreeSlots = generateIntervals(block.start_time, start_time, 30, 60, true)        

          const update = {index: i, free_slots: newFreeSlots, start_time: roundToNearestInterval(new Date(block.start_time), 30, true).toISOString(), end_time: start_time, action: "MODIFY"}
          updates.push(update)

      } else if (blockStartTime >= newEventStartTime && blockEndTime <= newEventEndTime) {
        // New Event completely covers a free slot
        const update = {index: i, free_slots: [], start_time: "", end_time: "", action: "REMOVE"}
        updates.push(update)
      }
    }

    performBatchBlockUpdate({updates: updates, day_idx: day_idx})

  }


function performBatchBlockUpdate(props: {updates: Array<{index: number, free_slots: any, start_time: string, end_time: string, action: string}>, day_idx: number}) {

  const {updates, day_idx} = props
  
  setCalendarResultData(draft => {

    let indexOffset = 0

    updates.map(({index, free_slots, start_time, end_time, action}) => {
      if (action == "MODIFY") {
        draft.days[day_idx].free_blocks[index-indexOffset] = {
          start_time: start_time,
          end_time: end_time,
          free_slots: free_slots
        }
      } else if (action == "REMOVE") {
        draft.days[day_idx].free_blocks.splice(index-indexOffset, 1)
        indexOffset+=1
      }
    })
    
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

