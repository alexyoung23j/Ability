import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import { datetimeToOffset } from '../../../util/CalendarUtil';
import { BAR_WIDTH } from '../../../util/CalendarUtil';
import FreeSlots from './horizontal-cal-components/FreeSlots';
import FreeBlocks from './horizontal-cal-components/FreeBlocks';
import CalendarEvents from './horizontal-cal-components/CalendarEvents';
import ReactTooltip from 'react-tooltip';


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
    textSnippetOpen
  } = props;

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

  function calculateScroll() {
    if (free_blocks.length > 0) {
      const earliestTime = new Date(free_blocks[0].start_time);
      const earliestHour = earliestTime.getUTCHours();

      return earliestHour * BAR_WIDTH - BAR_WIDTH / 2;
    } else {
      return 300; // TODO: Fix this
    }
  }


  const [inFocusEventIdx, setInFocusEventIdx] = useState(0)


  return (
    <div ref={scrollRef} style={horizontalCalendarStyle}>
      <HorizontalBars />
      <LimitBars hard_start={hard_start} hard_end={hard_end} />
      <CalendarEvents events={events} setFocusIdx={setInFocusEventIdx}/>
      <FreeSlots
        free_blocks={free_blocks}
        day_idx={index}
        ignoreHandler={ignoreHandler}
        textSnippetOpen={textSnippetOpen}
      />
      <FreeBlocks
        free_blocks={free_blocks}
        ignoreHandler={ignoreHandler}
        day_idx={index}
        textSnippetOpen={textSnippetOpen}
      />
      <GradientEdges />
     {/*  <ReactTooltip id="etip" place='bottom'>
            <div>
                {inFocusEventIdx}
            </div>
        </ReactTooltip> */}
    </div>
  );
}



// -------------------------- IMMUTABLE COMPONENTS -------------------------- //

// Creates the horizontal bars needed for
function HorizontalBars() {
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
    <div style={{ position: 'absolute', marginTop: '12px' }}>
      <div
        style={{
          position: 'absolute',
          minWidth: '10px',
          minHeight: '30px',
          backgroundColor: 'white',
          opacity: '80%',
          zIndex: 11,
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          minWidth: '10px',
          minHeight: '30px',
          backgroundColor: 'white',
          left: '360px',
          opacity: '80%',
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
          opacity: '15%',
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
          opacity: '15%',
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
  width: '370px',
  cursor: 'grab',
};

const timeBarStyle: CSS.Properties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: BAR_WIDTH.toString() + 'px',
};
