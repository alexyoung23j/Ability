import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import ScrollContainer from 'react-indiana-drag-scroll';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip'
import { datetimeToOffset } from '../../../../util/CalendarUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);



export default function FreeBlocks(props: { free_blocks; day_idx; ignoreHandler }) {
    const { free_blocks, day_idx, ignoreHandler } = props;
  
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
            style={{
              position: 'absolute',
              right: datetimeToOffset(event.start_time, event.end_time, 5)[0],
              width: datetimeToOffset(event.start_time, event.end_time, 5)[1],
              minHeight: '20px',
              borderRadius: 3,
              border: '2px solid rgba(135, 220, 215, 1)',
              cursor: 'pointer',
            }}
            key={idx}
          ></div>
        ))}
      </div>
    );
  }