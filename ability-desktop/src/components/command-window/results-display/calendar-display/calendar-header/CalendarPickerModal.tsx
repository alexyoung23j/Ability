import CSS from 'csstype';
import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from '../calendar-body/CalendarBody';
import {
  AbilityCalendar,
  RegisteredAccount,
} from '../../../../../constants/types';
import { useImmer } from 'use-immer';
import { Checkbox } from 'reakit/Checkbox';
import { css } from '@emotion/css';

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
            marginLeft: '10px',
            marginRight: '10px',
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
  calendar: AbilityCalendar;
  setCalendarAccounts: any;
}) {
  const { calendar, setCalendarAccounts } = props;

  const [checked, setChecked] = useState(calendar.selectedForDisplay);

  const CheckToggled = () => {
    if (checked) {
      // We are unchecking a calendar
      setCalendarAccounts((draft) => {
        for (const account of draft) {
          if (account.accountEmail == calendar.accountEmail) {
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
          if (account.accountEmail == calendar.accountEmail) {
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

  // Styles for the checkboxes
  const checkboxStyle = css`
    appearance: none;
    border: 1px solid ${calendar.color};
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    width: 12px;
    height: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 5px;
    &:after {
      content: '✔';
      display: none;
      color: white;
      font-size: 60%;
    }
    &:checked {
      background-color: ${calendar.color};
      border: 2px solid ${calendar.color};
      &:after {
        display: block;
      }
    }
  `;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div>
        <Checkbox
          checked={checked}
          onChange={CheckToggled}
          className={checkboxStyle}
        />
      </div>
      <div
        style={{
          marginLeft: '10px',
          marginRight: '20px',
          fontSize: '11px',
          fontStyle: 'bold',
        }}
        className="basicTextClass"
      >
        {calendar.name}
      </div>
    </div>
  );
}

const CalendarPickerModalStyle: CSS.Properties = {
  minWidth: '230px',
  minHeight: '200px',
  maxHeight: '300px',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 0 100px rgba(0,0,0, 0.3)',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexDirection: 'column',
  marginTop: '30px',
  position: 'absolute',
  marginLeft: '-220px',
  overflow: 'scroll',
  zIndex: 70,
};
