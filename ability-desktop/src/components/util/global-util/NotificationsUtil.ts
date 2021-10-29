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

export function buildTimeMap(calendarIndex: CalendarIndex) {}

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
  jobCurrentlyExecuting.cancel();

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
    .plus({ minutes: 1, seconds: 1 });

  if (!(nextMinute in notificationTimeMap)) {
    // Create an empty string notification
    const job: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: timeToStartNextMinute,
      callback: () => trayTextSetter(''),
      extendBeyondActiveSession: false,
    };

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
    return buildUnion(jobs, trayTextSetter);
  }

  return;
}

function buildUnion(
  jobs: Array<NotificationJob>,
  trayTextSetter: (payload: string) => void
): NotificationJob {
  // logic to union the events

  return {};
}

function getCurrentMinute() {
  const now = DateTime.now().startOf('minute');

  return now.minute + 60 * now.hour;
}
