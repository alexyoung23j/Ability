import React, { useEffect, useRef, useState } from 'react';
import { TextSnippet, TextSnippetPackage } from '../types';
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown';
import { CalendarResultData } from './ResultEngine';
import {
  _extractTimeSlots,
  createSnippetPayload,
} from '../../util/TextEngineUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

const dummy_packages: Array<TextSnippetPackage> = [
  {
    textSnippetPieces: [
      'Let me know if any of the following times work: ',
      {
        settings: {
          abbreviateTimes: true,
          listTimes: true,
          inlineText: false,
          includeDates: true,
        },
      },
      'I am available for ',
      {
        settings: {
          abbreviate: false,
        },
      },
      '.',
    ],
    name: 'Email',
    id: '1',
  },
];

interface TextEngineProps {
  snippetPayload: TextSnippet[];
  calendar_data: CalendarResultData;
  ignoredSlots: Array<Array<number>>;
}

export default function TextEngine(props: TextEngineProps) {
  const { snippetPayload, calendar_data, ignoredSlots } = props;

  // Should be fetching this from context
  const TextSnippetPackages = dummy_packages;

  // Grab the chosen slots
  const timeSlots = _extractTimeSlots(calendar_data, ignoredSlots);

  const payload = createSnippetPayload(timeSlots, TextSnippetPackages);

  return (
    <TextSnippetDropdown ignoredSlots={ignoredSlots} snippetPayload={payload} />
  );
}
