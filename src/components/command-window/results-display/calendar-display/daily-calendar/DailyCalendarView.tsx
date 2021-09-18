import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Calendar } from '../../../../../constants/types';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface DailyCalendarViewProps {
  calendar_data: any;
  selected_day_idx: number;
  setSelectedDayIdx: any;
  selectedEventIdxInSelectedDay: number;
  setSelectedEventIdxInSelectedDay: any;
  setModalShow: any;
  setModalShowsNewEvent: any;
  modalEventStart: DateTime;
  setModalEventStart: any;
  modalEventEnd: DateTime;
  setModalEventEnd: any;
  modalEventTitle: string;
  setModalEventTitle: any;
  modalEventLocation: string;
  setModalEventLocation: any;
  modalEventCalendar: Calendar;
  setModalEventCalendar: any;
  modalEventDescription: string;
  setModalEventDescription: any;
}

export default function DailyCalendarView(props: DailyCalendarViewProps) {
  const {
    calendar_data,
    selected_day_idx,
    setSelectedDayIdx,
    selectedEventIdxInSelectedDay,
    setSelectedEventIdxInSelectedDay,
    setModalShow,
    setModalShowsNewEvent,
    modalEventStart,
    setModalEventStart,
    modalEventEnd,
    setModalEventEnd,
    modalEventTitle,
    setModalEventTitle,
    modalEventLocation,
    setModalEventLocation,
    modalEventCalendar,
    setModalEventCalendar,
    modalEventDescription,
    setModalEventDescription,
  } = props;

  function LaunchModal(index_in_day: number) {
    const selectedEvent =
      calendar_data.days[selected_day_idx].events[index_in_day];
    setModalShow(true);
    setModalShowsNewEvent(false);
    setSelectedEventIdxInSelectedDay(index_in_day);
    setModalEventStart(DateTime.fromISO(selectedEvent.start_time));
    setModalEventEnd(DateTime.fromISO(selectedEvent.end_time));
    setModalEventTitle(selectedEvent.title);
    setModalEventCalendar(selectedEvent.calendar);
    setModalEventLocation(''); // TODO: Add location info to the event object
    setModalEventDescription('Agenda TBD'); // TODO: Set description on the event object
  }

  return (
    <div
      style={{
        marginLeft: '20px',
        marginRight: '20px',
        marginTop: '10px',
        maxHeight: '190px',
        overflow: 'overlay',
      }}
    >
      {calendar_data.days[selected_day_idx].events.map((event, idx) => (
        <div key={idx}>
          <HorizontalEvent
            event={event}
            index={idx}
            launchModal={LaunchModal}
          />
        </div>
      ))}
    </div>
  );
}

interface HorizontalEventProps {
  event: any;
  index: number;
  launchModal: any;
}
function HorizontalEvent(props: HorizontalEventProps) {
  const { event, index, launchModal } = props;

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
        launchModal(index);
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          width: '80px',
        }}
      >
        <div className="dailyCalendarViewTime">
          {_createTimeString(event.start_time)}
        </div>
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
        <div className="dailyCalendarViewTitle">{event.title}</div>
      </div>
      <div
        style={{ display: 'flex', justifyContent: 'flex-end', width: '100px' }}
      >
        <div className="dailyCalendarViewDuration">
          {_createDurationString(event.start_time, event.end_time)}
        </div>
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
