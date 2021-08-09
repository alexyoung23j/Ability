import CSS from 'csstype';
import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';
import { Calendar, RegisteredAccount } from '../../types';
import { useImmer } from 'use-immer';
import { Checkbox } from 'reakit/Checkbox';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export function CalendarPickerModal(props: {
  calendarAccounts: Array<RegisteredAccount>;
  setCalendarAccounts: any;
  setCalendarPickerLaunched: any;
}) {
  const { calendarAccounts, setCalendarAccounts, setCalendarPickerLaunched } =
    props;
  return (
    <div style={CalendarPickerModalStyle}>
      <div className="chooseCalendarsTitleText">Calendars</div>
      {calendarAccounts.map((calendarGroup, idx) => (
        <div
          key={idx}
          style={{
            marginTop: '10px',
            paddingTop: '7px',
            paddingBottom: '10px',
            paddingLeft: '10px',
            paddingRight: '10px',
            backgroundColor: '#F1F1F1',
            borderRadius: '5px',
          }}
        >
          <CalendarGroup
            calendarGroup={calendarGroup}
            setCalendarAccounts={setCalendarAccounts}
          />
        </div>
      ))}
      <div style={{ height: '20px' }}></div>
    </div>
  );
}

function CalendarGroup(props: {
  calendarGroup: RegisteredAccount;
  setCalendarAccounts: any;
}) {
  const { calendarGroup, setCalendarAccounts } = props;

  return (
    <div
      style={{
        marginLeft: '5px',
        marginRight: '5px',
        borderRadius: '5px',
      }}
    >
      <div
        style={{ fontSize: '13px', marginBottom: '3px' }}
        className="basicTextClass"
      >
        {calendarGroup.accountEmail}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {calendarGroup.calendars.map((calendar, idx) => (
          <div key={idx} style={{ marginLeft: '5px' }}>
            <CalendarEntry
              calendar={calendar}
              setCalendarAccounts={setCalendarAccounts}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarEntry(props: {
  calendar: Calendar;
  setCalendarAccounts: any;
}) {
  const { calendar, setCalendarAccounts } = props;

  const [checked, setChecked] = useState(calendar.selectedForDisplay);

  const CheckToggled = () => {
    if (checked) {
      // We are unchecking a calendar
      setCalendarAccounts((draft) => {
        for (const account of draft) {
          if (account.accountEmail == calendar.googleAccount) {
            for (const accountCalendar of account.calendars) {
              if (accountCalendar.name == calendar.name) {
                accountCalendar.selectedForDisplay = false;
              }
            }
          }
        }
      });
      setChecked(false);
    } else {
      // We are checking a calendar
      setCalendarAccounts((draft) => {
        for (const account of draft) {
          if (account.accountEmail == calendar.googleAccount) {
            for (const accountCalendar of account.calendars) {
              if (accountCalendar.name == calendar.name) {
                accountCalendar.selectedForDisplay = true;
              }
            }
          }
        }
      });
      setChecked(true);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div>
        <Checkbox checked={checked} onChange={CheckToggled} />
      </div>
      <div
        style={{
          marginLeft: '10px',
          marginRight: '20px',
          fontSize: '12px',
          fontStyle: 'bold',
        }}
        className="basicTextClass"
      >
        {calendar.name}
      </div>
      <div
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: calendar.color,
          borderRadius: '20px',
        }}
      ></div>
    </div>
  );
}

const CalendarPickerModalStyle: CSS.Properties = {
  minWidth: '230px',
  minHeight: '250px',
  maxHeight: '300px',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 0 100px rgba(0,0,0, 0.3)',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexDirection: 'column',
  marginBottom: '0px',
  marginRight: '770px',
  position: 'absolute',
  zIndex: 70,
};
