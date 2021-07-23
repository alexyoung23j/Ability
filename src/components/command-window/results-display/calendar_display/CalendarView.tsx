import CSS from 'csstype';
import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';
import { Calendar, RegisteredAccount } from '../../types';
import { useImmer } from 'use-immer';
import { CalendarPickerModal } from './CalendarPickerModal';

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

  const fetched_calendars: Array<RegisteredAccount> = [
    {
      accountEmail: 'testAccount1@gmail.com',
      calendars: [
        {
          name: 'Calendar 1',
          color: 'blue',
          googleAccount: 'testAccount1@gmail.com',
          selectedForDisplay: true,
        },
        {
          name: 'Calendar 2',
          color: 'green',
          googleAccount: 'testAccount1@gmail.com',
          selectedForDisplay: true,
        },
        {
          name: 'Calendar 3',
          color: 'green',
          googleAccount: 'testAccount1@gmail.com',
          selectedForDisplay: true,
        },
      ],
    },
    {
      accountEmail: 'testAccount2@gmail.com',
      calendars: [
        {
          name: 'Calendar 1',
          color: 'blue',
          googleAccount: 'testAccount2@gmail.com',
          selectedForDisplay: true,
        },
        {
          name: 'Calendar 2',
          color: 'green',
          googleAccount: 'testAccount2@gmail.com',
          selectedForDisplay: true,
        },
        {
          name: 'Calendar 3',
          color: 'green',
          googleAccount: 'testAccount2@gmail.com',
          selectedForDisplay: true,
        },
      ],
    },
  ];

  const [calendarPickerLaunched, setCalendarPickerLaunched] = useState(true);
  const [calendarAccounts, setCalendarAccounts] =
    useImmer<Array<RegisteredAccount>>(fetched_calendars); // TODO: This should be fetched from context or something

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
          calendarAccounts={calendarAccounts}
          setCalendarAccounts={setCalendarAccounts}
          setCalendarPickerLaunched={setCalendarPickerLaunched}
        />
      )}
    </div>
  );
}

const calendarViewStyle: CSS.Properties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
};
