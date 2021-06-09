import React, { useState } from 'react';
import CalendarView from './calendar_display/CalendarView';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { textSnippet } from '../../../types';
import { ContentState } from 'draft-js';
import { calendarDummyResults } from '../constants';



export default function ResultEngine() {
  // dummy calendar index query response
  const [calendarResultData, setCalendarResultData] = useState(calendarDummyResults)
  const [ignoreSlots, setIgnoreSlots] = useState({})

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
    <div>
      <CalendarView calendar_data={calendarResultData} setIgnoreSlots={setIgnoreSlots}/>
      <TextSnippetDropdown snippetPayload={textSnippetArray} />
    </div>
  );
}
