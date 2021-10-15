//const schedule = require('node-schedule');
import schedule from 'node-schedule';
import { DateTime } from 'luxon';

export interface ScheduledSingledInstanceJob {
  scheduledExecutionTime: DateTime;
  callback: Function;
  extendBeyondActiveSession: boolean;
  dbScheduleInfo?: dbScheduleInfo;
}

interface ScheduledRecurringJob {
  scheduledRecurringExecutionTime: {
    second?: number; // unlike all other values whose default is null, this defaults to 0
    minute?: number;
    hour?: number;
    date?: number;
    month?: number;
    year?: string;
    dayOfWeek?: number;
    tz?: number;
  };
  callback: Function;
  extendBeyondActiveSession: boolean;
  dbScheduleInfo?: dbScheduleInfo;
}

interface dbScheduleInfo {
  // For later when we figure out what we need in terms of keeping jobs outside the scope of this
  temp: any;
}

export function scheduleJob(executionTime: DateTime, callback: () => void) {
  const job = schedule.scheduleJob(executionTime, callback);
}

export function scheduleSingleInstanceJob(job: ScheduledSingledInstanceJob) {
  schedule.scheduleJob(job.scheduledExecutionTime, job.callback);
}

export function scheduleRecurringJob(job: ScheduledRecurringJob) {
  const recurrence = job.scheduledRecurringExecutionTime;

  schedule.scheduleJob(recurrence, job.callback);
}
