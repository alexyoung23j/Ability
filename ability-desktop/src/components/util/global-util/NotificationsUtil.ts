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

export interface NotificationJob {
  isQueued: boolean;
  isExecuting: boolean;
  rawJobStream: ScheduledEventNotificationStream; // Corresponds to jobs that are not scheduled
  scheduledJobStream: Array<Job>;
}

export interface ScheduledEventNotificationStream {
  jobs: Array<ScheduledSingledInstanceJob>;
  correspondingEvent: CalendarIndexEvent | null; //Just for testing
  startTime: DateTime;
  endTime: DateTime;
}

export interface ScheduledNotificationJobBatch {
  timeScheduled: DateTime;
  jobBatch: Array<Job>;
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
    2,
    'First Event',
    4,
    nowStartMinute.plus({ minutes: 3 }),
    setTrayText
  );

  timeMap[currentMin+1] = {
    alreadyHandled: false,
    jobs: [
      {
        isQueued: false,
        isExecuting: false,
        rawJobStream: {
          jobs: jobStream1,
          correspondingEvent: null,
          startTime: nowStartMinute,
          endTime: nowStartMinute.plus({ minutes: 7 }),
        },
        scheduledJobStream: null,
      },
    ],
  };

  const jobStream2 = scheduleEventNotificationStream(
    2,
    'Second Event',
    1,
    nowStartMinute.plus({ minutes: 4 }),
    setTrayText
  );

  timeMap[currentMin + 2] = {
    alreadyHandled: false,
    jobs: [
      {
        isQueued: false,
        isExecuting: false,
        rawJobStream: {
          jobs: jobStream2,
          correspondingEvent: null,
          startTime: nowStartMinute.plus({ minutes: 2 }),
          endTime: nowStartMinute.plus({ minutes: 5 }),
        },
        scheduledJobStream: null,
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
      if (!job.isQueued) {
        job.isQueued = true;
        setNotificationJobStack([...notificationJobStack, job]); // temp
      }

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



export function handleUpdatesToJobStack(
  notificationJobStack: Array<NotificationJob>,
  setNotificationJobStack: Updater<NotificationJob[]>,
  currentJobMetaJobScheduler: Job,
  setCurrentMetaJobScheduler: Dispatch<SetStateAction<Job>>
) {
  if (notificationJobStack.length < 1) {
    return;
  }

  console.log('executing jobs');
  const topJob = notificationJobStack[notificationJobStack.length - 1];

  const newMetaJob = executeJobAndReturnMetaJob(
    topJob,
    notificationJobStack,
    setNotificationJobStack
  );

  // Cancel current meta job and assign new one
  currentJobMetaJobScheduler?.cancel();
  setCurrentMetaJobScheduler(newMetaJob);

  // Go thru other jobs in the stack. Cancel all the jobs in it. 
  // Then when we remove the top job and this bubbles to the surface, if it has any jobs 
  // that can still be run, they will get triggered. 

  for (let i = 0; i < notificationJobStack.length - 1; i++) {
    const notificationJob = notificationJobStack[i];
    cancelOrRescheduleJob(notificationJob, newMetaJob);
  }

  clearEmptyJobs(notificationJobStack, setNotificationJobStack);




}

function executeJobAndReturnMetaJob(
  jobToExecute: NotificationJob,
  notificationJobStack: Array<NotificationJob>,
  setNotificationJobStack: Updater<NotificationJob[]>
) {
  // Schedule all the jobs
  let scheduledJobs = [];
  for (const job of jobToExecute.rawJobStream.jobs) {
    // schedule only the jobs that occur after or right now
    console.log("now: ", DateTime.now().startOf("minute").toISO())
    if (job.scheduledExecutionTime > DateTime.now().startOf("minute")) {
      console.log("This was After: ", job.scheduledExecutionTime.toISO())
      const scheduledStreamJob = scheduleSingleInstanceJob(job);
      scheduledJobs.push(scheduledStreamJob);
    } else if (job.scheduledExecutionTime >= DateTime.now().startOf("minute").minus({minutes:1})) {
      console.log("this was now: ", job.scheduledExecutionTime.toISO())
      const modifiedJob = {...job, scheduledExecutionTime: DateTime.now().plus({seconds: 1})}
      console.log("And the job associated with it: ", modifiedJob)
      const scheduledStreamJob = scheduleSingleInstanceJob(modifiedJob);
      scheduledJobs.push(scheduledStreamJob);
    }
    
  }

  notificationJobStack[notificationJobStack.length - 1].scheduledJobStream =
    scheduledJobs;

  const metaJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: jobToExecute.rawJobStream.endTime,
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
  console.log('removing from stack');
  // TODO: check if this is working right
  const removedTop = notificationJobStack.slice(
    0,
    notificationJobStack.length - 1
  );
  setNotificationJobStack(removedTop);
}

function cancelOrRescheduleJob(notificationJob: NotificationJob, newMetaJob: Job) {

  console.log("next invocation: ", newMetaJob.nextInvocation())
  let cancelledAllJobs = true;
  
  for (const scheduledJob of notificationJob.scheduledJobStream) {  
    if (scheduledJob != null) {
      console.log('cancelling: ', scheduledJob);
      scheduledJob.cancel();
    }
  }
}


function clearEmptyJobs(notificationJobStack: Array<NotificationJob>,
  setNotificationJobStack: Updater<NotificationJob[]>) {

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

  for (let i = 0; i < eventDuration; i++) {
    const eventJob: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: eventTime.plus({minutes: i}),
      callback: () => trayTextSetter(eventTrayText),
      extendBeyondActiveSession: false,
    };
  
    // Save to queue
    jobQueue.push(eventJob);
  }

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