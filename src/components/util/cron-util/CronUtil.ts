//const schedule = require('node-schedule');
import schedule, { RecurrenceRule, Job } from 'node-schedule';
import { DateTime } from 'luxon';

export interface ScheduledSingledInstanceJob {
  scheduledExecutionTime: DateTime;
  callback: any;
  extendBeyondActiveSession: boolean;
  dbScheduleInfo?: dbScheduleInfo;
}

interface ScheduledRecurringJob {
  scheduledRecurringExecutionTime: RecurrenceRule;
  callback: () => void;
  extendBeyondActiveSession: boolean;
  dbScheduleInfo?: dbScheduleInfo;
}

interface dbScheduleInfo {
  // For later when we figure out what we need in terms of keeping jobs outside the scope of this
  temp: any;
}

// ---------------------- BASIC METHODS ------------------------ //

export function scheduleSingleInstanceJob(
  job: ScheduledSingledInstanceJob
): Job {
  const scheduledJob = schedule.scheduleJob(
    job.scheduledExecutionTime,
    job.callback
  );

  return scheduledJob;
}

export function scheduleRecurringJob(job: ScheduledRecurringJob) {
  const recurrence = job.scheduledRecurringExecutionTime;

  schedule.scheduleJob(recurrence, job.callback);
}

// ---------------------- NOTIFICATIONS METHODS ------------------------ //

function scheduleTrayNotification(
  minutesBeforeDisplay: number,
  eventTitle: string,
  eventDuration: number,
  eventTime: DateTime,
  trayTextSetter: (payload: string) => void
) {
  let jobQueue = [];

  const truncatedEventTitle =
    eventTitle.length < 10 ? eventTitle : eventTitle.slice(0, 8) + '..';

  for (let i = 1; i < minutesBeforeDisplay; i++) {
    const executionTime = eventTime.minus({ minutes: i });

    const trayText = i.toString() + ' mins:' + truncatedEventTitle;
    const job: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: executionTime,
      callback: trayTextSetter(trayText),
      extendBeyondActiveSession: false,
    };

    jobQueue.push(job);
  }

  const;
}
