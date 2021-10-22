import {
  ScheduledSingledInstanceJob,
  scheduleSingleInstanceJob,
} from '../cron-util/CronUtil';
import {
  CalendarIndexEvent,
  mapDateToIndex,
} from '../command-view-util/CalendarIndexUtil';
import { DateTime } from 'luxon';
import { CalendarIndex } from '../../AllContextProvider';
import { Job } from 'node-schedule';
import { Updater } from 'use-immer';
import { createNamedExports } from 'typescript';
import { SetStateAction, Dispatch } from 'react';

export interface NotificationJob {
  isQueued: boolean;
  isExecuting: boolean;
  jobStream: ScheduledEventNotificationStream;
}

export interface ScheduledEventNotificationStream {
  jobs: Array<ScheduledSingledInstanceJob>;
  correspondingEvent: CalendarIndexEvent | null; //Just for testing
  startTime: DateTime;
  endTime: DateTime;
}

// Keys in here will represent the minute in the day, i.e. 12:45 am -> Key is 45
export interface NotificationTimeMap {
  [key: number]: {
    alreadyHandled: boolean;
    jobs: Array<NotificationJob>;
  };
}

export function buildTimeMap(
  calendarIndex: CalendarIndex,
  setTrayText: (payload: string) => void
): NotificationTimeMap {
  const todayIdx = mapDateToIndex(DateTime.now(), calendarIndex[0].date);
  const todaysEvents = calendarIndex[0].events;

  // TODO: Actually implement this to use real data instead of dummy data

  // Dummy Data

  let timeMap: NotificationTimeMap = {};

  const currentMin = getCurrentMinute();

  const nowStartMinute = DateTime.now().startOf('minute');

  const jobStream1 = scheduleEventNotificationStream(
    5,
    'First Event',
    10,
    nowStartMinute.plus({ minutes: 5 }),
    setTrayText
  );

  timeMap[currentMin] = {
    alreadyHandled: false,
    jobs: [
      {
        isQueued: false,
        isExecuting: false,
        jobStream: {
          jobs: jobStream1,
          correspondingEvent: null,
          startTime: nowStartMinute,
          endTime: nowStartMinute.plus({ minutes: 15 }),
        },
      },
    ],
  };

  return timeMap;
}

export function runNotificationEngine(
  notificationJobStack: Array<NotificationJob>,
  setNotificationJobStack: Updater<NotificationJob[]>,
  notificationTimeMap: NotificationTimeMap,
  setNotificationTimeMap: Updater<NotificationTimeMap>,
  currentJobMetaJobScheduler: Job | null,
  setCurrentMetaJobScheduler: any
) {
  const nextMin = getCurrentMinute();

  if (
    !(nextMin in notificationTimeMap) ||
    notificationTimeMap[nextMin].alreadyHandled
  ) {
    return;
  } else if (notificationTimeMap[nextMin].jobs.length == 1) {
    const job = notificationTimeMap[nextMin].jobs[0];
    if (notificationJobStack.length == 0) {
      // Just one job, add it to the stack
      if (!job.isQueued) {
        job.isQueued = true;
        setNotificationJobStack([...notificationJobStack, job]);
      }
    } else {
      const newStack = performUnion([...notificationJobStack, job]);
    }
  } else {
  }
}

// Returns current minute of the day
function getCurrentMinute() {
  const now = DateTime.now().startOf('minute');

  return now.minute + 60 * now.hour;
}

/**
 * This method performs a union operation on the stack, combining NotificationJobs that overlap
 * into a single job that contains all of the events
 * @param jobStack : the current stack (top = index n-1) with new jobs included
 */
function performUnion(
  jobStack: Array<NotificationJob>
): Array<NotificationJob> {
  return [];
}

/**
 * Takes an event and creates an event job stream that handles the notifications for the entirety of the event.
 * The events are not actualyl scheduled. Scheduling the jobs is handled in InternalTimeEngine.
 * @param minutesBeforeDisplay
 * @param eventTitle
 * @param eventDuration
 * @param eventTime
 * @param trayTextSetter
 */
