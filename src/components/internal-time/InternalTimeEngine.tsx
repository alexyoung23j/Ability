import React, { useState, useEffect, useContext } from 'react';
import CommandView from '../command-window/CommandView';
import SettingsView from '../settings-window/SettingsView';
const { DateTime } = require('luxon');
import {
  ScheduledSingledInstanceJob,
  scheduleSingleInstanceJob,
  ScheduledRecurringJob,
  scheduleRecurringJob,
} from '../util/cron-util/CronUtil';
import { GlobalSettingsContext, CalendarContext } from '../AllContextProvider';
import { useImmer } from 'use-immer';
import { Job } from 'node-schedule';
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
import {
  NotificationJob,
  NotificationTimeMap,
  buildTimeMap,
  runNotificationEngine,
} from '../util/global-util/NotificationsUtil';

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
  const { calendarIndex, setCalendarIndex } = useContext(CalendarContext);
  const { globalUserSettings, setGlobalUserSettings } = useContext(
    GlobalSettingsContext
  );

  const [dailyJobsScheduled, setDailyJobsScheduled] = useState(false);

  // --------------------------- START NOTIFICATIONS CODE ------------------- //

  // Notification State
  const [notificationJobStack, setNotificationJobStack] = useState<
    Array<NotificationJob>
  >([]);
  const [notificationTimeMap, setNotificationTimeMap] =
    useImmer<NotificationTimeMap>(buildTimeMap(calendarIndex));
  const [currentJobMetaScheduler, setCurrentJobMetaScheduler] =
    useState<Job>(null);

  // Schedule periodic query of the notificationTimeMap
  const masterJob: ScheduledRecurringJob = {
    scheduledRecurrenceRule: { second: 10 }, // TODO: this isn't quite right, its not logging eevery 10 secobds, fix this
    callback: () => {
      runNotificationEngine(
        notificationJobStack,
        setNotificationJobStack,
        notificationTimeMap,
        setNotificationTimeMap,
        currentJobMetaScheduler,
        setCurrentJobMetaScheduler
      );
    },
    extendBeyondActiveSession: false,
  };

  // Schedule the MasterJob once
  useEffect(() => {
    scheduleRecurringJob(masterJob);
  }, []);

  // Listen to for updates to CalendarIndex
  useEffect(() => {}, [calendarIndex]);

  // Listen to updates to notificationJobStack
  useEffect(() => {}, []);

  /* useEffect(() => {
    if (!dailyJobsScheduled) {
      setDailyJobsScheduled(true);
      scheduleEventNotificationStream(
        2,
        'Meeting',
        1,
        DateTime.now().minus({ minutes: 2, seconds: 4 }),
        setTrayText
      );
    }
  }, []); */

  // --------------------------- END NOTIFICATIONS CODE ------------------- //

  return (
    <div>
      {(showCommand && <CommandView />) || (
        <SettingsView toggleWindowHandler={toggleWindowHandler} />
      )}
    </div>
  );
}
