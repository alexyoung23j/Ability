
// -------------------------- Calculating Positioning -------------------------- //

export const BAR_WIDTH = 48;

function calculateMinutes(minutes: number) {
    var minOffset;
  
    if (Math.abs(minutes) < 15) {
      minOffset = 0;
    } else if (Math.abs(minutes) < 30) {
      minOffset = 1;
    } else if (Math.abs(minutes) < 45) {
      minOffset = 2;
    } else {
      minOffset = 3;
    }
  
    return minutes >= 0 ? minOffset : -minOffset;
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
  
    // Formula for finding the offset from right needed (assumes the size of each bar is 40px, as defined in index.css)
  
    const offset =
      BAR_WIDTH / 2 +
      (24 - startHour) * BAR_WIDTH -
      minOffset * (BAR_WIDTH / 4) -
      borderAdjust;
  
    const width =
      (endHour - startHour) * BAR_WIDTH +
      minDifferenceOffset * (BAR_WIDTH / 4) -
      borderAdjust;
  
    if (end === '2021-06-09T24:00:00Z') {
      const newWidth =
        (BAR_WIDTH / 2 - (startHour - endHour)) * BAR_WIDTH +
        minDifferenceOffset * (BAR_WIDTH / 4) -
        borderAdjust;
  
      return [String(offset - newWidth + 'px'), String(newWidth + 'px')];
    }
    return [String(offset - width + 'px'), String(width + 'px')];
  }