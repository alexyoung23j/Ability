
// -------------------------- Calculating Positioning -------------------------- //
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);
export const BAR_WIDTH = 40;


// TODO: Make this more fine grained to handle times not on the 15 30 45 marks
function calculateMinutes(minutes: number) {
    
    const offset = (Math.abs(minutes)/60 * 4)
  
    return minutes >= 0 ? offset : -offset;
  }
  
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