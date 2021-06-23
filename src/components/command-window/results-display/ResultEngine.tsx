import React, { useState, useEffect } from 'react';
import CalendarView from './calendar_display/CalendarView';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { textSnippet } from '../../../types';
import { ContentState } from 'draft-js';
import { calendarDummyResults } from '../constants';
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
  const [calendarResultData, setCalendarResultData] = useState(calendarDummyResults)
  const [ignoreSlots, setIgnoreSlots] = useState([])
  const [textEngineLaunched, setTextEngineLaunched] = useState(false)

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

/*   useEffect(() => {
    myConsole.log("ignored: ", ignoreSlots)
  }, [ignoreSlots]) */

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

