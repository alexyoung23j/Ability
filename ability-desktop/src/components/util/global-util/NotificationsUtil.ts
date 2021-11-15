import { DateTime } from 'luxon';
import { Job } from 'node-schedule';
import { Updater } from 'use-immer';
import { GlobalUserSettings } from '../../../constants/types';
import {
  CalendarIndexDay,
  CalendarIndexEvent,
} from '../command-view-util/CalendarIndexUtil';
import {
  ScheduledSingledInstanceJob,
  scheduleSingleInstanceJob,
} from '../cron-util/CronUtil';

export interface NotificationJob {
  isPrelude: boolean;
  job: ScheduledSingledInstanceJob;
  associatedEvent: Array<CalendarIndexEvent> | null;
  eventStartTime: DateTime;
  eventEndTime: DateTime;
}

export interface NotificationTimeMap {
  [key: number]: Array<NotificationJob>;
}

function getEventStartMinute(event: CalendarIndexEvent): number {
  const startDateTime = DateTime.fromISO(event.startTime.dateTime!);
  return startDateTime.minute + 60 * startDateTime.hour;
}

export function buildTimeMap(
  calendarIndexDay: CalendarIndexDay,
  trayTextSetter: (payload: string) => void,
  globalUserSettings: GlobalUserSettings
) {
  if (!globalUserSettings.notificationSettings.notificationsEnabled) {
    // User doesnt want notifications
    return {};
  }
  // TODO: Build actual time map

  let timeMap: NotificationTimeMap = {};
  const currentMin = getCurrentMinute();

  const minutesBeforeDisplay =
    globalUserSettings.notificationSettings.minutesBeforeDisplay;

  for (const event of calendarIndexDay.events) {
    if (event.isAllDayEvent) {
      continue;
    }
    // Find out when the event is in terms of minutes
    const eventStartMinute = getEventStartMinute(event);
    const eventDurationMinutes = DateTime.fromISO(event.endTime.dateTime!)
      .diff(DateTime.fromISO(event.startTime.dateTime!), ['minutes'])
      .toObject().minutes!;
    const eventStartTimeDateTime = DateTime.fromISO(event.startTime.dateTime!);
    const eventEndTimeDateTime = DateTime.fromISO(event.endTime.dateTime!);

    // Using the global settings, put the jobs in the appropriate timeslots

    // Build Preludes

    const preludeJobs = scheduleEventNotificationStream(
      minutesBeforeDisplay,
      event.summary,
      event.summary,
      eventDurationMinutes,
      eventStartTimeDateTime,
      trayTextSetter
    );

    console.log('Data: ', eventStartMinute, eventDurationMinutes);

    for (
      let index = eventStartMinute - minutesBeforeDisplay;
      index < eventStartMinute + eventDurationMinutes;
      index++
    ) {
      const indexInJobsArr = index - (eventStartMinute - minutesBeforeDisplay);
      const isPrelude = index < eventStartMinute;
      console.log('index: ', index, isPrelude);
      const notificationJob: NotificationJob = {
        isPrelude: isPrelude,
        job: preludeJobs[indexInJobsArr],
        associatedEvent: [event],
        eventStartTime: eventStartTimeDateTime,
        eventEndTime: eventEndTimeDateTime,
      };

      if (timeMap[index] != null) {
        timeMap[index].push(notificationJob);
      } else {
        timeMap[index] = [notificationJob];
      }
    }
  }

  return timeMap;
}

export function runNotificationEngine(
  notificationTimeMap: NotificationTimeMap,
  setNotificationTimeMap: Updater<NotificationTimeMap>,
  jobScheduledNext: NotificationJob | null,
  setJobScheduledNext: Updater<NotificationJob | null>,
  jobCurrentlyExecuting: Job | null,
  setJobCurrentlyExecuting: Updater<Job | null>,
  trayTextSetter: (payload: string) => void
) {
  if (jobScheduledNext == null) {
    return;
  }

  const currentMinute = getCurrentMinute();
  const nextMinute = currentMinute + 1;

  console.log('curMin: ', currentMinute);

  // Cancel the job that was just running
  if (jobCurrentlyExecuting != null) {
    jobCurrentlyExecuting.cancel();
  }

  // Run the notification job that we have queued up
  console.log('should be running next job: ', jobScheduledNext);
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

export function createNextMinuteJob(
  notificationTimeMap: NotificationTimeMap,
  trayTextSetter: (payload: string) => void
): NotificationJob | null {
  const currentMinute = getCurrentMinute();
  const nextMinute = currentMinute + 1;

  const timeToStartNextMinute = DateTime.now()
    .startOf('minute')
    .plus({ minutes: 1, seconds: 0.5 });

  if (!(nextMinute in notificationTimeMap)) {
    console.log('next scheduled is empty');
    // Create an empty string notification
    const job: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: timeToStartNextMinute,
      callback: () => trayTextSetter(''),
      extendBeyondActiveSession: false,
    };

    const now = DateTime.now().startOf('minute');
    return {
      isPrelude: false,
      job: job,
      associatedEvent: null,
      eventStartTime: now.plus({ minutes: 1 }),
      eventEndTime: now.plus({ minutes: 2 }),
    };
  }

  const jobs = notificationTimeMap[nextMinute];

  return jobs.length === 1 ? jobs[0] : buildUnion(jobs, trayTextSetter);
}

