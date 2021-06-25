
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);
export const BAR_WIDTH = 40;


// -------------------------- UI STUFF -------------------------- //


// Calculates a pixel offset for the minutes. 
// TODO: Make this more fine grained to handle times not on the 15 30 45 marks
function calculateMinutes(minutes: number) {
    
  const offset = (Math.abs(minutes)/60 * 4)

  return minutes >= 0 ? offset : -offset;
}
 

// Calculates a pixel offset value for use within Horizontal Calendar. 
export function datetimeToOffset(start: string, end: string, borderAdjust: number) {
  const startTime = new Date(start);
  const endTime = new Date(end);

  const startHour = startTime.getUTCHours();
  const endHour = endTime.getUTCHours();

  const startMin = startTime.getUTCMinutes();
  const endMin = endTime.getUTCMinutes();

  var minOffset = calculateMinutes(startMin);
  var minDifferenceOffset = calculateMinutes(endMin - startMin);

  // Formula for finding the offset from right needed (assumes the size of each bar is BAR_WIDTH)

  const offset =
    BAR_WIDTH / 2 +
    (24 - startHour) * BAR_WIDTH -
    minOffset * (BAR_WIDTH / 4) 

  const width =
    (endHour - startHour) * BAR_WIDTH +
    minDifferenceOffset * (BAR_WIDTH / 4) -
    borderAdjust;

  if (end === '2021-06-09T24:00:00Z') {
    const newWidth =
      (BAR_WIDTH / 2 - (startHour - endHour)) * BAR_WIDTH +
      minDifferenceOffset * (BAR_WIDTH / 4) -
      borderAdjust;

    return [String(offset + newWidth + 'px'), String(Math.abs(newWidth) + 'px')];
  } 

  return [String(offset - width + 'px'), String(width + 'px')];
}


export function datetimeToRangeString(start: string, end: string, militaryTime: boolean) {
  const startTime = new Date(start)
  const endTime = new Date(end)

  const startHour = startTime.getUTCHours()
  const endHour = endTime.getUTCHours()

  let startHourString
  let endHourString

  let startStandardMofidier = ''
  let endStandardMofidier = ''

  if(!militaryTime) {
    if (startHour > 12) {
      startHourString = (startHour % 12).toString() 
    } else {
      startHourString = startHour.toString() 
    }

    if (endHour > 12) {
      endHourString = (endHour % 12).toString() 
    } else {
      endHourString = endHour.toString() 
    }

    if (startHour > 11) {
      startStandardMofidier = " PM"
    } else {
      startStandardMofidier = " AM"
    }

    if (endHour > 11) {
      endStandardMofidier = " PM"
    } else {
      endStandardMofidier = " AM"
    }


  } else {
    startHourString = startHour.toString()
    endHourString = endHour.toString()

  }

  const startMin = startTime.getUTCMinutes()
  let startMinString;

  if (startMin < 10) {
      startMinString = "0" + startMin.toString()
  } else {
      startMinString = startMin.toString()
  }

  
  const endMin = endTime.getUTCMinutes()
  let endMinString

  if (endMin < 10) {
      endMinString = "0" + endMin.toString()
  } else {
      endMinString = endMin.toString()
  }

  const dateString = startHourString + ":" + startMinString + startStandardMofidier + "  -  " + endHourString + ":" + endMinString + endStandardMofidier

  return dateString
}

// Generates a series of intervals with format {start_time: ISOString, end_time: ISOString}
// Returns an array of these intervals 
export function generateIntervals(start_time, end_time, interval_size, slot_size, roundUp) {
  let intervals = []

  // Find start and End times, rounded to the desired precision (set by interal_size)
  let curTime = new Date(start_time)
  curTime = roundToNearestInterval(curTime, interval_size, roundUp)
  let endTime = new Date(end_time)
  endTime = roundToNearestInterval(endTime, interval_size, roundUp)

  

  let currentPlusOneHour = new Date(curTime.getTime() + slot_size*60000)

  while (currentPlusOneHour <= endTime) {
    // Find an interval from current to current + 1 hour
    const newEnd = new Date(curTime.getTime() + slot_size*60000).toISOString()
    let newInterval = {start_time: curTime.toISOString(), end_time: newEnd}
    intervals.push(newInterval)

    // Move forward
    curTime = new Date(curTime.getTime() + 60000*interval_size)
    currentPlusOneHour = new Date(curTime.getTime() + slot_size*60000)

  }

  return intervals
} 

