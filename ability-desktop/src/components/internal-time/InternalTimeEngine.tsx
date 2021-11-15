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
  NotificationJob,
  getCurrentMinute,
  buildUnion,
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

  const [dailyJobsScheduled, setDailyJobsScheduled] = useStateRef(false);

  // --------------------------- START NOTIFICATIONS CODE ------------------- //

  const [notificationTimeMap, setNotificationTimeMap, notificationTimeMapRef] =
    useStateRef<NotificationTimeMap>({});

  const [jobScheduledNext, setJobScheduledNext, jobScheduledNextRef] =
    useStateRef<NotificationJob | null>(null);

  const [
    jobCurrentlyExecuting,
    setJobCurrentlyExecuting,
    jobCurrentlyExecutingRef,
  ] = useStateRef<Job | null>(null);

  // Schedule periodic query of the notificationTimeMap
  const masterJob: ScheduledRecurringJob = {
    scheduledRecurrenceRule: { second: 0 },
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

    console.log('Map: ', notificationTimeMap);
    const currentMinute = getCurrentMinute();
    if (
      notificationTimeMap != null &&
      currentMinute + 1 in notificationTimeMap
    ) {
      if (notificationTimeMap[currentMinute + 1].length === 1) {
        setJobScheduledNext(notificationTimeMap[currentMinute + 1][0]);
      } else {
        setJobScheduledNext(
          buildUnion(notificationTimeMap[currentMinute + 1], setTrayText)
        );
      }
    } else if (notificationTimeMap != null) {
      // We should schedule an empty string job since there is no next minute in our timemap
      const timeToStartNextMinute = DateTime.now()
        .startOf('minute')
        .plus({ minutes: 1, seconds: 0.5 });
      const job: ScheduledSingledInstanceJob = {
        scheduledExecutionTime: timeToStartNextMinute,
        callback: () => setTrayText(''),
        extendBeyondActiveSession: false,
      };

      const now = DateTime.now();
      const nextJob: NotificationJob = {
        isPrelude: false,
        job: job,
        associatedEvent: null,
        eventStartTime: now.plus({ minutes: 1 }),
        eventEndTime: now.plus({ minutes: 2 }),
      };
      setJobScheduledNext(nextJob);
    }
  }, [notificationTimeMap]);

  useEffect(() => {
    scheduleRecurringJob(masterJob);
  }, []);

  // Listen to for updates to CalendarIndex
  useEffect(() => {
    // TODO: Rebuild time map intelligently (if we see a change has occured)
    console.log('rebuilding timemap because calendar Index updated');
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
