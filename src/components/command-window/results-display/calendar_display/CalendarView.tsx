import CSS from 'csstype';
import React, { useState, useEffect } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';
import { Calendar, RegisteredAccount } from '../../types';
import { useImmer } from 'use-immer';
import { CalendarPickerModal } from './CalendarPickerModal';
import DailyCalendarView from './DailyCalendarView';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarView {
  calendar_data: any;
  ignoreHandler: any;
  ignoredSlots: Array<Array<number>>;
  textEngineLaunched: boolean;
  scheduleNewEvent: any;
  modifyExistingEvent: any;
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
    filteredCalendarData,
    calendarAccounts,
    setCalendarAccounts,
  } = props;

  const [calendarPickerLaunched, setCalendarPickerLaunched] = useState(false);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0); // TODO: initialize to the current date if present

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
          selectedDayIdx={selectedDayIdx}
          setSelectedDayIdx={setSelectedDayIdx}
        />
        {!textEngineLaunched && (
          <DailyCalendarView
            calendar_data={filteredCalendarData}
            selected_day_idx={selectedDayIdx}
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
