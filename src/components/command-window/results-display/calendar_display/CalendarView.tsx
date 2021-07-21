import CSS from 'csstype';
import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';
import { Calendar } from '../../types';
import { useImmer } from 'use-immer';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarView {
  calendar_data: any;
  ignoreHandler: any;
  ignoredSlots: Array<Array<number>>;
  textEngineLaunched: boolean;
  scheduleNewEvent: any;
  modifyExistingEvent: any;
}

export default function CalendarView(props: CalendarView) {
  const {
    calendar_data,
    ignoreHandler,
    ignoredSlots,
    textEngineLaunched,
    scheduleNewEvent,
    modifyExistingEvent,
  } = props;

  const fetched_calendars: Array<Calendar> = [];

  const [calendarPickerLaunched, setCalendarPickerLaunched] = useState(false);
  const [calendars, setCalendars] =
    useImmer<Array<Calendar>>(fetched_calendars); // TODO: This should be fetched from context or something

  return (
    <div style={calendarViewStyle}>
      <CalendarHeader
        calendar_data={calendar_data}
        showButtons={true} // Whether we allow user to skip forward or not
        calendarPickerLaunched={calendarPickerLaunched}
        setCalendarPickerLaunched={setCalendarPickerLaunched}
      />
      <CalendarBody
        calendar_data={calendar_data}
        ignoreHandler={ignoreHandler}
        ignoredSlots={ignoredSlots}
        textEngineLaunched={textEngineLaunched}
        scheduleNewEvent={scheduleNewEvent}
        modifyExistingEvent={modifyExistingEvent}
      />

      {calendarPickerLaunched && (
        <CalendarPickerModal
          calendars={calendars}
          setCalendarPickerLaunched={setCalendarPickerLaunched}
        />
      )}
    </div>
  );
}

function CalendarPickerModal(props: {
  calendars: Array<Calendar>;
  setCalendarPickerLaunched: any;
}) {
  const { calendars, setCalendarPickerLaunched } = props;
  return <div style={CalendarPickerModalStyle}></div>;
}

const calendarViewStyle: CSS.Properties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
};

const CalendarPickerModalAreaStyle: CSS.Properties = {
  position: 'absolute',
  width: '900px',
  minHeight: '500px',
  marginRight: '300px',
  backgroundColor: 'rgba(211,211,211,0.0)',
  zIndex: 60,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const CalendarPickerModalStyle: CSS.Properties = {
  minWidth: '220px',
  minHeight: '300px',
  maxHeight: '300px',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 0 100px rgba(0,0,0, 0.3)',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexDirection: 'column',
  paddingLeft: '20px',
  marginBottom: '0px',
  marginRight: '770px',
  position: 'absolute',
  zIndex: 70,
};
