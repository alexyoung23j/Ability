import React, { useState } from 'react';
import { Auth } from './/auth/auth';
import CommandView from './/command-window/CommandView';
import { CALENDAR_INDEX_1, EVENTS } from '../tests/EventsFixtures';
import SettingsView from './/settings-window/SettingsView';
import { CalendarIndexDay } from './util/command-view-util/CalendarIndexUtil';

interface AllContextProviderProps {
  showCommand: boolean;
  toggleBetweenWindows: any;
}

export type CalendarIndex = Array<CalendarIndexDay>;
export const CalendarContext =
  React.createContext<CalendarIndex | null>(CALENDAR_INDEX_1);

export default function AllContextProvider(props: AllContextProviderProps) {
  const { showCommand, toggleBetweenWindows } = props;

  const [calendarIndex, setCalendarIndex] =
    useState<CalendarIndex | null>(CALENDAR_INDEX_1);

  return (
    <CalendarContext.Provider value={calendarIndex}>
      {/* <Auth /> */}
      <div>
        {(showCommand && <CommandView />) || (
          <SettingsView toggleWindowHandler={toggleBetweenWindows} />
        )}
      </div>
    </CalendarContext.Provider>
  );
}