// Rounds a time to the nearest value with precision specified by interval (i.e. 8:42 -> 8:45 with interval = 15)
export function roundToNearestInterval(time, interval: number, roundUp: boolean) {

  if (roundUp) {
    const preciseMinutes = time.getMinutes()
    const roundedMinutes = Math.ceil(preciseMinutes/interval)*interval
    time.setMinutes(roundedMinutes)

    if (roundedMinutes == 0 && preciseMinutes != 0) {
      time.setHours(time.getHours() + 1)
    }
  } else {
    const preciseMinutes = time.getMinutes()
    const roundedMinutes = Math.floor(preciseMinutes/interval)*interval
    time.setMinutes(roundedMinutes)
  }

  return time
}

export function calculateEventOffsetFromBottom(overlap_position: number, overlapping_events: number, max_depth: number, event_height: number) {


  const spaceFromTop = 5


}

export function calculateHorizontalBarsHeight(max_overlap_depth: number) {
  // 28px seems to work fine for 1 event
}

// ------------------------------------- RESULT ENGINE STUFF ---------------------------- // 

// Takes in information about a given day, creates the free blocks and slots corresponding to that day
export function CalculateFreeBlocks(hard_start: string, hard_stop: string, min_duration: number, slot_size: number, 
  interval_size: number, events: Array<{start_time: string,end_time: string, title: string, url: string, color: string}>) {


  // we want to start at our hard start, and move forward until we hit an event. 
  // as long as we have a minimum duration, we can create a block and a slot


  // need to notice when events overlap


  let blocks = []

  // Establish a pointer to this moment and the end of this slot
  let currentBlockStartTime = new Date(hard_start)
  currentBlockStartTime = roundToNearestInterval(currentBlockStartTime, interval_size, true)
  let currentSlotEnd = new Date(currentBlockStartTime.getTime() + 60000*slot_size)

  let endTime = new Date(hard_stop)
  endTime = roundToNearestInterval(endTime, interval_size, true)

  let eventIdx = 0

  // Ignore events that start before our hard start
  while (new Date(events[eventIdx].start_time) < new Date(hard_start)) {
    // if we need to move the first block forward, do so
    if (new Date(events[eventIdx].end_time) > new Date(hard_start)) {
      currentBlockStartTime = roundToNearestInterval(new Date(events[eventIdx].end_time), interval_size, true)
    }
    eventIdx+=1

  }

  while (eventIdx < events.length) {
    // Find start of event, round down to nearest interval
    let eventStart = new Date(events[eventIdx].start_time)
    eventStart = roundToNearestInterval(eventStart, interval_size, false)

    // Find end of event, round up to nearest interval
    let eventEnd = new Date(events[eventIdx].end_time)
    eventEnd = roundToNearestInterval(eventEnd, interval_size, true)

    // If our event ends after the hard stop, ignore it
    if (eventEnd.getTime() > new Date(hard_stop).getTime()) {
      break
    }

    let blockSizeInMilli = eventStart.getTime() - currentBlockStartTime.getTime(); // This will give difference in milliseconds
    let blockSizeInMinutes = Math.round(blockSizeInMilli / 60000);


    // check if the Block is large enough 
    if (blockSizeInMinutes < min_duration) {
      currentBlockStartTime = eventEnd
      eventIdx+=1
      continue
    }

    // Create a block, fill it up with free slots, moving the currentSlotEnd forward 
    const newBlock = {start_time: currentBlockStartTime.toISOString(), end_time: eventStart.toISOString(), free_slots: generateIntervals(currentBlockStartTime, eventStart, interval_size, slot_size, true)}
    blocks.push(newBlock)

    // find next currentTime (may have to move event idx forward more than once)
    currentBlockStartTime = eventEnd
    eventIdx += 1

  }

  let blockSizeInMilli = new Date(hard_stop).getTime() - currentBlockStartTime.getTime(); // This will give difference in milliseconds
  let blockSizeInMinutes = Math.round(blockSizeInMilli / 60000);

  if (blockSizeInMinutes >= min_duration) {
    // Round down the hard end
    let finalEndTime = roundToNearestInterval(new Date(hard_stop), interval_size, false)
    const newBlock = {start_time: currentBlockStartTime.toISOString(), end_time: finalEndTime.toISOString(), free_slots: generateIntervals(currentBlockStartTime, new Date(hard_stop), interval_size, slot_size, true)}
    blocks.push(newBlock)
  }


  return blocks

}


