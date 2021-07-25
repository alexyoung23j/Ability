import CSS from 'csstype';
import React, { useState, useEffect } from 'react';
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
          name: "Alex's Personal Calendar",
          color: '#33b679',
          googleAccount: 'testAccount1@gmail.com',
          selectedForDisplay: true,
        },
        {
          name: 'Work Calendar',
          color: '#33b679',
          googleAccount: 'testAccount1@gmail.com',
          selectedForDisplay: false,
        },
        {
          name: 'Calendar 3',
          color: 'green',
          googleAccount: 'testAccount1@gmail.com',
          selectedForDisplay: true,
        },
      ],
    },
  ];

  const [calendarPickerLaunched, setCalendarPickerLaunched] = useState(false);
  const [filteredCalendarData, setFilteredCalendarData] =
    useImmer(calendar_data);
  const [calendarAccounts, setCalendarAccounts] =
    useImmer<Array<RegisteredAccount>>(fetched_calendars); // TODO: This should be fetched from context or something

  // Is an event thats part of a calendar (just by name and email for now) one that should be displayed?
  function _IsSelected(name: string, accountEmail: string) {
    for (const group of calendarAccounts) {
      for (const calendar of group.calendars) {
        if (
          group.accountEmail == accountEmail &&
          calendar.name == name &&
          calendar.selectedForDisplay == true
        ) {
          return true;
        }
      }
    }
    return false;
  }

  useEffect(() => {
    console.log(filteredCalendarData);
    setFilteredCalendarData((draft) => {
      // TODO: this is probably inefficient
      for (let i = 0; i < calendar_data.days.length; i++) {
        let currentDay = calendar_data.days[i];

        let validEvents = [];

        for (const event of currentDay.events) {
          let eventCalendar = event.calendar;

          if (_IsSelected(eventCalendar.name, eventCalendar.accountEmail)) {
            validEvents.push(event);
          }
        }

        draft.days[i].events = validEvents;
        console.log(draft);
      }
    });
  }, [calendarAccounts]);

  return (
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
