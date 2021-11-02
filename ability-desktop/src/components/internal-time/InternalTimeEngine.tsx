import { Job } from 'node-schedule';
import React, { useContext, useEffect } from 'react';
import useStateRef from 'react-usestateref';
import { CalendarContext, GlobalSettingsContext } from '../AllContextProvider';
import CommandView from '../command-window/CommandView';
import SettingsView from '../settings-window/SettingsView';
import {
  ScheduledRecurringJob,
  scheduleRecurringJob,
} from '../util/cron-util/CronUtil';
import {
  runNotificationEngine,
  NotificationTimeMap,
  buildTimeMap,
  NotificationJob,
  getCurrentMinute,
  buildUnion,
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

  const [dailyJobsScheduled, setDailyJobsScheduled] = useStateRef(false);

  // --------------------------- START NOTIFICATIONS CODE ------------------- //

  const [notificationTimeMap, setNotificationTimeMap, notificationTimeMapRef] =
    useStateRef<NotificationTimeMap>(buildTimeMap(calendarIndex, setTrayText));

  const [jobScheduledNext, setJobScheduledNext, jobScheduledNextRef] =
    useStateRef<NotificationJob | null>();

  const [
    jobCurrentlyExecuting,
    setJobCurrentlyExecuting,
    jobCurrentlyExecutingRef,
  ] = useStateRef<Job | null>(null);

  // Schedule periodic query of the notificationTimeMap
  const masterJob: ScheduledRecurringJob = {
    scheduledRecurrenceRule: { second: 0 }, // TODO: this isn't quite right, its not logging eevery 10 secobds, fix this
    callback: () => {
      runNotificationEngine(
        notificationTimeMapRef.current,
        setNotificationTimeMap,
        jobScheduledNextRef.current,
        setJobScheduledNext,
        jobCurrentlyExecutingRef.current,
        setJobCurrentlyExecuting,
        setTrayText
      );
    },
    extendBeyondActiveSession: false,
  };

  useEffect(() => {
    // Initialize the scheduled next job
    const currentMinute = getCurrentMinute();
    if (
      notificationTimeMap != null &&
      currentMinute + 1 in notificationTimeMap
    ) {
      setJobScheduledNext(
        buildUnion(notificationTimeMap[currentMinute + 1], setTrayText)
      );
      console.log('scheduled');
      console.log('map: ', notificationTimeMap);
    }
  }, []);

  useEffect(() => {
    scheduleRecurringJob(masterJob);
  }, []);

  // Listen to for updates to CalendarIndex
  useEffect(() => {
    // TODO: Rebuild time map intelligently (if we see a change has occured)
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
