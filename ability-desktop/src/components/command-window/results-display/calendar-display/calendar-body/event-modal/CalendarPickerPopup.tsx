import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { AnimationType } from 'framer-motion/types/render/utils/types';
const { DateTime } = require('luxon');
import { generatePickerTimeOptions } from '../../../../../util/command-view-util/CalendarViewUtil';
import { AbilityCalendar } from '../../../../../../constants/types';
import { Color } from '@material-ui/core';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarPickerPopupProps {
  isOpen: boolean;
  setIsOpen: any;
  calendars: Array<AbilityCalendar>;
  eventCalendar: AbilityCalendar;
  setEventCalendar: any;
}

export default function CalendarPickerPopup(props: CalendarPickerPopupProps) {
  const { isOpen, setIsOpen, calendars, eventCalendar, setEventCalendar } =
    props;

  return (
    <div style={pickerAreaStyles} onClick={() => setIsOpen(false)}>
      <div style={pickerStyle}>
        {calendars.map((calendar, idx) => (
          <div key={idx}>
            <CalendarOption
              color={calendar.color}
              name={calendar.name}
              setEventCalendar={setEventCalendar}
              eventCalendar={calendar}
              setIsOpen={setIsOpen}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface CalendarOptionProps {
  color: string;
  name: string;
  setEventCalendar: (eventCalendar: AbilityCalendar) => void;
  eventCalendar: AbilityCalendar;
  setIsOpen: any;
}

function CalendarOption(props: CalendarOptionProps) {
  const { color, name, setEventCalendar, eventCalendar, setIsOpen } = props;

  let initialColor =
    eventCalendar.name === name
      ? 'rgb(125, 189, 220)'
      : 'rgba(172, 170, 170, 1)';
  const [textColor, setTextColor] = useState(initialColor);

  function handleClick(e) {
    e.stopPropagation();

    setEventCalendar(eventCalendar);
    setIsOpen(false);
  }

  return (
    <div
      onClick={(e) => handleClick(e)}
      onMouseEnter={() => setTextColor('rgb(125, 189, 220)')}
      onMouseLeave={() => {
        // Only change the color if it isnt the selected value
        if (initialColor != 'rgb(125, 189, 220)') {
          setTextColor('rgba(172, 170, 170, 1)');
        }
      }}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '5px',
        marginRight: '5px',
        marginTop: '5px',
        marginBottom: '5px',
      }}
    >
      <div
        style={{
          marginLeft: '0px',
          width: '8px',
          height: '8px',
          borderRadius: '20px',
          backgroundColor: color,
        }}
      ></div>
      <div
        className="calendarPopupText"
        style={{
          color: textColor,
          height: '15px',
          marginLeft: '10px',
          marginRight: '10px',
        }}
      >
        {name.slice(0, 20)}
      </div>
    </div>
  );
}

const pickerStyle: CSS.Properties = {
  position: 'relative',
  boxShadow: '0 0 100px rgba(0,0,0, 0.17)',
  borderRadius: '5px',
  minWidth: '100px',
  maxHeight: '75px',
  marginLeft: '-200px',
  marginTop: '-90px',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexDirection: 'column',
  overflowY: 'auto',
};

const pickerAreaStyles: CSS.Properties = {
  position: 'absolute',
  width: '420px',
  marginTop: '200px',
  marginLeft: '240px',
  minHeight: '430px',
  backgroundColor: 'rgba(211,211,123,0.0)',
  zIndex: 100,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};
