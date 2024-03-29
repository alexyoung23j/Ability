import {
  FreeBlock,
  CalendarResultEvent,
} from 'components/command-window/results-display/engines/ResultEngine';

const { DateTime } = require('luxon');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);
export const BAR_WIDTH = 40;

// -------------------------- UI STUFF -------------------------- //

// Calculates a pixel offset for the minutes.
// TODO: Make this more fine grained to handle times not on the 15 30 45 marks
function calculateMinutes(minutes: number) {
  const offset = (Math.abs(minutes) / 60) * 4;

  return minutes >= 0 ? offset : -offset;
}

// Calculates a pixel offset value for use within Horizontal Calendar.
export function datetimeToOffset(
  start: string,
  end: string,
  borderAdjust: number
) {
  const startTime = DateTime.fromISO(start);
  const endTime = DateTime.fromISO(end);

  const startHour = startTime.hour;
  const endHour = endTime.hour;

  const startMin = startTime.minute;
  const endMin = endTime.minute;

  var minOffset = calculateMinutes(startMin);
  var minDifferenceOffset = calculateMinutes(endMin - startMin);

  // Formula for finding the offset from right needed (assumes the size of each bar is BAR_WIDTH)

  const offset =
    BAR_WIDTH / 2 + (24 - startHour) * BAR_WIDTH - minOffset * (BAR_WIDTH / 4);

  const width =
    (endHour - startHour) * BAR_WIDTH + minDifferenceOffset * (BAR_WIDTH / 4);

  return [String(offset - width + 'px'), String(width - borderAdjust + 'px')];
}

export function datetimeToRangeString(
  start: string,
  end: string,
  militaryTime: boolean
) {
  const startTime = DateTime.fromISO(start);
  const endTime = DateTime.fromISO(end);

  const startHour = startTime.hour;
  const endHour = endTime.hour;

  let startHourString;
  let endHourString;

  let startStandardMofidier = '';
  let endStandardMofidier = '';

  if (!militaryTime) {
    if (startHour > 12) {
      startHourString = (startHour % 12).toString();
    } else {
      startHourString = startHour.toString();
    }

    if (endHour > 12) {
      endHourString = (endHour % 12).toString();
    } else {
      endHourString = endHour.toString();
    }

    if (startHour > 11) {
      startStandardMofidier = ' PM';
    } else {
      startStandardMofidier = ' AM';
    }

    if (endHour > 11) {
      endStandardMofidier = ' PM';
    } else {
      endStandardMofidier = ' AM';
    }
  } else {
    startHourString = startHour.toString();
    endHourString = endHour.toString();
  }

  const startMin = startTime.minute;
  let startMinString;

  if (startMin < 10) {
    startMinString = '0' + startMin.toString();
  } else {
    startMinString = startMin.toString();
  }

  const endMin = endTime.minute;
  let endMinString;

  if (endMin < 10) {
    endMinString = '0' + endMin.toString();
  } else {
    endMinString = endMin.toString();
  }

  const dateString =
    startHourString +
    ':' +
    startMinString +
    startStandardMofidier +
    '  -  ' +
    endHourString +
    ':' +
    endMinString +
    endStandardMofidier;

  return dateString;
}

// Generates a series of intervals with format {start_time: ISOString, end_time: ISOString}
// Returns an array of these intervals
export function generateIntervals(
  start_time,
  end_time,
  interval_size,
  slot_size,
  roundUp
) {
  let intervals = [];

  var curTime = roundToNearestInterval(
    DateTime.fromISO(start_time),
    interval_size,
    roundUp
  );
  var endTime = roundToNearestInterval(
    DateTime.fromISO(end_time),
    interval_size,
    roundUp
  );

  let currentPlusSlotSize = curTime.plus({ minute: slot_size });

  while (currentPlusSlotSize <= endTime) {
    // Find an interval from current to current + 1 hour
    const newEnd = curTime.plus({ minute: slot_size }).toISO();
    let newInterval = { start_time: curTime.toISO(), end_time: newEnd };
    intervals.push(newInterval);

    // Move forward
    curTime = curTime.plus({ minute: interval_size });
    currentPlusSlotSize = curTime.plus({ minutes: slot_size });
  }

  return intervals;
}

