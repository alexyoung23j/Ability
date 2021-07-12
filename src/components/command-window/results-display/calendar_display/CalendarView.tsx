import CSS from 'csstype';
import React from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarView {
  calendar_data: any;
  ignoreHandler: any;
  ignoredSlots: Array<Array<number>>;
  textEngineLaunched: boolean;
  scheduleNewEvent: any
  modifyExistingEvent: any
}

export default function CalendarView(props: CalendarView) {
  const { calendar_data, ignoreHandler, ignoredSlots, textEngineLaunched, scheduleNewEvent, modifyExistingEvent } = props;

  return (
    <div style={calendarViewStyle}>
      <CalendarHeader 
        calendar_data={calendar_data}
        showButtons={true} // Whether we allow user to skip forward or not 

      />
      <CalendarBody 
        calendar_data={calendar_data} 
        ignoreHandler={ignoreHandler} 
        ignoredSlots={ignoredSlots}
        textEngineLaunched={textEngineLaunched}
        scheduleNewEvent={scheduleNewEvent}
        modifyExistingEvent={modifyExistingEvent}
      />
    </div>
  );
}

const calendarViewStyle: CSS.Properties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
};
