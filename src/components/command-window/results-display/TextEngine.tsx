import React, { useEffect, useRef, useState } from 'react';
import { TextSnippet, TextSnippetPackage } from '../types';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { CalendarResultData } from './ResultEngine';
import {
  _extractTimeSlots,
  createSnippetPayload,
  createDefaultTimeZoneData,
} from '../../util/TextEngineUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export interface TimeZoneData {
  name: string;
  utc_offset: string;
  timezone_enabled: boolean;
}

const dummy_packages: Array<TextSnippetPackage> = [
  {
    textSnippetPieces: [
      'Would any of the following times work for you?',
      {
        settings: {
          abbreviateTimes: false,
          inlineText: false,
          includeDates: true,
        },
      },
      'I think a ',
      {
        settings: {
          abbreviate: false,
        },
      },
      'meeting would work best.',
    ],
    name: 'Email',
    id: '1',
  },
  {
    textSnippetPieces: [
      'Hey! I am free ',
      {
        settings: {
          abbreviateTimes: true,
          inlineText: true,
          includeDates: false,
        },
      },
      '. Let me know what works 😊 ',
    ],
    name: 'Personal',
    id: '2',
  },
];

interface TextEngineProps {
  calendar_data: CalendarResultData;
  ignoredSlots: Array<Array<number>>;
}

export default function TextEngine(props: TextEngineProps) {
  const { calendar_data, ignoredSlots } = props;

  const [selectedTimeZone, setSelectedTimeZone] = useState<TimeZoneData>({
    name: 'PST',
    utc_offset: 'UTC-7',
    timezone_enabled: false,
  });

  // Should be fetching this from context
  const TextSnippetPackages = dummy_packages;

  createDefaultTimeZoneData();

  // Grab the chosen slots
  const timeSlots = _extractTimeSlots(
    calendar_data,
    ignoredSlots,
    selectedTimeZone
  );

  const payload = createSnippetPayload(
    timeSlots,
    TextSnippetPackages,
    calendar_data.minDuration,
    selectedTimeZone
  );

  return (
    <TextSnippetDropdown
      snippetPayload={payload}
      selectedTimeZone={selectedTimeZone}
      setSelectedTimeZone={setSelectedTimeZone}
    />
  );
}