export function scheduleEventNotificationStream(
  minutesBeforeDisplay: number,
  eventTitle: string,
  eventDuration: number,
  eventTime: DateTime,
  trayTextSetter: (payload: string) => void
): Array<ScheduledSingledInstanceJob> {
  let jobQueue = [];

  // Shorten Event
  const truncatedEventTitle =
    eventTitle.length < 10 ? eventTitle : eventTitle.slice(0, 8) + '..';

  // Minutes n...2
  for (let i = minutesBeforeDisplay; i > 1; i--) {
    const executionTime = eventTime.minus({ minutes: i });

    const trayText = ' In ' + i.toString() + ' mins: ' + truncatedEventTitle;

    const job: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: executionTime,
      callback: () => trayTextSetter(trayText),
      extendBeyondActiveSession: false,
    };

    // Save to queue
    jobQueue.push(job);
  }

  // -----------  1 Minute Away -----------
  const minuteTrayText = ' In 1 min: ' + truncatedEventTitle;

  const minuteJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: eventTime.minus({ minutes: 1 }),
    callback: () => trayTextSetter(minuteTrayText),
    extendBeyondActiveSession: false,
  };

  // Save to queue
  jobQueue.push(minuteJob);

  // ----------- During the Event -----------
  const eventTrayText = ' Now: ' + truncatedEventTitle;

  const eventJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: eventTime,
    callback: () => trayTextSetter(eventTrayText),
    extendBeyondActiveSession: false,
  };

  // Save to queue
  jobQueue.push(eventJob);

  // ----------- After the Event -----------

  const endEventJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: eventTime.plus({ minutes: eventDuration }),
    callback: () => trayTextSetter(''), // Nothing should be shown
    extendBeyondActiveSession: false,
  };

  // Save to queue
  jobQueue.push(endEventJob);

  return jobQueue;
}

export function handleUpdatesToJobStack(
  notificationJobStack: Array<NotificationJob>,
  setNotificationJobStack: Updater<NotificationJob[]>,
  currentJobMetaJobScheduler: Job,
  setCurrentMetaJobScheduler: Dispatch<SetStateAction<Job>>
) {
  if (notificationJobStack.length < 1) {
    return;
  }
  const topJob = notificationJobStack[notificationJobStack.length - 1];

  const newMetaJob = executeJobAndReturnMetaJob(
    topJob,
    notificationJobStack,
    setNotificationJobStack
  );

  setCurrentMetaJobScheduler(newMetaJob);

  for (let i = 0; i < notificationJobStack.length - 1; i++) {
    const notificationJob = notificationJobStack[i];
    cancelJob(notificationJob);
  }
}

function executeJobAndReturnMetaJob(
  jobToExecute: NotificationJob,
  notificationJobStack: Array<NotificationJob>,
  setNotificationJobStack: Updater<NotificationJob[]>
): Job {
  // Schedule all the jobs
  for (const job of jobToExecute.jobStream.jobs) {
    const scheduledStreamJob = scheduleSingleInstanceJob(job);
  }

  const metaJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: jobToExecute.jobStream.endTime,
    callback: () =>
      removeTopJobFromStack(notificationJobStack, setNotificationJobStack),
    extendBeyondActiveSession: false,
  };

  const scheduledMetaJob = scheduleSingleInstanceJob(metaJob);
  return scheduledMetaJob;
}

function removeTopJobFromStack(
  notificationJobStack: Array<NotificationJob>,
  setNotificationJobStack: Updater<NotificationJob[]>
) {
  if (notificationJobStack.length < 1) {
    return;
  }
  const removedTop = notificationJobStack.slice(
    0,
    notificationJobStack.length - 1
  );
  setNotificationJobStack(removedTop);
}

function cancelJob(notificationJob: NotificationJob) {
  return;
}
