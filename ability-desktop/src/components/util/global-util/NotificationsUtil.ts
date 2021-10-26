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
  isQueued: boolean;
  isExecuting: boolean;
  rawJobStream: ScheduledEventNotificationStream | null; // Corresponds to jobs that are not scheduled
  scheduledJobStream: Array<Job>;
  isUnion: boolean,
  jobID: string | null
}

interface UnionEvent {
  eventsInUnion: Array<CalendarIndexEvent>
}

export interface ScheduledEventNotificationStream {
  jobs: Array<ScheduledSingledInstanceJob>;
  correspondingEvent: CalendarIndexEvent | UnionEvent | null; // null just for testing
  startTime: DateTime;
  eventStartTime: DateTime // This indicates when the event actually starts, excludes the prelude "in x minute" jobs
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
          eventStartTime: nowStartMinute.plus({minutes: 3}),
          endTime: nowStartMinute.plus({ minutes: 7 }),
        },
        scheduledJobStream: null,
        isUnion: false,
        jobID: null
      },
    ],
  };

  const jobStream2 = scheduleEventNotificationStream(
    2,
    'Second Event',
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
          eventStartTime: nowStartMinute.plus({minutes: 4}),
          endTime: nowStartMinute.plus({ minutes: 5 }),
        },
        scheduledJobStream: null,
        isUnion: false,
        jobID: null
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
        //const newStack = performUnion([...notificationJobStack, job]);
        setNotificationJobStack([...notificationJobStack, job]); // temp
      }

      
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

  // The Top job in the stack at this point is NOT a union job. This is because it was added from the time map
  // If we already have a union job (lol), then it is guaranteed to the the second from the top 
  // otherwise, we only have one job 

  const newJob = jobStack[jobStack.length-1];


  // Look at top job, identify when it starts, ends, and 
  let unionStartTime: DateTime = newJob.rawJobStream.startTime;
  let unionEventStartTime: DateTime = newJob.rawJobStream.eventStartTime;
  let unionEndTime: DateTime = newJob.rawJobStream.endTime;
  let minutesBeforeDisplay = 0;

  

  let numEventsStartAtSameTime = 1;

  for (let i = jobStack.length-2; i > -1; i--) {
    const notifJob = jobStack[i];

    // Jobs start at the same time, meaning we should have some countdown to them 
    if (notifJob.rawJobStream.eventStartTime.equals(newJob.rawJobStream.eventStartTime)) {
      numEventsStartAtSameTime += 1;
    }

    // Check if Union job
    if (notifJob.isUnion) {

    } else {

    }
  }

  if (numEventsStartAtSameTime > 1) {
    minutesBeforeDisplay = newJob.rawJobStream.eventStartTime.minute - DateTime.now().minute
  }



  let newUnionStream: ScheduledEventNotificationStream = {
    jobs: [],
    correspondingEvent: null,
    startTime: unionStartTime,
    eventStartTime: unionEventStartTime,
    endTime: unionEndTime

  }

  let newUnionJob: NotificationJob = {
    isQueued: true,
    isExecuting: false,
    rawJobStream: newUnionStream,
    scheduledJobStream: [],
    isUnion: true,
    jobID: null
  }



  return [...jobStack, newUnionJob];
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
    if (job.scheduledExecutionTime > DateTime.now().startOf("minute")) {
      const scheduledStreamJob = scheduleSingleInstanceJob(job);
      scheduledJobs.push(scheduledStreamJob);
    } else if (job.scheduledExecutionTime >= DateTime.now().startOf("minute").minus({minutes:1})) {
      const modifiedJob = {...job, scheduledExecutionTime: DateTime.now().plus({seconds: 1})}
      const scheduledStreamJob = scheduleSingleInstanceJob(modifiedJob);
      scheduledJobs.push(scheduledStreamJob);
    }
    
  }

  // Create JobID for removal
  const jobID = uuidv4()

  // Assign jobs and jobID
  jobToExecute.scheduledJobStream =
    scheduledJobs;
  jobToExecute.jobID = jobID;
  

  // If the job is old, and it ended already, we should just immediately remove it
  const metaJobExecutionTime = (jobToExecute.rawJobStream.endTime > DateTime.now()) ? jobToExecute.rawJobStream.endTime : DateTime.now().plus({seconds: 1})

  const metaJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: metaJobExecutionTime,
    callback: () =>
      removeJobFromStack(notificationJobStack, setNotificationJobStack, jobID),
    extendBeyondActiveSession: false,
  };

  const scheduledMetaJob = scheduleSingleInstanceJob(metaJob);

  return scheduledMetaJob;
}

function removeJobFromStack(
  notificationJobStack: Array<NotificationJob>,
  setNotificationJobStack: Updater<NotificationJob[]>,
  jobID: string
) {
  if (notificationJobStack.length < 1) {
    return;
  }
  for (let i = 0; i < notificationJobStack.length; i++) {

    const job = notificationJobStack[i];

    if (job.jobID === jobID) {
      console.log("found: ", jobID, job, notificationJobStack.splice(i, 1))
      setNotificationJobStack(notificationJobStack.splice(i, 1))
      break
    } 
  }
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
  eventLeadupTitle.length < 18 ? eventLeadupTitle : eventLeadupTitle.slice(0, 15) + '..';

  // Minutes n...2
  for (let i = minutesBeforeDisplay; i > 1; i--) {
    const executionTime = eventTime.minus({ minutes: i });

    const trayText = ' In ' + i.toString() + ' mins: ' + truncatedEventLeadupTitle;

    const job: ScheduledSingledInstanceJob = {
      scheduledExecutionTime: executionTime,
      callback: () => trayTextSetter(trayText),
      extendBeyondActiveSession: false,
    };

    // Save to queue
    jobQueue.push(job);
  }

  // -----------  1 Minute Away -----------
  const minuteTrayText = ' In 1 min: ' + truncatedEventLeadupTitle;

  const minuteJob: ScheduledSingledInstanceJob = {
    scheduledExecutionTime: eventTime.minus({ minutes: 1 }),
    callback: () => trayTextSetter(minuteTrayText),
    extendBeyondActiveSession: false,
  };

  // Save to queue
  jobQueue.push(minuteJob);

  // ----------- During the Event -----------
  const eventTrayText = ' Now: ' + eventTitle;

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