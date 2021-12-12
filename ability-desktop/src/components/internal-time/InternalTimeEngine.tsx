import { Job } from 'node-schedule';
import React, { useContext, useEffect } from 'react';
import useStateRef from 'react-usestateref';
import {
  CalendarIndexContext,
  GlobalSettingsContext,
  CalendarIndex,
} from '../AllContextProvider';
import CommandView from '../command-window/CommandView';
import SettingsView from '../settings-window/SettingsView';
import {
  ScheduledRecurringJob,
  scheduleRecurringJob,
  ScheduledSingledInstanceJob,
} from '../util/cron-util/CronUtil';
import {
  runNotificationEngine,
  NotificationTimeMap,
  buildTimeMap,
} from '../util/global-util/NotificationsUtil';
import { mapDateToIndex } from '../util/command-view-util/CalendarIndexUtil';
import { DateTime } from 'luxon';

interface InternalTimeEngineProps {
  showCommand: boolean;
  toggleWindowHandler: any;
  setTrayText: (payload: string) => void;
}

/**
 * InternalTimeEngine renders the entirety of the app (aside from the login screen). It acts as a controller, allowing us
 * to manage all internal event scheduling and cron jobs in one high level place.
 * @param props
 */
export default function InternalTimeEngine(props: InternalTimeEngineProps) {
  const { showCommand, toggleWindowHandler, setTrayText } = props;

  // Fetch Context
  const { calendarIndex, setCalendarIndex } = useContext(CalendarIndexContext);
  const { globalUserSettings, setGlobalUserSettings } = useContext(
    GlobalSettingsContext
  );

  // --------------------------- START NOTIFICATIONS CODE ------------------- //

  const [notificationTimeMap, setNotificationTimeMap, notificationTimeMapRef] =
    useStateRef<NotificationTimeMap>({});

  const [
    jobCurrentlyExecuting,
    setJobCurrentlyExecuting,
    jobCurrentlyExecutingRef,
  ] = useStateRef<Job | null>(null);

  // Schedule periodic query of the notificationTimeMap
  const masterJob: ScheduledRecurringJob = {
    scheduledRecurrenceRule: { second: [0, 10, 20, 30, 40, 50] },
    callback: () => {
      runNotificationEngine(
        notificationTimeMapRef.current,
        jobCurrentlyExecutingRef.current,
        setJobCurrentlyExecuting,
        setTrayText
      );
    },
    extendBeyondActiveSession: false,
  };

  // Schedule the cron job
  useEffect(() => {
    scheduleRecurringJob(masterJob);
  }, []);

  // Listen to for updates to CalendarIndex
  useEffect(() => {
    setNotificationTimeMap(
      buildTimeMap(
        calendarIndex[mapDateToIndex(DateTime.now(), calendarIndex[0].date)],
        setTrayText,
        globalUserSettings
      )
    );
  }, [calendarIndex]);

  // --------------------------- END NOTIFICATIONS CODE ------------------- //

  return (
    <div>
      {(showCommand && <CommandView />) || (
        <SettingsView toggleWindowHandler={toggleWindowHandler} />
      )}
    </div>
  );
}
