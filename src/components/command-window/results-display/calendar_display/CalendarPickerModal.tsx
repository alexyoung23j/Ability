import CSS from 'csstype';
import React, { useState } from 'react';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';
import { Calendar, RegisteredAccount } from '../../types';
import { useImmer } from 'use-immer';

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
      {calendarAccounts.map((account, idx) => (
        <div key={idx}>
          <CalendarGroup />
        </div>
      ))}
    </div>
  );
}

function CalendarGroup() {
  return <div></div>;
}

const CalendarPickerModalStyle: CSS.Properties = {
  minWidth: '220px',
  minHeight: '300px',
  maxHeight: '300px',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 0 100px rgba(0,0,0, 0.3)',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  marginBottom: '0px',
  marginRight: '770px',
  position: 'absolute',
  zIndex: 70,
};
