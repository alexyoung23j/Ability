import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface DailyCalendarViewProps {
  calendar_data: any;
  selected_day_idx: number;
  selectedEventIdxInSelectedDay: number;
  setSelectedEventIdxInSelectedDay: any;
  setModalShow: any;
  setModalShowsNewEvent: any;
}

export default function DailyCalendarView(props: DailyCalendarViewProps) {
  const {
    calendar_data,
    selected_day_idx,
    selectedEventIdxInSelectedDay,
    setSelectedEventIdxInSelectedDay,
    setModalShow,
    setModalShowsNewEvent,
  } = props;

  return (
    <div style={{ marginLeft: '20px', marginRight: '20px', marginTop: '10px' }}>
      {calendar_data.days[selected_day_idx].events.map((event, idx) => (
        <div key={idx}>
          <HorizontalEvent
            event={event}
            selectedEventIdxInSelectedDay={selectedEventIdxInSelectedDay}
            setSelectedEventIdxInSelectedDay={setSelectedEventIdxInSelectedDay}
            index={idx}
            setModalShow={setModalShow}
            setModalShowsNewEvent={setModalShowsNewEvent}
          />
        </div>
      ))}
    </div>
  );
}

interface HorizontalEventProps {
  event: any;
  setSelectedEventIdxInSelectedDay: any;
  selectedEventIdxInSelectedDay: number;
  index: number;
  setModalShow: any;
  setModalShowsNewEvent: any;
}
function HorizontalEvent(props: HorizontalEventProps) {
  const {
    event,
    setSelectedEventIdxInSelectedDay,
    selectedEventIdxInSelectedDay,
    index,
    setModalShow,
    setModalShowsNewEvent,
  } = props;

  const [highlightColor, setHighlightColor] = useState('rgba(0,0,0,0)');

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '450px',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingTop: '10px',
        paddingBottom: '10px',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: highlightColor,
      }}
      onMouseEnter={() => setHighlightColor('#E9E9E9')}
      onMouseLeave={() => setHighlightColor('rgba(0,0,0,0)')}
      onClick={() => {
        setSelectedEventIdxInSelectedDay(index);
        setModalShowsNewEvent(false);
        setModalShow(true);
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100px',
        }}
      >
        <div>{_createTimeString(event.start_time)}</div>
      </div>

      <div
        style={{
          width: '7px',
          height: '7px',
          backgroundColor: event.calendar.color,
          borderRadius: '20px',
          marginRight: '20px',
        }}
      ></div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '250px',
        }}
      >
        <div>{event.title}</div>
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', width: '100px' }}
      >
        <div>{_createDurationString(event.start_time, event.end_time)}</div>
      </div>
    </div>
  );
}

function _createTimeString(timeString: string) {
  const time = DateTime.fromISO(timeString);

  let string = time.toLocaleString({
    hour: '2-digit',
    minute: '2-digit',
  });

  if (string[0] === '0') {
    return string.slice(1, string.length);
  } else {
    return string;
  }
}

function _createDurationString(startTime: string, endTime: string) {
  let start_time = DateTime.fromISO(startTime);
  let end_time = DateTime.fromISO(endTime);

  let duration = end_time.diff(start_time);

  let hours = parseFloat(duration.toFormat('h'));
  let minutes = parseFloat(duration.toFormat('m')) - 60 * hours;

  let resultString = '';
  if (hours >= 2) {
    resultString += hours.toString() + ' hrs ';
  } else if (hours >= 1) {
    resultString += hours.toString() + ' hr ';
  }

  if (minutes >= 1) {
    resultString += minutes.toString() + ' mins';
  }

  return resultString;
}
