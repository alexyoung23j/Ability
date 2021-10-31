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
import { SetStateAction, Dispatch } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface NotificationJob {
  isPrelude: boolean;
  job: ScheduledSingledInstanceJob;
  associatedEvent: CalendarIndexEvent | null;
  eventStartTime: DateTime | null;
  eventEndTime: DateTime | null;
}

export interface NotificationTimeMap {
  [key: number]: Array<NotificationJob>;
}

export function buildTimeMap(
  calendarIndex: CalendarIndex,
  trayTextSetter: (payload: string) => void
) {
  // TODO: Build actual time map

  // Dummy Data:

  let timeMap: NotificationTimeMap = {};

  const currentMin = getCurrentMinute();

  const firstJob = scheduleEventNotificationStream(
    0,
    'Event 1',
    'Event 1',
    1,
    DateTime.now().startOf('minute').plus({ minutes: 1 }),
    trayTextSetter
  );

  let i = currentMin + 1;

  for (const job of firstJob) {
    timeMap[i] = [
      {
        isPrelude: true, // innacurate
        job: job,
        associatedEvent: null,
        eventStartTime: DateTime.now().startOf('minute').plus({ minutes: 1 }),
        eventEndTime: DateTime.now().startOf('minute').plus({ minutes: 2 }),
      },
    ];
    i += 1;
  }

  return timeMap;
}

export function runNotificationEngine(
  notificationTimeMap: NotificationTimeMap,
  setNotificationTimeMap: Updater<NotificationTimeMap>,
  jobScheduledNext: NotificationJob,
  setJobScheduledNext: Updater<NotificationJob>,
  jobCurrentlyExecuting: Job,
  setJobCurrentlyExecuting: Updater<Job>,
  trayTextSetter: (payload: string) => void
) {
  const currentMinute = getCurrentMinute();
  const nextMinute = currentMinute + 1;

  // Cancel the job that was just running
  if (jobCurrentlyExecuting != null) {
    console.log('cancelling Job: ', jobCurrentlyExecuting);
    jobCurrentlyExecuting.cancel();
  }

  // Run the notification job that we have queued up
  const scheduledNotificationJob = scheduleSingleInstanceJob(
    jobScheduledNext.job
  );

  setJobCurrentlyExecuting(scheduledNotificationJob);

  // Build the next job
  const nextMinuteJob = createNextMinuteJob(
    notificationTimeMap,
    trayTextSetter
  );
  setJobScheduledNext(nextMinuteJob);
}

function createNextMinuteJob(
  notificationTimeMap: NotificationTimeMap,
  trayTextSetter: (payload: string) => void
): NotificationJob {
  const currentMinute = getCurrentMinute();
  const nextMinute = currentMinute + 1;

  const timeToStartNextMinute = DateTime.now()
    .startOf('minute')
    .plus({ minutes: 1, seconds: 0.5 });

  if (!(nextMinute in notificationTimeMap)) {
    // Create an empty string notification
    const job: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: timeToStartNextMinute,
      callback: () => trayTextSetter(''),
      extendBeyondActiveSession: false,
    };

    console.log('Returning');

    return {
      isPrelude: false,
      job: job,
      associatedEvent: null,
      eventStartTime: null,
      eventEndTime: null,
    };
  }

  const jobs = notificationTimeMap[nextMinute];

  if (jobs.length === 1) {
    return jobs[0];
  } else {
    //return buildUnion(jobs, trayTextSetter);
    return jobs[0]; // Innacurate
  }

  return;
}

function buildUnion(
  jobs: Array<NotificationJob>,
  trayTextSetter: (payload: string) => void
): NotificationJob | null {
  // logic to union the events

  return null;
}

export function getCurrentMinute() {
  const now = DateTime.now().startOf('minute');

  return now.minute + 60 * now.hour;
}

/**
 * Takes an event and creates an event job stream that handles the notifications for the entirety of the event.
 * The events are not actualyl scheduled. Scheduling the jobs is handled in InternalTimeEngine.
 * @param minutesBeforeDisplay
 * @param eventLeadupTitle
 * @param eventTitle
 * @param eventDuration
 * @param eventTime
 * @param trayTextSetter
 */
export function scheduleEventNotificationStream(
  minutesBeforeDisplay: number,
  eventLeadupTitle: string, // What gets displayed for "in x min: ____"
  eventTitle: string, // What gets displayed for "now: ____"
  eventDuration: number, // This is not a source of truth. If an event is added after it has started, then this will be inaccurate
  eventTime: DateTime,
  trayTextSetter: (payload: string) => void
): Array<ScheduledSingledInstanceJob> {
  let jobQueue = [];

  // Shorten Event
  const truncatedEventLeadupTitle =
    eventLeadupTitle.length < 18
      ? eventLeadupTitle
      : eventLeadupTitle.slice(0, 15) + '..';

  // Minutes n...2
  for (let i = minutesBeforeDisplay; i > 1; i--) {
    const executionTime = eventTime.minus({ minutes: i, seconds: -0.5 });

    const trayText =
      ' In ' + i.toString() + ' mins: ' + truncatedEventLeadupTitle;

    const job: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: executionTime,
      callback: () => trayTextSetter(trayText),
      extendBeyondActiveSession: false,
    };

    // Save to queue
    jobQueue.push(job);
  }

  // -----------  1 Minute Away -----------
  if (minutesBeforeDisplay >= 1) {
    const minuteTrayText = ' In 1 min: ' + truncatedEventLeadupTitle;

    const minuteJob: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: eventTime.minus({ minutes: 1, seconds: -0.5 }),
      callback: () => trayTextSetter(minuteTrayText),
      extendBeyondActiveSession: false,
    };

    // Save to queue
    jobQueue.push(minuteJob);
  }

  // ----------- During the Event -----------
  const eventTrayText = ' Now: ' + eventTitle;

  for (let i = 0; i < eventDuration; i++) {
    const eventJob: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: eventTime.plus({ minutes: i, seconds: 0.5 }),
      callback: () => trayTextSetter(eventTrayText),
      extendBeyondActiveSession: false,
    };

    // Save to queue
    jobQueue.push(eventJob);
  }

  // ----------- After the Event -----------

  const endEventJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: eventTime.plus({
      minutes: eventDuration,
      seconds: 0.5,
    }),
    callback: () => trayTextSetter(''), // Nothing should be shown
    extendBeyondActiveSession: false,
  };

  // Save to queue
  jobQueue.push(endEventJob);

  return jobQueue;
}
