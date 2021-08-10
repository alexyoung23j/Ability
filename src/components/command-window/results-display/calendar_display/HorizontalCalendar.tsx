import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import {
  datetimeToOffset,
  datetimeToRangeString,
} from '../../../util/CalendarViewUtil';
import { BAR_WIDTH } from '../../../util/CalendarViewUtil';
import FreeSlots from './horizontal-cal-components/FreeSlots';
import FreeBlocks from './horizontal-cal-components/FreeBlocks';
import CalendarEvents from './horizontal-cal-components/CalendarEvents';
import ReactTooltip from 'react-tooltip';
import EventTooltip from './horizontal-cal-components/EventTooltip';
import { current } from 'immer';
import { NumberLiteralType } from 'typescript';
const { DateTime } = require('luxon');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

const TODAY = DateTime.now().startOf('day');

interface HorizontalCalendar {
  date: string;
  hard_start: string;
  hard_end: string;
  free_blocks: any;
  ignoreHandler: any;
  events: any;
  index: number;
  textSnippetOpen: boolean;
  ignoredSlots: Array<Array<number>>;
  eventTooltipId: string;
  event_overlap_depth: number;
  initial_scroll_amount: number;

  scheduleNewEvent: any;
  setModalShow: any;
  setModalEventDayIdx: any;
  setModalEventIdxInDay: any;
  setShowsNewEvent: any;
  setModalEventStart: any;
  setModalEventEnd: any;
  setModalEventTitle: any;
  setModalEventLocation: any;
  setModalEventDescription: any;
  setModalEventCalendar: any;
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
    initial_scroll_amount,
    scheduleNewEvent,
    setModalShow,
    setModalEventDayIdx,
    setModalEventIdxInDay,
    setShowsNewEvent,
    setModalEventStart,
    setModalEventEnd,
    setModalEventTitle,
    setModalEventLocation,
    setModalEventDescription,
    setModalEventCalendar,
  } = props;

  // State
  const [currentlyHoveredEventIdx, setCurrentlyHoveredEventIdx] = useState(-1); // refers to the index in "events" being hovered
  const [currentlySelectedEventIdx, setCurrentlySelectedEventIdx] =
    useState(-1); // refers to the index in "events" being selected (via a click)
  const [
    externallyHighlightedCalendarEventIdx,
    setExternallyHighlightedCalendarEventIdx,
  ] = useState(-1);

  const isToday =
    DateTime.fromISO(date).startOf('day').toISO() == TODAY.toISO(); // Is this showing today?

  // -------------------------- HORIZONTAL SCROLL STUFF -------------------------- //
  const scrollRef = useRef(null);

  useDragScroll({
    sliderRef: scrollRef,
    momentumVelocity: 0,
  });

  useEffect(() => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTo(initial_scroll_amount, 0);
    }
  }, [initial_scroll_amount]);

  // -------------------------- CALLBACKS -------------------------- //

  // When events change we should reset the hovered and selected index
  useEffect(() => {
    setCurrentlyHoveredEventIdx(-1);
    setCurrentlySelectedEventIdx(-1);
  }, [events]);

  // --------------------- UTILITY METHODS --------------------- //
  function LaunchModalFromExistingEvent(index_in_day: number) {
    setModalShow(true);
    setModalEventDayIdx(index);
    setModalEventIdxInDay(index_in_day);
    setShowsNewEvent(false);
    setModalEventStart(
      DateTime.fromISO(events[currentlySelectedEventIdx].start_time)
    );
    setModalEventEnd(
      DateTime.fromISO(events[currentlySelectedEventIdx].end_time)
    );
    setModalEventTitle(events[currentlySelectedEventIdx].title);
    setModalEventCalendar(events[currentlySelectedEventIdx].calendar);
    setModalEventLocation(''); // TODO: Add location info to the event object
    setModalEventDescription('Agenda TBD'); // TODO: Set description on the event object
    setCurrentlyHoveredEventIdx(-1);
  }

  // Accepts start and end times as Luxon DateTime objects
  function LaunchModalFromFreeSlot(start_time, end_time) {
    setModalShow(true);
    setModalEventDayIdx(index);
    setShowsNewEvent(true);
    setModalEventStart(start_time);
    setModalEventEnd(end_time);
    setModalEventTitle('');
    setModalEventLocation('');
    setModalEventDescription('');
    setModalEventCalendar({
      name: "Alex's Personal Calendar",
      color: '#33b679',
      googleAccount: 'testAccount1@gmail.com',
      selectedForDisplay: true,
    }); // TODO: Use the default calendar
    setCurrentlyHoveredEventIdx(-1);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <DateText dateText={date} isToday={isToday} />
      <GradientEdges />
      <div ref={scrollRef} style={horizontalCalendarStyle}>
        <HorizontalBars overlap_depth={event_overlap_depth} />
        <LimitBars hard_start={hard_start} hard_end={hard_end} />
        <CalendarEvents
          events={events}
          setCurrentlyHoveredEventIdx={setCurrentlyHoveredEventIdx}
          setCurrentlySelectedEventIdx={setCurrentlySelectedEventIdx}
          eventTooltipId={eventTooltipId}
          externallyHighlightedIdx={externallyHighlightedCalendarEventIdx}
          launchModalFromExistingEvent={LaunchModalFromExistingEvent}
        />
        <FreeSlots
          free_blocks={free_blocks}
          day_idx={index}
          ignoreHandler={ignoreHandler}
          textSnippetOpen={textSnippetOpen}
          ignoredSlots={ignoredSlots}
          launchModalFromFreeSlot={LaunchModalFromFreeSlot}
        />
        <FreeBlocks
          free_blocks={free_blocks}
          ignoreHandler={ignoreHandler}
          day_idx={index}
          textSnippetOpen={textSnippetOpen}
        />
        {isToday && <TodayTimeMarker />}

        {currentlyHoveredEventIdx != -1 &&
          textSnippetOpen == false &&
          events.length > 0 && (
            <EventTooltip
              events={events}
              currentlyHoveredEventIdx={currentlyHoveredEventIdx}
              setCurrentlySelectedEventIdx={setCurrentlySelectedEventIdx}
              eventTooltipId={eventTooltipId}
              setExternalHighlightIdx={setExternallyHighlightedCalendarEventIdx}
              launchModal={LaunchModalFromExistingEvent}
            />
          )}
      </div>
    </div>
  );
}

