import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import { datetimeToOffset, datetimeToRangeString } from '../../../util/CalendarUtil';
import { BAR_WIDTH } from '../../../util/CalendarUtil';
import FreeSlots from './horizontal-cal-components/FreeSlots';
import FreeBlocks from './horizontal-cal-components/FreeBlocks';
import CalendarEvents from './horizontal-cal-components/CalendarEvents';
import ReactTooltip from 'react-tooltip';
import EventTooltip from './horizontal-cal-components/EventTooltip';


var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface HorizontalCalendar {
  date: string;
  hard_start: string;
  hard_end: string;
  free_blocks: any;
  ignoreHandler: any;
  events: any;
  index: number;
  textSnippetOpen: boolean
  ignoredSlots: Array<Array<number>>
  eventTooltipId: string;
  event_overlap_depth: number,
  scheduleNewEvent: any
}

export default function HorizontalCalendar(props: HorizontalCalendar) {
  const {
    date,
    hard_start,
    hard_end,
    free_blocks,
    ignoreHandler,
    events,
    index,
    textSnippetOpen,
    ignoredSlots,
    eventTooltipId,
    event_overlap_depth,
    scheduleNewEvent
  } = props;

  // State
  const [currentlyHoveredEventIdx, setCurrentlyHoveredEventIdx] = useState(0) // refers to the index in "events" being hovered



  // -------------------------- HORIZONTAL SCROLL STUFF -------------------------- //
  const scrollRef = useRef(null);

  useDragScroll({
    sliderRef: scrollRef,
    momentumVelocity: 0,
  });

  useEffect(() => {
    if (scrollRef.current !== null) {
      const xScrollAmount = calculateScroll();
      scrollRef.current.scrollTo(xScrollAmount, 0);
    }
  }, []);

  // Scrolls to the first occurence of a free slot
  function calculateScroll() {
    if (free_blocks.length > 0) {
      const earliestTime = new Date(free_blocks[0].start_time);
      const earliestHour = earliestTime.getUTCHours();

      return earliestHour * BAR_WIDTH - BAR_WIDTH*.25;
    } else {
      return 300; // TODO: Fix this
    }
  }

  // -------------------------- CALLBACKS -------------------------- //

  /* useEffect(() => {
    myConsole.log(free_blocks)
  }, [free_blocks]) */

  
 
  return (
    <div style={{display:"flex", flexDirection: "row", justifyContent: "center", alignItems: "center",}}>
      <DateText dateText={date}/>
      <GradientEdges /> 
      <div ref={scrollRef} style={horizontalCalendarStyle}>
        <HorizontalBars overlap_depth={event_overlap_depth}/>
        <LimitBars hard_start={hard_start} hard_end={hard_end} />
        <CalendarEvents 
          events={events}
          setCurrentlyHoveredEventIdx={setCurrentlyHoveredEventIdx}
          eventTooltipId={eventTooltipId}
        />
        <FreeSlots
          free_blocks={free_blocks}
          day_idx={index}
          ignoreHandler={ignoreHandler}
          textSnippetOpen={textSnippetOpen}
          ignoredSlots={ignoredSlots}
        />
        <FreeBlocks
          free_blocks={free_blocks}
          ignoreHandler={ignoreHandler}
          day_idx={index}
          textSnippetOpen={textSnippetOpen}
        />
        
        <EventTooltip 
          events={events}
          currentlyHoveredEventIdx={currentlyHoveredEventIdx}
          eventTooltipId={eventTooltipId}
        />
      </div>

      <button 
        onClick={() => scheduleNewEvent(
          '2021-06-09T12:30:00Z',
          '2021-06-09T13:30:00Z',
          'new event',
          'hpttsss...//',
          'green',
          index
        )}
      
      >
        Hi
      </button>
      
    </div>
  );
}


// -------------------------- IMMUTABLE COMPONENTS -------------------------- //



