import CSS from 'csstype';
import React, { useState, useEffect } from 'react';
import CalendarHeader from '../calendar-header/CalendarHeader';
import CalendarBody from './CalendarBody';
import { Calendar, RegisteredAccount } from '../../../../../constants/types';
import { useImmer } from 'use-immer';
import { CalendarPickerModal } from '../calendar-header/CalendarPickerModal';
import DailyCalendarView from '../daily-calendar/DailyCalendarView';
const { DateTime } = require('luxon');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarView {
  calendar_data: any;
  ignoreHandler: any;
  ignoredSlots: Array<Array<number>>;
  textEngineLaunched: boolean;
  scheduleNewEvent: any;
  modifyExistingEvent: any;
  deleteEvent: any;
  filteredCalendarData: any;
  calendarAccounts: Array<RegisteredAccount>;
  setCalendarAccounts: any;
}

export default function CalendarView(props: CalendarView) {
  const {
    calendar_data,
    ignoreHandler,
    ignoredSlots,
    textEngineLaunched,
    scheduleNewEvent,
    modifyExistingEvent,
    deleteEvent,
    filteredCalendarData,
    calendarAccounts,
    setCalendarAccounts,
  } = props;

  const [calendarPickerLaunched, setCalendarPickerLaunched] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0); // TODO: initialize to the current date if present
  const [selectedEventIdxInSelectedDay, setSelectedEventIdxInSelectedDay] =
    useState(0); // TODO: initialize to something smarter? maybe?
  const [modalShow, setModalShow] = useState(false);
  const [modalShowsNewEvent, setModalShowsNewEvent] = useState(false);
  const [modalEventStart, setModalEventStart] = useState(
    DateTime.fromISO('2021-06-09T16:10:00-07:00')
  );
  const [modalEventEnd, setModalEventEnd] = useState(
    DateTime.fromISO('2021-06-09T17:10:00-07:00')
  );
  const [modalEventTitle, setModalEventTitle] = useState('');
  const [modalEventLocation, setModalEventLocation] = useState('');
  const [modalEventCalendar, setModalEventCalendar] = useState({
    name: "Alex's Calendar",
    color: 'blue',
    googleAccount: 'testAccount1@gmail.com',
  }); // TODO: Fetch from context
  const [modalEventDescription, setModalEventDescription] = useState('');

  return (
    <div>
      {calendarPickerLaunched && (
        <CalendarPickerModal
          calendarAccounts={calendarAccounts}
          setCalendarAccounts={setCalendarAccounts}
          setCalendarPickerLaunched={setCalendarPickerLaunched}
        />
      )}
      <div style={calendarViewStyle}>
        <CalendarHeader
          calendar_data={calendar_data}
          showButtons={true} // Whether we allow user to skip forward or not
          calendarPickerLaunched={calendarPickerLaunched}
          setCalendarPickerLaunched={setCalendarPickerLaunched}
        />
        <CalendarBody
          calendar_data={filteredCalendarData}
          calendarAccounts={calendarAccounts}
          ignoreHandler={ignoreHandler}
          ignoredSlots={ignoredSlots}
          textEngineLaunched={textEngineLaunched}
          scheduleNewEvent={scheduleNewEvent}
          modifyExistingEvent={modifyExistingEvent}
          deleteEvent={deleteEvent}
          selectedDayIdx={selectedDayIdx}
          setSelectedDayIdx={setSelectedDayIdx}
          selectedEventIdxInSelectedDay={selectedEventIdxInSelectedDay}
          setSelectedEventIdxInSelectedDay={setSelectedEventIdxInSelectedDay}
          modalShow={modalShow}
          setModalShow={setModalShow}
          modalShowsNewEvent={modalShowsNewEvent}
          setModalShowsNewEvent={setModalShowsNewEvent}
          modalEventStart={modalEventStart}
          setModalEventStart={setModalEventStart}
          modalEventEnd={modalEventEnd}
          setModalEventEnd={setModalEventEnd}
          modalEventTitle={modalEventTitle}
          setModalEventTitle={setModalEventTitle}
          modalEventLocation={modalEventLocation}
          setModalEventLocation={setModalEventLocation}
          modalEventCalendar={modalEventCalendar}
          setModalEventCalendar={setModalEventCalendar}
          modalEventDescription={modalEventDescription}
          setModalEventDescription={setModalEventDescription}
        />
        {!textEngineLaunched && (
          <DailyCalendarView
            calendar_data={filteredCalendarData}
            selected_day_idx={selectedDayIdx}
            setSelectedDayIdx={setSelectedDayIdx}
            selectedEventIdxInSelectedDay={selectedEventIdxInSelectedDay}
            setSelectedEventIdxInSelectedDay={setSelectedEventIdxInSelectedDay}
            setModalShow={setModalShow}
            setModalShowsNewEvent={setModalShowsNewEvent}
            modalEventStart={modalEventStart}
            setModalEventStart={setModalEventStart}
            modalEventEnd={modalEventEnd}
            setModalEventEnd={setModalEventEnd}
            modalEventTitle={modalEventTitle}
            setModalEventTitle={setModalEventTitle}
            modalEventLocation={modalEventLocation}
            setModalEventLocation={setModalEventLocation}
            modalEventCalendar={modalEventCalendar}
            setModalEventCalendar={setModalEventCalendar}
            modalEventDescription={modalEventDescription}
            setModalEventDescription={setModalEventDescription}
          />
        )}
      </div>
    </div>
  );
}

const calendarViewStyle: CSS.Properties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
};
