import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import ScrollContainer from 'react-indiana-drag-scroll';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip'
import { datetimeToOffset } from '../../../../util/CalendarUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function CalendarEvents(props: { events; setCurrentlyHoveredEventIdx; eventTooltipId }) {
    const { events, setCurrentlyHoveredEventIdx, eventTooltipId } = props;

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
            <CalendarEvent 
              event={event} 
              event_idx={idx} 
              setCurrentlyHoveredEventIdx={setCurrentlyHoveredEventIdx}
              eventTooltipId={eventTooltipId}/>
          </div>
        ))}
         
      </div>
    );
  }
  
  function CalendarEvent(props: {event; event_idx; setCurrentlyHoveredEventIdx; eventTooltipId}) {
    const {event_idx, event, setCurrentlyHoveredEventIdx, eventTooltipId} = props

    // Ensure that the "longer" event in an overlap is the one that gets highlighted on hover
    const overlapping_events = event.index_of_overlapped_events
    const start_depth = 1 + overlapping_events.length

    const [depth, setDepth] = useState(start_depth)
    const [color, setColor] = useState('#A7A7A7')

    

    function HandleMouseClick() {
      // Open up the event url 
    }

    function HandleMouseEnter() {
      setColor('#8E8E8E')
      setDepth(10)
      setCurrentlyHoveredEventIdx(event_idx)
      ReactTooltip.rebuild()
    }

    function HandleMouseLeave() {
      setColor('#A7A7A7')
      setDepth(start_depth)
    }
   
    return (
      <div
        style={{
          position: 'absolute',
          right: datetimeToOffset(event.start_time, event.end_time, 1)[0],
          width: datetimeToOffset(event.start_time, event.end_time, 1)[1],
          backgroundColor: color,
          minHeight: '10px',
          borderRadius: 3,
          cursor: 'pointer',
          zIndex: depth,
         // marginBottom: marginBottomSetting
        }}
        data-tip
        data-for={eventTooltipId}
        onClick={HandleMouseClick}
        onMouseEnter={HandleMouseEnter}
        onMouseLeave={HandleMouseLeave}
      >
    
      </div>
            
    )
  
  
  
  }