function DateText(props: {dateText: string}) {
  const {dateText} = props
  const dateObj = new Date(dateText)

  const weekdays = [
    "SUN",
    "MON",
    "TUE", 
    "WED",
    "THU",
    "FRI",
    "SAT"
  ]

  const dayOfMonth = dateObj.getDate()
  const monthOfYear = dateObj.getMonth()  
  const dayOfWeek = dateObj.getDay()

  const dayString = weekdays[dayOfWeek] + " " + (monthOfYear + 1).toString() + "/" + (dayOfMonth+1).toString() 

  return (
    <div 
    className="horizontalCalendarDateText"
    style={{display: "flex", 
            justifyContent: "center", 
            alignItems: "flex-start", 
            flexDirection: "column",
            marginTop: "27px",
            marginRight: "5px",
            minWidth: "70px",
            maxWidth: "70px",
            
    }}>
      {dayString}
    </div>
  )
}

// Creates the horizontal bars needed for
function HorizontalBars(props: {overlap_depth: number}) {

  const {overlap_depth} = props
  // MARKERS
  const timeMarkersAM = [
    '12 AM',
    '',
    '2 AM',
    '',
    '4 AM',
    '',
    '6 AM',
    '',
    '8 AM',
    '',
    '10 AM',
    '',
  ];
  const timeMarkersPM = [
    '12 PM',
    '',
    '2 PM',
    '',
    '4 PM',
    '',
    '6 PM',
    '',
    '8 PM',
    '',
    '10 PM',
    '',
    '12 AM',
  ];

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ display: 'flex' }}>
        {timeMarkersAM.map((time, idx) => (
          <div key={idx} style={timeBarStyle}>
            <div className="timeBarText">{time}</div>
            <div
              style={{
                width: '0.5px',
                backgroundColor: '#7D7D7D',
                opacity: '50%',
                height: '28px',
              }}
            ></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex' }}>
        {timeMarkersPM.map((time, idx) => (
          <div key={idx} style={timeBarStyle}>
            <div className="timeBarText">{time}</div>
            <div
              style={{
                width: '0.5px',
                backgroundColor: '#7D7D7D',
                opacity: '50%',
                height: '28px',
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GradientEdges() {
  return (
    <div style={{ position: 'relative', }}>
      <div
        className="leftGradientBar"
        style={{
          position: 'absolute',
          minWidth: '15px',
          minHeight: '45px',
          zIndex: 11,
        }}
      ></div>
      <div
        className="rightGradientBar"
        style={{
          position: 'absolute',
          minWidth: '15px',
          minHeight: '45px',
          left: '415px',
          zIndex: 11,
        }}
      ></div>
    </div>
  );
}

// -------------------------- Hard Limit Bars -------------------------- //
function LimitBars(props: { hard_start: string; hard_end: string }) {
  const { hard_start, hard_end } = props;
  // Create offset and width for the start hard limit
  const [startOffset, startWidth] = datetimeToOffset(
    '2021-06-09T00:00:00Z',
    hard_start,
    0
  );

  // Create offset and width for the start hard limit
  const [endOffset, endWidth] = datetimeToOffset(
    hard_end,
    '2021-06-09T23:55:00Z',
    0
  );


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
      <div
        style={{
          position: 'absolute',
          right: startOffset,
          minWidth: startWidth,
          width: startWidth,
          backgroundColor: 'gray',
          opacity: '10%',
          minHeight: '20px',
        }}
      ></div>

      <div
        style={{
          position: 'absolute',
          right: endOffset,
          minWidth: endWidth,
          width: endWidth,
          backgroundColor: 'gray',
          opacity: '10%',
          minHeight: '20px',
        }}
      ></div>
    </div>
  );
}

const horizontalCalendarStyle: CSS.Properties = {
  display: 'flex',
  overflowX: 'hidden',
  marginTop: '15px',
  flexFlow: 'nowrap',
  width: '430px',
  cursor: 'grab',
};

const timeBarStyle: CSS.Properties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: BAR_WIDTH.toString() + 'px',
};
