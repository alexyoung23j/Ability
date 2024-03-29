import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
import { datetimeToOffset } from '../../../../util/command-view-util/CalendarViewUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function FreeBlocks(props: {
  free_blocks;
  day_idx;
  ignoreHandler;
  textSnippetOpen;
}) {
  const { free_blocks, day_idx, ignoreHandler, textSnippetOpen } = props;

  const borderProps =
    textSnippetOpen === false ? '1px solid rgba(135, 220, 215, 1)' : '0px';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15px',
        pointerEvents: 'none',
      }}
    >
      {free_blocks.map((event, idx) => (
        <div
          className="freeBlock"
          style={{
            position: 'absolute',
            right: datetimeToOffset(event.start_time, event.end_time, 0)[0],
            width: datetimeToOffset(event.start_time, event.end_time, 0)[1],
            minHeight: '20px',
            //border: borderProps,
            //borderRight: borderProps,
            cursor: 'pointer',
            //backgroundColor: 'rgba(135, 220, 215, .3)'
          }}
          key={idx}
        ></div>
      ))}
    </div>
  );
}
