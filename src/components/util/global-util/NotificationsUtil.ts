import { ScheduledSingledInstanceJob } from '../cron-util/CronUtil';
import { CalendarIndexEvent } from '../command-view-util/CalendarIndexUtil';
import { DateTime } from 'luxon';

export interface NotificationJob {
  isQueued: boolean;
  isExecuting: boolean;
  jobStream: ScheduledEventNotificationStream;
}

export interface ScheduledEventNotificationStream {
  jobs: Array<ScheduledSingledInstanceJob>;
  correspondingEvent: CalendarIndexEvent;
  startTime: DateTime;
  endTime: DateTime;
}