// Rounds a time to the nearest value with precision specified by interval (i.e. 8:42 -> 8:45 with interval = 15)
// Accepts "time" as an Luxon DateTime Object
export function roundToNearestInterval(
  time,
  interval: number,
  roundUp: boolean
) {
  var roundedTime = time;
  //myConsole.log(roundedTime)

  if (roundUp) {
    const preciseMinutes = time.minute;
    const roundedMinutes = Math.ceil(preciseMinutes / interval) * interval;
    roundedTime = roundedTime.set({ minute: roundedMinutes });

    if (roundedMinutes == 0 && preciseMinutes != 0) {
      roundedTime = roundedTime.set({ hour: time.hour + 1 });
    }
  } else {
    const preciseMinutes = time.minute;
    const roundedMinutes = Math.floor(preciseMinutes / interval) * interval;
    roundedTime = roundedTime.set({ minute: roundedMinutes });
  }

  return roundedTime;
}

// Creates an array of objects storing the time options seperated by minute intervals
// Objects in the array store the hour and minute associated with the option
export function generatePickerTimeOptions(
  military: boolean,
  minuteInterval: number
) {
  let timeOptions = [];

  if (military) {
    for (var hour = 0; hour < 24; hour += 1) {
      for (var minute = 0; minute < 60; minute += minuteInterval) {
        let hourString = hour.toString();

        let minuteString = minute.toString();
        if (minute < 10) {
          minuteString = '0' + minute.toString();
        }

        let optionText = hourString + ':' + minuteString;

        let option = { text: optionText, hour: hour, minute: minute };
        timeOptions.push(option);
      }
    }
  } else {
    for (var hour = 0; hour < 24; hour += 1) {
      for (var minute = 0; minute < 60; minute += minuteInterval) {
        let optionText = '';
        if (hour > 12) {
          let newHour = hour % 12;

          let hourString = newHour.toString();

          let minuteString = minute.toString();
          if (minute < 10) {
            minuteString = '0' + minute.toString();
          }

          optionText = hourString + ':' + minuteString + ' PM';
        } else if (hour == 0) {
          let hourString = '12';

          let minuteString = minute.toString();
          if (minute < 10) {
            minuteString = '0' + minute.toString();
          }

          optionText = hourString + ':' + minuteString + ' AM';
        } else {
          let hourString = hour.toString();

          let minuteString = minute.toString();
          if (minute < 10) {
            minuteString = '0' + minute.toString();
          }

          optionText = hourString + ':' + minuteString + ' AM';
        }

        let option = { text: optionText, hour: hour, minute: minute };
        timeOptions.push(option);
      }
    }
  }

  return timeOptions;
}

// ------------------------------------- RESULT ENGINE STUFF ---------------------------- //

/**
 *
 * @param hard_start The hard start limit
 * @param hard_stop the hard stop limit
 * @param min_duration The smallest value (in minutes) that a block can be. This might be redundant, remove it later
 * @param slot_size The size of the slots (in minutes)
 * @param interval_size The interval size in minutes. For instance, an interval of 15 will cause a block starting at 9:42 to be adjusted to 9:45
 * @param events The CalendarResultEvents that correspond to this day. Sorted by start time
 */
export function CalculateFreeBlocks2(
  hard_start: string,
  hard_stop: string,
  min_duration: number,
  slot_size: number,
  interval_size: number,
  events: Array<CalendarResultEvent>
): Array<FreeBlock> {
  let blocks = [];

  const firstBlockStartNotAdjusted = _calculateFirstStart(hard_start, events);
}

function _calculateFirstStart(
  hard_start: string,
  events: Array<CalendarResultEvent>
): DateTime {}

