import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import ScrollContainer from 'react-indiana-drag-scroll';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip'
import { datetimeToOffset } from '../../../../util/CalendarUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function CalendarEvents(props: { events }) {
    const { events } = props;

    useEffect(() => {
        ReactTooltip.rebuild()
      }, [])

    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '15px',
        }}
      >
        {events.map((event, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
            <CalendarEvent event={event} event_idx={idx} />
          </div>
        ))}
         
      </div>
    );
  }
  
  function CalendarEvent(props: {event, event_idx}) {
    const {event_idx, event} = props
   
    return (
      <div
        style={{
          position: 'absolute',
          right: datetimeToOffset(event.start_time, event.end_time, 0)[0],
          width: datetimeToOffset(event.start_time, event.end_time, 0)[1],
          backgroundColor: 'rgba(125,125,125, .67)',
          opacity: '70%',
          minHeight: '12px',
          borderRadius: 3,
          cursor: 'pointer',
        }}
        data-tip
        data-for={"etip"}
      >
      {/*   <ReactTooltip id="etip" place='bottom'>
            <div>
                {event_idx}
            </div>
        </ReactTooltip> */}
      </div>
            
    )
  
  
  
  }