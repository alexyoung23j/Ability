//const schedule = require('node-schedule');
import schedule, { RecurrenceRule, Job } from 'node-schedule';
import { DateTime } from 'luxon';
import { ipcRenderer } from 'electron';

export interface ScheduledSingledInstanceJob {
  scheduledExecutionTime: DateTime;
  callback: any;
  extendBeyondActiveSession: boolean;
  dbScheduleInfo?: dbScheduleInfo;
}

export interface ScheduledRecurringJob {
  scheduledRecurrenceRule: RecurrenceRule | object;
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
  job: ScheduledSingledInstanceJob
): Job {
  const scheduledJob = schedule.scheduleJob(
    job.scheduledExecutionTime.toJSDate().valueOf(),
    job.callback
  );

  return scheduledJob;
}

export function scheduleRecurringJob(job: ScheduledRecurringJob) {
  const recurrence = job.scheduledRecurrenceRule;

  schedule.scheduleJob(recurrence, job.callback);
}

// ---------------------- NOTIFICATIONS METHODS ------------------------ //

export function scheduleEventNotificationStream(
  minutesBeforeDisplay: number,
  eventTitle: string,
  eventDuration: number,
  eventTime: DateTime,
  trayTextSetter: (payload: string) => void
) {
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

    // Schedule and Save
    const scheduledJob = scheduleSingleInstanceJob(job);
    jobQueue.push(scheduledJob);
  }

  // -----------  1 Minute Away -----------
  const minuteTrayText = ' In 1 min: ' + truncatedEventTitle;

  const minuteJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: eventTime.minus({ minutes: 1 }),
    callback: () => trayTextSetter(minuteTrayText),
    extendBeyondActiveSession: false,
  };

  // Schedule and Save
  const scheduledMinuteJob = scheduleSingleInstanceJob(minuteJob);
  jobQueue.push(scheduledMinuteJob);

  // ----------- During the Event -----------
  const eventTrayText = ' Now: ' + truncatedEventTitle;

  const eventJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: eventTime,
    callback: () => trayTextSetter(eventTrayText),
    extendBeyondActiveSession: false,
  };

  // Schedule and Save
  const scheduledEventJob = scheduleSingleInstanceJob(eventJob);
  jobQueue.push(scheduledEventJob);

  // ----------- After the Event -----------

  const endEventJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: eventTime.plus({ minutes: eventDuration }),
    callback: () => trayTextSetter(''), // Nothing should be shown
    extendBeyondActiveSession: false,
  };

  // Schedule and Save
  const scheduledEndEventJob = scheduleSingleInstanceJob(endEventJob);
  jobQueue.push(scheduledEndEventJob);
}
