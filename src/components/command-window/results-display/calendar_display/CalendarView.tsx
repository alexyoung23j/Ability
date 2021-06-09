import CSS from 'csstype';
import React from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarView {
  calendar_data: any;
  setIgnoreSlots: any;
}

export default function CalendarView(props: CalendarView) {
  const { calendar_data, setIgnoreSlots } = props;

  const date_raw = calendar_data.days[0].calendar_date;
  const date = new Date(date_raw);

  return (
    <div style={calendarViewStyle}>
      <CalendarHeader />
      <CalendarBody calendar_data={calendar_data} />
    </div>
  );
}

const calendarViewStyle: CSS.Properties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
};
