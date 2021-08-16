import { CalendarResultData } from '../command-window/results-display/ResultEngine';
import {
  TextSnippetPackage,
  TextSnippet,
  DateTextObject,
  TextObject,
  isDateTextObject,
  isDurationTextObject,
  isTimeZoneTextObject,
  DurationTextObject,
} from '../command-window/types';
import { ContentState } from 'draft-js';
import { DateTime } from 'luxon';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// This is hilariously stupid but I don't want to improve it rn
export function _extractTimeSlots(
  calendar_data: CalendarResultData,
  ignoredSlots: Array<Array<number>>
) {
  let timeSlots = [];
  for (var day_idx = 0; day_idx < calendar_data.days.length; day_idx += 1) {
    const blocks = calendar_data.days[day_idx].free_blocks;
    for (var block_idx = 0; block_idx < blocks.length; block_idx += 1) {
      const slots =
        calendar_data.days[day_idx].free_blocks[block_idx].free_slots;
      for (var slot_idx = 0; slot_idx < slots.length; slot_idx += 1) {
        const slot =
          calendar_data.days[day_idx].free_blocks[block_idx].free_slots[
            slot_idx
          ];

        let containsSlot = false;
        for (const ignoredSlot of ignoredSlots) {
          if (
            ignoredSlot[0] == day_idx &&
            ignoredSlot[1] == block_idx &&
            ignoredSlot[2] == slot_idx
          ) {
            containsSlot = true;
          }
        }

        if (!containsSlot) {
          timeSlots.push(slot);
        }
      }
    }
  }

  return timeSlots;
}

function _containsThisDate(
  ordinal: number,
  dayGroups: Array<{
    date: DateTime;
    slots: Array<{ start_time: DateTime; end_time: DateTime }>;
  }>
): boolean {
  for (const group of dayGroups) {
    if (group.date.ordinal === ordinal) {
      return true;
    }
  }
  return false;
}

function _combineContiguousBlocks(slots: Array<any>) {
  let combined_slots = [];

  console.log(slots);

  let i = 0;
  while (i < slots.length) {
    let curSlot = {
      start_time: slots[i].start_time,
      end_time: slots[i].end_time,
    };

    while (
      i < slots.length &&
      slots[i].start_time.diff(curSlot.end_time).toMillis() <= 0
    ) {
      curSlot.end_time = slots[i].end_time;
      i += 1;
    }

    combined_slots.push(curSlot);
  }

  return combined_slots;
}

function _groupTimeSlots(timeSlots: Array<any>) {
  let dayGroups = []; // array of groups of days with timeslots sorted

  for (const { start_time, end_time } of timeSlots) {
    const startTime = DateTime.fromISO(start_time);
    const endTime = DateTime.fromISO(end_time);

    if (_containsThisDate(startTime.ordinal, dayGroups)) {
      let i = 0;
      while (dayGroups[i].date.ordinal != startTime.ordinal) {
        i += 1;
      }
      dayGroups[i].slots.push({
        start_time: startTime,
        end_time: endTime,
      });

      dayGroups[i].slots = dayGroups[i].slots.sort((slot1, slot2) =>
        slot1.end_time > slot2.end_time ? 1 : -1
      );
    } else {
      let group = {
        date: startTime.startOf('day'),
        slots: [
          {
            start_time: startTime,
            end_time: endTime,
          },
        ],
      };

      dayGroups.push(group);
    }
  }

  // Collapse timeslots into chunks
  for (let i = 0; i < dayGroups.length; i++) {
    dayGroups[i].slots = _combineContiguousBlocks(dayGroups[i].slots);
  }

  return dayGroups.sort((group1, group2) =>
    group1.date > group2.date ? 1 : -1
  );
}

function _abbreviatedTimeString(hour: number, minute: number) {
  let curHour = (((hour + 11) % 12) + 1).toString();

  let curMin = minute === 0 ? '' : ':' + minute.toString;

  return curHour + curMin;
}

function _cleanedTimeString(
  slot: any,
  abbreviate: boolean,
  includePeriod: boolean
) {
  let resultString = '';
  if (abbreviate) {
    let firstTime = _abbreviatedTimeString(
      slot.start_time.hour,
      slot.start_time.minute
    );

    let secondTime = _abbreviatedTimeString(
      slot.end_time.hour,
      slot.end_time.minute
    );

    resultString += firstTime + '-' + secondTime;
  } else {
    let firstTime = slot.start_time.toLocaleString({
      hour: '2-digit',
      minute: '2-digit',
    });

    if (firstTime[0] === '0') {
      firstTime = firstTime.slice(1, firstTime.length);
    }

    firstTime = firstTime.slice(0, firstTime.length - 3);

    let secondTime = slot.end_time.toLocaleString({
      hour: '2-digit',
      minute: '2-digit',
    });

    if (secondTime[0] === '0') {
      secondTime = secondTime.slice(1, secondTime.length);
    }

    if (!includePeriod) {
      secondTime = secondTime.slice(secondTime.length - 3);
    }

    resultString += firstTime + '-' + secondTime;
  }

  return resultString;
}