export function buildUnion(
  jobs: Array<NotificationJob>,
  trayTextSetter: (payload: string) => void
): NotificationJob | null {
  // logic to union the events

  const allStartAtSameTime = jobsStartAtSameTime(jobs);

  if (allStartAtSameTime) {
    const eventsStartTime = jobs[0].eventStartTime;
    if (!jobs[0].isPrelude) {
      // We already passed the start time, lets create a current union

      const numEvents = jobs.length;
      const titleString = ' Now: ' + numEvents.toString() + ' events';
      const timeToStartNextMinute = DateTime.now()
        .startOf('minute')
        .plus({ minutes: 1, seconds: 0.5 });

      const job: ScheduledSingledInstanceJob = {
        scheduledExecutionTime: timeToStartNextMinute,
        callback: () => trayTextSetter(titleString),
        extendBeyondActiveSession: false,
      };

      const now = DateTime.now();
      return {
        isPrelude: false,
        job: job,
        associatedEvent: null, // TODO: add all events
        eventStartTime: now.plus({ minutes: 1 }),
        eventEndTime: now.plus({ minutes: 2 }),
      };
    } else {
      // Its a prelude event so we build preludes
      const minutesUntilEvents =
        DateTime.now().startOf('minute').diff(eventsStartTime).minutes + 1;

      const numEvents = jobs.length;
      const titleString =
        ' In ' +
        minutesUntilEvents.toString() +
        ' mins: ' +
        numEvents.toString() +
        ' events';
      const timeToStartNextMinute = DateTime.now()
        .startOf('minute')
        .plus({ minutes: 1, seconds: 0.5 });

      const job: ScheduledSingledInstanceJob = {
        scheduledExecutionTime: timeToStartNextMinute,
        callback: () => trayTextSetter(titleString),
        extendBeyondActiveSession: false,
      };

      const now = DateTime.now();
      return {
        isPrelude: true,
        job: job,
        associatedEvent: null, // TODO: add all events
        eventStartTime: now.plus({ minutes: 1 }),
        eventEndTime: now.plus({ minutes: 2 }),
      };
    }
  } else {
    const nextSoonestStartJob = findNextSoonest(jobs);
    if (nextSoonestStartJob != null) {
      // We have a job that starts soon
      return nextSoonestStartJob;
    } else {
      // There is no job that starts soon, all are going now.
      const numEvents = jobs.length;
      const titleString = ' Now: ' + numEvents.toString() + ' events';
      const timeToStartNextMinute = DateTime.now()
        .startOf('minute')
        .plus({ minutes: 1, seconds: 0.5 });

      const job: ScheduledSingledInstanceJob = {
        scheduledExecutionTime: timeToStartNextMinute,
        callback: () => trayTextSetter(titleString),
        extendBeyondActiveSession: false,
      };

      const now = DateTime.now();
      return {
        isPrelude: false,
        job: job,
        associatedEvent: null, // TODO: add all events
        eventStartTime: now.plus({ minutes: 1 }),
        eventEndTime: now.plus({ minutes: 2 }),
      };
    }
  }
}

/**
 * Find next soonest job that starts
 * @param jobs
 */
function findNextSoonest(jobs: Array<NotificationJob>): NotificationJob | null {
  const now = DateTime.now();
  let nextSoonestTime = DateTime.now().plus({ days: 1 });
  let nextSoonestJob: NotificationJob | null = null;

  for (const job of jobs) {
    const jobStart = job.eventStartTime;

    if (jobStart < nextSoonestTime && jobStart > now && job.isPrelude) {
      nextSoonestJob = job;
      nextSoonestTime = nextSoonestTime;
    }
  }

  return nextSoonestJob;
}

function jobsStartAtSameTime(jobs: Array<NotificationJob>) {
  let firstStartTime = jobs[0].eventStartTime;

  for (const job of jobs) {
    if (!job.eventStartTime.equals(firstStartTime)) {
      return false;
    }
  }
  return true;
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
  const jobQueue: Array<ScheduledSingledInstanceJob> = [];

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