// Takes in information about a given day, creates the free blocks and slots corresponding to that day
// Remember, events are listed in order of start time
export function CalculateFreeBlocks(
  hard_start: string,
  hard_stop: string,
  min_duration: number,
  slot_size: number,
  interval_size: number,
  events: Array<{
    start_time: string;
    end_time: string;
    title: string;
    url: string;
    color: string;
    index_of_overlapped_events: Array<number>;
  }>
) {
  let blocks = [];

  if (events.length < 1) {
    const newBlock = {
      start_time: hard_start,
      end_time: hard_stop,
      free_slots: generateIntervals(
        DateTime.fromISO(hard_start),
        DateTime.fromISO(hard_stop),
        interval_size,
        slot_size,
        true
      ),
    };
    blocks.push(newBlock);
    return blocks;
  }

  // Establish a pointer to this moment and the end of this slot
  let currentBlockStartTime = DateTime.fromISO(hard_start);
  currentBlockStartTime = roundToNearestInterval(
    currentBlockStartTime,
    interval_size,
    true
  );
  let currentSlotEnd = currentBlockStartTime.plus({ minutes: slot_size });

  let endTime = DateTime.fromISO(hard_stop);
  endTime = roundToNearestInterval(endTime, interval_size, true);

  let eventIdx = 0;

  // Ignore events that start before our hard start
  while (
    eventIdx < events.length &&
    DateTime.fromISO(events[eventIdx].start_time) <=
      DateTime.fromISO(hard_start)
  ) {
    // if we need to move the first block forward, do so
    if (
      DateTime.fromISO(events[eventIdx].end_time) >=
      DateTime.fromISO(hard_start)
    ) {
      currentBlockStartTime = roundToNearestInterval(
        DateTime.fromISO(events[eventIdx].end_time),
        interval_size,
        true
      );
    }
    eventIdx += 1;
  }

  let eventEnd;
  if (eventIdx < events.length) {
    eventEnd = DateTime.fromISO(events[eventIdx].end_time);
  } else {
    // Handle when we already saw every event, and need to just continue creating blocks and slots until the hard stop
    eventEnd = DateTime.fromISO(hard_stop);
  }

  eventEnd = roundToNearestInterval(eventEnd, interval_size, true);

  let latestEndSoFar = eventEnd;

  while (
    eventIdx < events.length &&
    currentBlockStartTime < DateTime.fromISO(hard_stop)
  ) {
    // Find start of event, round down to nearest interval
    let eventStart = DateTime.fromISO(events[eventIdx].start_time);
    eventStart = roundToNearestInterval(eventStart, interval_size, false);

    // Find end of event, round up to nearest interval
    let eventEnd = DateTime.fromISO(events[eventIdx].end_time);
    eventEnd = roundToNearestInterval(eventEnd, interval_size, true);

    // Make sure we aren't moving our block start to the end of an event thats sooner than a previously visited event's end
    if (eventEnd < latestEndSoFar) {
      eventEnd = latestEndSoFar;
    } else {
      latestEndSoFar = eventEnd;
    }

    let blockSizeInMinutes = eventStart.diff(
      currentBlockStartTime,
      'minutes'
    ).minutes;

    // check if the Block is large enough
    if (blockSizeInMinutes < min_duration) {
      currentBlockStartTime = eventEnd;
      eventIdx += 1;
      continue;
    }

    // The time the block should end, either at the beginning of the next event or at the hard stop
    let blockEndTime =
      eventStart < DateTime.fromISO(hard_stop) ? eventStart.toISO() : hard_stop;

    // Create a block, fill it up with free slots, moving the currentSlotEnd forward
    const newBlock = {
      start_time: currentBlockStartTime.toISO(),
      end_time: blockEndTime,
      free_slots: generateIntervals(
        currentBlockStartTime,
        DateTime.fromISO(blockEndTime),
        interval_size,
        slot_size,
        true
      ),
    };
    blocks.push(newBlock);

    // find next currentTime (may have to move event idx forward more than once)
    currentBlockStartTime = eventEnd;
    eventIdx += 1;
  }

  let blockSizeInMinutes = DateTime.fromISO(hard_stop).diff(
    currentBlockStartTime,
    'minutes'
  );

  if (blockSizeInMinutes.minutes >= min_duration) {
    // Round down the hard end
    let finalEndTime = roundToNearestInterval(
      DateTime.fromISO(hard_stop),
      interval_size,
      false
    );
    const newBlock = {
      start_time: currentBlockStartTime.toISO(),
      end_time: finalEndTime.toISO(),
      free_slots: generateIntervals(
        currentBlockStartTime.toISO(),
        finalEndTime.toISO(),
        interval_size,
        slot_size,
        true
      ),
    };
    blocks.push(newBlock);
  }

  return blocks;
}

// Takes in an events array, ensures its organized correctly and overlaps are accounted for correctly. Returns Events
export function HydrateOverlapEvents(
  events: Array<{
    start_time: string;
    end_time: string;
    title: string;
    url: string;
    color: string;
    index_of_overlapped_events: Array<number>;
  }>
) {
  // hold onto the event with the earliest start time. On seeing a new event, if that events ENDS earlier than the held onto event, its index is put into
  // the overlap array for the held onto event. Do nothing, move forward

  // if the new event ends later, proceed as normal and

  if (events.length == 0) {
    return events;
  }

  // clear everything out
  for (let i = 0; i < events.length; i++) {
    events[i].index_of_overlapped_events = [];
  }

  let lagEventIdx = 0;
  let lagEventEndTime = DateTime.fromISO(events[0].end_time);

  for (let i = 1; i < events.length; i++) {
    const newEventEnd = DateTime.fromISO(events[i].end_time);

    if (newEventEnd < lagEventEndTime) {
      if (!events[lagEventIdx].index_of_overlapped_events.includes(i)) {
        events[lagEventIdx].index_of_overlapped_events.push(i);
      }
    } else {
      lagEventIdx = i;
      lagEventEndTime = newEventEnd;
    }
  }

  return events;
}
