import React, { useEffect, useRef, useState } from 'react';
import { textSnippet, TextSnippetPackage } from '../types';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { CalendarResultData } from './ResultEngine';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

const dummy_packages: Array<TextSnippetPackage> = [
  {
    textSnippetPieces: [
      'Let me know if any of the following times work: ',
      'I am available for ',
      '.',
    ],
    textObjects: [
      {
        settings: {
          abbreviateTimes: true,
          inlineText: false,
          includeDates: true,
        },
      },
      {
        settings: {
          abbreviate: false,
        },
      },
    ],
    name: 'Email',
    id: '1',
  },
  {
    textSnippetPieces: ['Im free on ', '.'],
    textObjects: [
      {
        settings: {
          abbreviateTimes: true,
          inlineText: true,
          includeDates: false,
        },
      },
    ],
    name: 'Personal',
    id: '2',
  },
];

interface TextEngineProps {
  snippetPayload: textSnippet[];
  calendar_data: CalendarResultData;
  ignoredSlots: Array<Array<number>>;
}

// This is hilariously stupid but I don't want to improve it rn
function _extractTimeSlots(
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

export default function TextEngine(props: TextEngineProps) {
  const { snippetPayload, calendar_data, ignoredSlots } = props;

  // Should be fetching this from context
  const TextSnippetPackages = dummy_packages;

  const [timeSlots, setTimeSlots] = useState([]);

  useEffect(() => {
    setTimeSlots(_extractTimeSlots(calendar_data, ignoredSlots));
  }, [ignoredSlots]);

  console.log('slots:', timeSlots);

  return (
    <TextSnippetDropdown
      ignoredSlots={ignoredSlots}
      snippetPayload={snippetPayload}
    />
  );
}
