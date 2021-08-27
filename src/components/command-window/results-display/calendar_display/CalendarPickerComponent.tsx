import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { DatePicker, KeyboardDatePicker } from '@material-ui/pickers';
import { createMuiTheme } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { Overrides } from '@material-ui/core/styles/overrides';
import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';
import { Multiselect } from 'multiselect-react-dropdown';
import CalendarPickerPopup from './CalendarPickerPopup';
import { Calendar } from '../../types';
const miniCalendar = require('/src/content/svg/MiniCalendarIcon.svg');
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarPickerProps {
  eventCalendar: Calendar;
  setEventCalendar: any;
}
export default function CalendarPickerComponent(props: CalendarPickerProps) {
  // TODO: Add access to context containing the calendar information
  const calendars: Array<Calendar> = [
    {
      name: "Alex's Personal Calendar",
      color: '#33b679',
      googleAccount: 'testAccount1@gmail.com',
      selectedForDisplay: true,
    },
    {
      name: 'Work Calendar',
      color: 'blue',
      googleAccount: 'testAccount1@gmail.com',
      selectedForDisplay: true,
    },
    {
      name: 'Calendar 3',
      color: 'pink',
      googleAccount: 'testAccount1@gmail.com',
      selectedForDisplay: true,
    },
  ];

  const { eventCalendar, setEventCalendar } = props;

  // State
  const [textColor, setTextColor] = useState('#7D7D7D');
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  return (
    <div
      style={{
        marginLeft: '5px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={miniCalendar} style={{ height: '13px', width: '13px' }} />
      <div
        style={{ marginLeft: '10px', color: textColor, cursor: 'pointer' }}
        onMouseEnter={() => setTextColor('rgb(125, 189, 220)')}
        onMouseLeave={() => setTextColor('#7D7D7D')}
        onClick={() => setShowCalendarPicker(true)}
        className="eventModalCalendarText"
      >
        {eventCalendar.name}
      </div>
      <div
        style={{
          marginLeft: '10px',
          width: '8px',
          height: '8px',
          borderRadius: '20px',
          backgroundColor: eventCalendar.color,
        }}
      ></div>

      {showCalendarPicker && (
        <CalendarPickerPopup
          isOpen={showCalendarPicker}
          setIsOpen={setShowCalendarPicker}
          calendars={calendars}
          eventCalendar={eventCalendar}
          setEventCalendar={setEventCalendar}
        />
      )}
    </div>
  );
}
