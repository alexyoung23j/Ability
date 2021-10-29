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
  buildTimeMap,
  handleUpdatesToJobStack,
  NotificationJob,
  NotificationTimeMap,
  runNotificationEngine,
  ScheduledNotificationJobBatch,
} from '../util/global-util/NotificationsUtilOld';

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

  // Notification State
  const [
    notificationJobStack,
    setNotificationJobStack,
    notificationJobStackRef,
  ] = useStateRef<Array<NotificationJob>>([]);
  const [notificationTimeMap, setNotificationTimeMap, notificationTimeMapRef] =
    useStateRef<NotificationTimeMap>(buildTimeMap(calendarIndex, setTrayText));

  const [jobScheduledNext, setJobScheduledNext, jobScheduledNextRef] =
    useStateRef<NotificationJob>();
  const [
    jobCurrentlyExecuting,
    setJobCurrentlyExecuting,
    jobCurrentlyExecutingRef,
  ] = useStateRef<Job>(null);

  const [
    currentJobMetaScheduler,
    setCurrentJobMetaScheduler,
    currentJobMetaSchedulerRef,
  ] = useStateRef<Job>(null);

  // Schedule periodic query of the notificationTimeMap
  const masterJob: ScheduledRecurringJob = {
    scheduledRecurrenceRule: { second: [0, 10, 20, 30, 40, 50, 60] }, // TODO: this isn't quite right, its not logging eevery 10 secobds, fix this
    callback: () => {
      runNotificationEngine(
        notificationJobStackRef.current,
        setNotificationJobStack,
        notificationTimeMapRef.current,
        setNotificationTimeMap,
        currentJobMetaSchedulerRef.current,
        setCurrentJobMetaScheduler
      );
      console.log('current Stack: ', notificationJobStackRef.current);
    },
    extendBeyondActiveSession: false,
  };

  useEffect(() => {
    scheduleRecurringJob(masterJob);
  }, []);

  // Listen to for updates to CalendarIndex
  useEffect(() => {}, [calendarIndex]);

  // Listen to updates to notificationJobStack
  useEffect(() => {
    console.log(
      'There was an update to the notifcationJobStack: ',
      notificationJobStack
    );
    handleUpdatesToJobStack(
      notificationJobStackRef.current,
      setNotificationJobStack,
      currentJobMetaSchedulerRef.current,
      setCurrentJobMetaScheduler
    );
  }, [notificationJobStack]);

  // --------------------------- END NOTIFICATIONS CODE ------------------- //

  return (
    <div>
      {(showCommand && <CommandView />) || (
        <SettingsView toggleWindowHandler={toggleWindowHandler} />
      )}
    </div>
  );
}
