import React, { useState, useEffect } from 'react';
import CalendarView from './calendar_display/CalendarView';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { textSnippet } from '../../../types';
import { ContentState } from 'draft-js';
import { calendarDummyResults } from '../constants';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function ResultEngine() {
  // dummy calendar index query response. This is the final time we query the calendar index.
  // Further changes to the data, and its relationship to the text snippet engine, all occur in ResultEngine state
  // effectively modifying our copy of the initial query. 

  // In general, we prefer to only REMOVE items from the result. 
  const [calendarResultData, setCalendarResultData] = useState(calendarDummyResults)
  const [ignoreSlots, setIgnoreSlots] = useState([])

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
    myConsole.log("ignored: ", ignoreSlots)
  }, [ignoreSlots])

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
      <CalendarView calendar_data={calendarResultData} ignoreHandler={updateIgnoredSlots}/>
      <TextSnippetDropdown snippetPayload={textSnippetArray} />
    </div>
  );
}
