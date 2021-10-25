import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip';
import { datetimeToOffset } from '../../../../util/command-view-util/CalendarViewUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarEventsProps {
  events: Array<any>;
  textSnippetOpen: boolean;
  setCurrentlyHoveredEventIdx: any;
  setCurrentlySelectedEventIdx: any;
  eventTooltipId: string;
  externallyHighlightedIdx: number;

  launchModalFromExistingEvent: any;
}

export default function CalendarEvents(props: CalendarEventsProps) {
  const {
    events,
    textSnippetOpen,
    setCurrentlyHoveredEventIdx,
    setCurrentlySelectedEventIdx,
    eventTooltipId,
    externallyHighlightedIdx,
    launchModalFromExistingEvent,
  } = props;

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
        <div
          key={idx}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CalendarEvent
            event={event}
            event_idx={idx}
            textSnippetOpen={textSnippetOpen}
            setCurrentlyHoveredEventIdx={setCurrentlyHoveredEventIdx}
            setCurrentlySelectedEventIdx={setCurrentlySelectedEventIdx}
            eventTooltipId={eventTooltipId}
            externallyHighlightedIdx={externallyHighlightedIdx}
            launchModalFromExistingEvent={launchModalFromExistingEvent}
          />
        </div>
      ))}
    </div>
  );
}

interface CalendarEventProps {
  event: any;
  event_idx: number;
  textSnippetOpen: boolean;
  setCurrentlyHoveredEventIdx: any;
  setCurrentlySelectedEventIdx: any;
  eventTooltipId: string;
  externallyHighlightedIdx: number;

  launchModalFromExistingEvent: any;
}

function CalendarEvent(props: CalendarEventProps) {
  const {
    event,
    event_idx,
    textSnippetOpen,
    setCurrentlyHoveredEventIdx,
    setCurrentlySelectedEventIdx,
    eventTooltipId,
    externallyHighlightedIdx,
    launchModalFromExistingEvent,
  } = props;

  // Ensure that the "longer" event in an overlap is the one that gets highlighted on hover
  const overlapping_events = event.index_of_overlapped_events;
  const start_depth = 1 + overlapping_events.length;

  const [depth, setDepth] = useState(start_depth);
  const [color, setColor] = useState('#A7A7A7');

  // Listen for changes caused by the tooltip
  useEffect(() => {
    const new_color =
      externallyHighlightedIdx == event_idx ? '#8E8E8E' : '#A7A7A7';
    const new_depth = externallyHighlightedIdx == event_idx ? 10 : start_depth;
    setColor(new_color);
    setDepth(new_depth);
  }, [externallyHighlightedIdx]);

  function HandleMouseClick() {
    // Open up the event url
    if (!textSnippetOpen) {
      launchModalFromExistingEvent(event_idx);
    }
  }

  function HandleMouseEnter() {
    if (!textSnippetOpen) {
      setColor('#8E8E8E');
      setDepth(10);
      setCurrentlyHoveredEventIdx(event_idx);
      setCurrentlySelectedEventIdx(event_idx);
      ReactTooltip.rebuild();
    }
  }

  function HandleMouseLeave() {
    if (!textSnippetOpen) {
      setColor('#A7A7A7');
      setDepth(start_depth);
      setCurrentlySelectedEventIdx(-1);
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        right: datetimeToOffset(event.start_time, event.end_time, 0)[0],
        width: datetimeToOffset(event.start_time, event.end_time, 0)[1],
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
    ></div>
  );
}
