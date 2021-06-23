
// -------------------------- Calculating Positioning -------------------------- //
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);
export const BAR_WIDTH = 40;


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
export function generateIntervals(start_time, end_time, interval_size, roundUp) {
  let intervals = []

  // Find start and End times, rounded to the desired precision (set by interal_size)
  let curTime = new Date(start_time)
  curTime = roundToNearestInterval(curTime, interval_size, true)
  let endTime = new Date(end_time)
  endTime = roundToNearestInterval(endTime, interval_size, true)

  let currentPlusOneHour = new Date(curTime.getTime() + 3600000).getTime()

  while (currentPlusOneHour <= endTime.getTime()) {
    // Find an interval from current to current + 1 hour
    const newEnd = new Date(curTime.getTime() + 3600000).toISOString()
    let newInterval = {start_time: curTime.toISOString(), end_time: newEnd}
    intervals.push(newInterval)

    // Move forward
    curTime = new Date(curTime.getTime() + 60000*interval_size)
    currentPlusOneHour = new Date(curTime.getTime() + 3600000).getTime()

    myConsole.log(currentPlusOneHour, endTime.getTime())

  }

  return intervals
} 

// Rounds a time to the nearest value with precision specified by interval (i.e. 8:42 -> 8:45 with interval = 15)
export function roundToNearestInterval(time, interval: number, roundUp: boolean) {

  if (roundUp) {
    const preciseMinutes = time.getMinutes()
    const roundedMinutes = Math.ceil(preciseMinutes/interval)*interval
    time.setMinutes(roundedMinutes)

    if (roundedMinutes == 0) {
      time.setHours(time.getHours() + 1)
    }
  }

  return time


}