function _createTimeSlotText(day: any, abbreviate: boolean) {
  let resultText = '';

  for (let i = 0; i < day.slots.length; i++) {
    const slot = day.slots[i];
    resultText += _cleanedTimeString(slot, abbreviate, true);

    if (i === day.slots.length - 2) {
      if (day.slots.length > 2) {
        resultText += ', or ';
      } else {
        resultText += ' or ';
      }
    } else if (i < day.slots.length - 1) {
      resultText += ', ';
    }
  }

  return resultText;
}

function _createDayText(day: any, snippetPiece: DateTextObject) {
  let resultText = '';

  resultText += day.date.toLocaleString({ weekday: 'long' });

  if (snippetPiece.settings.includeDates) {
    resultText +=
      ', ' + day.date.toLocaleString({ day: '2-digit', month: '2-digit' });
  }

  if (snippetPiece.settings.abbreviateTimes) {
    resultText += ' from ';
    resultText += _createTimeSlotText(day, true);
  } else {
    resultText += ': ';
    resultText += _createTimeSlotText(day, false);
  }

  return resultText;
}

function _dateTextFilter(timeSlots: Array<any>, snippetPiece: DateTextObject) {
  const groupedTimeSlots = _groupTimeSlots(timeSlots); // All entries are now DateTimeObjects, not strings

  let resultString = snippetPiece.settings.inlineText == true ? '' : '\n';
  for (let i = 0; i < groupedTimeSlots.length; i++) {
    const day = groupedTimeSlots[i];
    if (snippetPiece.settings.inlineText == true) {
      resultString += _createDayText(day, snippetPiece);

      if (i < groupedTimeSlots.length - 1) {
        if (i === groupedTimeSlots.length - 2) {
          resultString += groupedTimeSlots.length > 2 ? ', and ' : ' and ';
        } else {
          resultString += ', ';
        }
      }
    } else {
      resultString += '\n';
      resultString += _createDayText(day, snippetPiece);
    }
  }

  if (snippetPiece.settings.inlineText) {
    resultString += '';
  } else {
    resultString += '\n\n';
  }
  return resultString;
}

function _minutesToHoursAndMinutes(rawMinutes: number) {
  let hours = Math.floor(rawMinutes / 60);
  let minutes = rawMinutes % 60;

  return [hours, minutes];
}

function _durationTextFilter(
  snippetPiece: DurationTextObject,
  duration: number
) {
  const time = _minutesToHoursAndMinutes(duration);

  const hours = time[0];
  const minutes = time[1];

  let resultText = '';
  if (snippetPiece.settings.abbreviate) {
    /// Idk what to do here tbh
  } else {
    if (hours >= 1) {
      resultText += hours.toString() + ' hour ';
    }

    if (minutes > 0) {
      resultText += minutes.toString() + ' minutes ';
    }
  }

  return resultText;
}
function _formatTextObject(
  timeSlots: Array<any>,
  snippetPiece: TextObject,
  duration: number
): string {
  if (isDateTextObject(snippetPiece)) {
    return _dateTextFilter(timeSlots, snippetPiece);
  } else if (isDurationTextObject(snippetPiece)) {
    return _durationTextFilter(snippetPiece, duration);
  } else if (isTimeZoneTextObject(snippetPiece)) {
  }

  return 'tf';
}

function _generateSnippetContent(
  snippetPackage: TextSnippetPackage,
  timeSlots: Array<any>,
  duration: number
): string {
  let snippetString = '';

  for (const snippetPiece of snippetPackage.textSnippetPieces) {
    if (typeof snippetPiece === 'string') {
      snippetString += snippetPiece;
    } else {
      snippetString += _formatTextObject(timeSlots, snippetPiece, duration);
    }
  }

  return ContentState.createFromText(snippetString);
}

export function createSnippetPayload(
  timeSlots: any,
  snippetPackages: Array<TextSnippetPackage>,
  duration: number
): Array<TextSnippet> {
  let snippets = [];
  for (const snippetPackage of snippetPackages) {
    let textSnippet = {
      content: _generateSnippetContent(snippetPackage, timeSlots, duration),
      id: snippetPackage.id,
      title: snippetPackage.name,
    };

    snippets.push(textSnippet);
  }

  return snippets;
}
