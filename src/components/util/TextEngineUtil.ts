import { CalendarResultData } from '../command-window/results-display/ResultEngine';
import {
  TextSnippetPackage,
  TextSnippet,
  DateTextObject,
  TextObject,
  isDateTextObject,
  isDurationTextObject,
  isTimeZoneTextObject,
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

  return dayGroups.sort((group1, group2) =>
    group1.date > group2.date ? 1 : -1
  );
}

function _dateTextFilter(timeSlots: Array<any>, snippetPiece: DateTextObject) {
  const groupedTimeSlots = _groupTimeSlots(timeSlots); // All entries are now DateTimeObjects, not strings

  for (const day of groupedTimeSlots) {
  }
  return '';
}

function _formatTextObject(
  timeSlots: Array<any>,
  snippetPiece: TextObject
): string {
  if (isDateTextObject(snippetPiece)) {
    return _dateTextFilter(timeSlots, snippetPiece);
  } else if (isDurationTextObject(snippetPiece)) {
  } else if (isTimeZoneTextObject(snippetPiece)) {
  }

  return 'tf';
}

function _generateSnippetContent(
  snippetPackage: TextSnippetPackage,
  timeSlots: Array<any>
): string {
  let snippetString = '';

  for (const snippetPiece of snippetPackage.textSnippetPieces) {
    if (typeof snippetPiece === 'string') {
      snippetString += snippetPiece;
    } else {
      snippetString += _formatTextObject(timeSlots, snippetPiece);
    }
  }

  return ContentState.createFromText(snippetString);
}

export function createSnippetPayload(
  timeSlots: any,
  snippetPackages: Array<TextSnippetPackage>
): Array<TextSnippet> {
  let snippets = [];
  for (const snippetPackage of snippetPackages) {
    let textSnippet = {
      content: _generateSnippetContent(snippetPackage, timeSlots),
      id: snippetPackage.id,
      title: snippetPackage.name,
    };

    snippets.push(textSnippet);
  }

  return snippets;
}