// -------------------------- IMMUTABLE COMPONENTS -------------------------- //

// Shows the current time if in fact today is the day
function TodayTimeMarker() {
  const initialTime = DateTime.now();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((elapsedSeconds) => elapsedSeconds + 15);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          right: datetimeToOffset(
            initialTime.plus({ seconds: elapsedSeconds }).toISO(), // TODO: Note that this function doesn't actually use seconds atm, need to change this later
            initialTime.plus({ seconds: elapsedSeconds + 1 }).toISO(),
            0
          )[0],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginTop: '10px',
          zIndex: 50,
        }}
      >
        <div
          style={{
            width: '3px',
            height: '3px',
            backgroundColor: 'red',
            borderRadius: '20px',
          }}
        ></div>
        <div
          style={{ width: '1px', height: '30px', backgroundColor: 'red' }}
        ></div>
      </div>
    </div>
  );
}

function DateText(props: { dateText: string; isToday: boolean }) {
  const { dateText, isToday } = props;
  const dateObj = DateTime.fromISO(dateText);

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const dayOfMonth = dateObj.day;
  const monthOfYear = dateObj.month;
  const dayOfWeek = dateObj.weekday;

  const dayString =
    weekdays[dayOfWeek] +
    ' ' +
    monthOfYear.toString() +
    '/' +
    dayOfMonth.toString();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row',
        marginTop: '27px',
        marginRight: '5px',
        minWidth: '70px',
        maxWidth: '70px',
      }}
    >
      {isToday && (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              backgroundColor: 'red',
              width: '4px',
              height: '4px',
              borderRadius: '20px',
              position: 'absolute',
              right: '5px',
              top: '6px',
            }}
          ></div>
        </div>
      )}
      <div className="horizontalCalendarDateText">{dayString}</div>
    </div>
  );
}

// Creates the horizontal bars needed for
function HorizontalBars(props: { overlap_depth: number }) {
  const { overlap_depth } = props;
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
    <div style={{ position: 'relative' }}>
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
    '2021-06-09T00:00:00-07:00',
    hard_start,
    0
  );

  // Create offset and width for the start hard limit
  const [endOffset, endWidth] = datetimeToOffset(
    hard_end,
    '2021-06-09T23:59:59-07:00',
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
