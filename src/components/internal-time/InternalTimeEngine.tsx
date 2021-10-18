import React, { useState, useEffect } from 'react';
import CommandView from '../command-window/CommandView';
import SettingsView from '../settings-window/SettingsView';
const { DateTime } = require('luxon');
import {
  scheduleEventNotificationStream,
  ScheduledSingledInstanceJob,
  scheduleSingleInstanceJob,
} from '../util/cron-util/CronUtil';

interface InternalTimeEngineProps {
  showCommand: boolean;
  toggleWindowHandler: any;
  setTrayText: (payload: string) => void;
}

/**
 * InternalTimeEngine renders the entirety of the app (aside from the login screen). It acts as a controller, allowing us
 * to manage all internal event scheduling and cron jobs in one high level place.
 * @param props
 */
export default function InternalTimeEngine(props: InternalTimeEngineProps) {
  const { showCommand, toggleWindowHandler, setTrayText } = props;

  const [dailyJobsScheduled, setDailyJobsScheduled] = useState(false);

  // --------------------------- Notifications ------------------- //

  useEffect(() => {
    if (!dailyJobsScheduled) {
      setDailyJobsScheduled(true);
      scheduleEventNotificationStream(
        2,
        'Meeting',
        1,
        DateTime.now().minus({ minutes: 2, seconds: 4 }),
        setTrayText
      );
    }
  }, []);

  return (
    <div>
      {(showCommand && <CommandView />) || (
        <SettingsView toggleWindowHandler={toggleWindowHandler} />
      )}
    </div>
  );
}
