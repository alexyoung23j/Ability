import React, { useRef, useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { datetimeToRangeString } from '../../../../util/CalendarViewUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface EventTooltipProps {
  events: Array<any>;
  currentlyHoveredEventIdx: number;
  eventTooltipId: string;
  setExternalHighlightIdx: any;
  launchModal: any;
  setCurrentlySelectedEventIdx: any;
}

export default function EventTooltip(props: EventTooltipProps) {
  const {
    events,
    currentlyHoveredEventIdx,
    eventTooltipId,
    setExternalHighlightIdx,
    launchModal,
    setCurrentlySelectedEventIdx,
  } = props;

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  const currentEvent = events[currentlyHoveredEventIdx];
  let eventsArr = [[currentEvent, currentlyHoveredEventIdx]];

  for (
    let i = 0;
    i < events[currentlyHoveredEventIdx].index_of_overlapped_events.length;
    i++
  ) {
    const hiddenEventIdx =
      events[currentlyHoveredEventIdx].index_of_overlapped_events[i];
    const hiddenEvent = events[hiddenEventIdx]; // The event corresponding to to the index storred in the array of overlaps
    eventsArr.push([hiddenEvent, hiddenEventIdx]);
  }

  return (
    <ReactTooltip
      id={eventTooltipId}
      place="bottom"
      effect="solid"
      backgroundColor="#FFFFFF"
      className="event-tooltip"
      offset={{ left: 30 }}
      arrowColor="rgba(0,0,0,0)"
      delayHide={150}
    >
      {eventsArr.map((event, stupid_idx) => (
        <div key={stupid_idx}>
          <EventDescriptionView
            currentEvent={event[0]}
            eventIdx={event[1]}
            setExternalHighlightIdx={setExternalHighlightIdx}
            launchModal={launchModal}
            setCurrentlySelectedEventIdx={setCurrentlySelectedEventIdx}
          />
        </div>
      ))}
    </ReactTooltip>
  );
}

interface EventDescriptionViewProps {
  currentEvent: any;
  eventIdx: number;
  setExternalHighlightIdx: any;
  launchModal: any;
  setCurrentlySelectedEventIdx: any;
}
function EventDescriptionView(props: EventDescriptionViewProps) {
  const {
    currentEvent,
    eventIdx,
    setExternalHighlightIdx,
    launchModal,
    setCurrentlySelectedEventIdx,
  } = props;

  const [backgroundColor, setBackgroundColor] = useState(
    'rgba(135, 220, 215, 0)'
  );

  function onMouseEnter() {
    setBackgroundColor('#E9E9E9');
    setExternalHighlightIdx(eventIdx);
    setCurrentlySelectedEventIdx(eventIdx);
  }

  function onMouseLeave() {
    setBackgroundColor('rgba(135, 220, 215, 0)');
    setExternalHighlightIdx(-1);
  }

  function onClick() {
    launchModal(eventIdx);
  }

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        display: 'flex',
        borderRadius: 6,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div
        style={{
          marginLeft: '15px',
          marginRight: '15px',
          marginTop: '5px',
          marginBottom: '5px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              borderRadius: 100,
              width: '6px',
              height: '6px',
              marginTop: '5px',
              backgroundColor: currentEvent.color,
              marginRight: '5px',
            }}
          ></div>
          <div className="eventTooltipText">{currentEvent.title}</div>
        </div>

        <div className="eventTooltipDateText">
          {datetimeToRangeString(
            currentEvent.start_time,
            currentEvent.end_time,
            false
          )}
        </div>
      </div>
    </div>
  );
}
