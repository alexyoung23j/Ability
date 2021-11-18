import {
  CalendarIndexContext,
  RegisteredAccountToCalendarsContext,
  CalendarIndex,
  RegisteredAccountToCalendars,
  isCurrentlyFetchingContext,
} from 'components/AllContextProvider';
import { useContext } from 'react';
import { loadCalendarData } from 'components/loadCalendarData';
import React from 'react';
import { DraftFunction } from 'use-immer';
import { CalendarIndexEvent } from 'components/util/command-view-util/CalendarIndexUtil';

/**
 * Fetches Calendar Data and updates the context to reflect the changes
 * @param calendarIndex
 * @param registeredAccountToCalendars
 * @param setCalendarIndex
 * @param setRegisteredAccountToCalendars
 */
async function fetchCalendarData(
  calendarIndex: CalendarIndex,
  registeredAccountToCalendars: RegisteredAccountToCalendars,
  setCalendarIndex: (arg: CalendarIndex | DraftFunction<CalendarIndex>) => void,
  setRegisteredAccountToCalendars: (
    arg:
      | RegisteredAccountToCalendars
      | DraftFunction<RegisteredAccountToCalendars | null>
      | null
  ) => void
) {
  const out = await loadCalendarData(
    ({
      calendarIndex,
      registeredAccountToCalendars,
    }: {
      calendarIndex: CalendarIndex;
      registeredAccountToCalendars: RegisteredAccountToCalendars;
    }) => {
      setCalendarIndex(calendarIndex);
      setRegisteredAccountToCalendars(registeredAccountToCalendars);
    }
  );
}

function modifyEvent(event: CalendarIndexEvent) {}

export function useCalendarAPI() {
  const { calendarIndex, setCalendarIndex } = useContext(CalendarIndexContext);
  const { registeredAccountToCalendars, setRegisteredAccountToCalendars } =
    useContext(RegisteredAccountToCalendarsContext);
  const { isCurrentlyFetching, setIsCurrentlyFetching } = useContext(
    isCurrentlyFetchingContext
  );

  return {
    fetchCalendarData: () => {
      setIsCurrentlyFetching(true);
      fetchCalendarData(
        calendarIndex,
        registeredAccountToCalendars,
        setCalendarIndex,
        setRegisteredAccountToCalendars
      ).then(() => {
        setIsCurrentlyFetching(false);
      });
    },

    modifyEvent: (event: CalendarIndexEvent) => modifyEvent(event),
  };
}
