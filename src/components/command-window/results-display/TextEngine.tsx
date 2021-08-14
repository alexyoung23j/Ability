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

  const payload = createSnippetPayload(
    timeSlots,
    TextSnippetPackages,
    calendar_data.minDuration
  );
  console.log(calendar_data);

  return (
    <TextSnippetDropdown ignoredSlots={ignoredSlots} snippetPayload={payload} />
  );
}
