import CSS from 'csstype';
import React, { useState, useEffect, useContext } from 'react';
import CalendarHeader from '../calendar-header/CalendarHeader';
import CalendarBody from './CalendarBody';
import {
  AbilityCalendar,
  RegisteredAccount,
} from '../../../../../constants/types';
import { Updater, useImmer } from 'use-immer';
import { CalendarPickerModal } from '../calendar-header/CalendarPickerModal';
import DailyCalendarView from '../daily-calendar/DailyCalendarView';
import { CalendarResultData } from '../../engines/ResultEngine';
import { RegisteredAccountToCalendarsContext } from 'components/AllContextProvider';
const { DateTime } = require('luxon');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarView {
  calendarData: CalendarResultData;
  ignoreHandler: (index: Array<number>, action: string) => void;
  ignoredSlots: Array<Array<number>>;
  textEngineLaunched: boolean;
  scheduleNewEvent: (
    start_time: string,
    end_time: string,
    title: string,
    url: string,
    color: string,
    calendar: AbilityCalendar,
    day_idx: number
  ) => void;
  modifyExistingEvent: (
    start_time: string,
    end_time: string,
    title: string,
    url: string,
    color: string,
    calendar: AbilityCalendar,
    orig_event_idx: number
  ) => void;
  deleteEvent: (
    start_time: string,
    end_time: string,
    title: string,
    url: string,
    color: string,
    calendar: AbilityCalendar,
    day_idx: number,
    orig_event_idx: number,
    eventId: string
  ) => void;
  filteredCalendarData: CalendarResultData;
  calendarAccounts: Array<RegisteredAccount>;
  setCalendarAccounts: Updater<Array<RegisteredAccount>>;
}

export default function CalendarView(props: CalendarView) {
  const {
    calendarData,
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

  const registeredAccountToCalendars = useContext(
    RegisteredAccountToCalendarsContext
  ).registeredAccountToCalendars!;
  const randomCalendar = Object.values(registeredAccountToCalendars)[0][0];
  const [modalEventCalendar, setModalEventCalendar] = useState(randomCalendar);

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
          calendar_data={calendarData}
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
