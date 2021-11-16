//const schedule = require('node-schedule');
import schedule, { RecurrenceRule, Job } from 'node-schedule';
import { DateTime } from 'luxon';
import { ipcRenderer } from 'electron';

// TODO: rename this to single lol
export interface ScheduledSingledInstanceJob {
  scheduledExecutionTime: DateTime;
  callback: any;
  extendBeyondActiveSession: boolean;
  dbScheduleInfo?: dbScheduleInfo;
}

export interface ScheduledRecurringJob {
  scheduledRecurrenceRule: string | RecurrenceRule | object;
  callback: any;
  extendBeyondActiveSession: boolean;
  dbScheduleInfo?: dbScheduleInfo;
}

interface dbScheduleInfo {
  // For later when we figure out what we need in terms of keeping jobs outside the scope of this
  temp: any;
}

// ---------------------- BASIC METHODS ------------------------ //

export function scheduleSingleInstanceJob(
  job: ScheduledSingledInstanceJob,
  executionTime?: DateTime
): Job {
  const scheduledJob = schedule.scheduleJob(
    executionTime?.toJSDate().valueOf() ??
      job.scheduledExecutionTime.toJSDate().valueOf(),
    job.callback
  );

  return scheduledJob;
}

export function scheduleRecurringJob(job: ScheduledRecurringJob) {
  const recurrence = job.scheduledRecurrenceRule;

  schedule.scheduleJob(recurrence, job.callback);
}
