import CSS from 'csstype';
import React from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarView {
  calendar_data: any;
  ignoreHandler: any;
  ignoredSlots: Array<Array<number>>
}

export default function CalendarView(props: CalendarView) {
  const { calendar_data, ignoreHandler, ignoredSlots } = props;

  return (
    <div style={calendarViewStyle}>
      <CalendarHeader />
      <CalendarBody calendar_data={calendar_data} ignoreHandler={ignoreHandler} ignoredSlots={ignoredSlots}/>
    </div>
  );
}

const calendarViewStyle: CSS.Properties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
};
