import React, { useRef, useState, useEffect } from 'react';
import CSS from 'csstype';
import HorizontalCalendar from './HorizontalCalendar';
import EventModal from './EventModal';
import { RegisteredAccount } from '../../types';
const { DateTime } = require('luxon');
import { BAR_WIDTH } from '../../../util/CalendarViewUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarBody {
  calendar_data: any;
  calendarAccounts: Array<RegisteredAccount>;
  ignoreHandler: any;
  ignoredSlots: Array<Array<number>>;
  textEngineLaunched: boolean;
  scheduleNewEvent: any;
  modifyExistingEvent: any;
  selectedDayIdx: number;
  setSelectedDayIdx: any;
  selectedEventIdxInSelectedDay: number;
  setSelectedEventIdxInSelectedDay: any;
  modalShow: boolean;
  setModalShow: any;
  setModalShowsNewEvent: any;
  modalShowsNewEvent: boolean;
}

// State needs to contain the folllwing information about the event that is currently selected (or none is selected):
// event start time, event end time, event date, event description, event location, event calendar, event title
export default function CalendarBody(props: CalendarBody) {
  const {
    calendar_data,
    calendarAccounts,
    ignoreHandler,
    ignoredSlots,
    textEngineLaunched,
    scheduleNewEvent,
    modifyExistingEvent,
    selectedDayIdx,
    setSelectedDayIdx,
    selectedEventIdxInSelectedDay,
    setSelectedEventIdxInSelectedDay,
    modalShow,
    setModalShow,
    modalShowsNewEvent,
    setModalShowsNewEvent,
  } = props;

  const bodyRef = useRef(null);

  // State

  const [modalEventStart, setModalEventStart] = useState(
    DateTime.fromISO('2021-06-09T16:10:00-07:00')
  );
  const [modalEventEnd, setModalEventEnd] = useState(
    DateTime.fromISO('2021-06-09T17:10:00-07:00')
  );
  const [modalEventTitle, setModalEventTitle] = useState('');
  const [modalEventLocation, setModalEventLocation] = useState('');
  const [modalEventCalendar, setModalEventCalendar] = useState({
    name: "Alex's Calendar",
    color: 'blue',
  }); // TODO: Fetch from context
  const [modalEventDescription, setModalEventDescription] = useState('');

  const initial_scroll_amount = calculateScroll(
    calendar_data.days[0].free_blocks
  );

  const calendarBodyStyle: CSS.Properties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: '550px',
    borderRadius: '12px',
    boxShadow: 'inset 0 0 20px rgba(0, 0, 0, .05)',
    flexDirection: 'column',
    maxHeight: textEngineLaunched ? '140px' : '310px',
    overflow: 'overlay',
    scrollMarginTop: '5px',
  };

  // Since each slot in our ignoredSlots array has a day index associated with it, we extract only the block and slot indices
  // for processing with the horizontal calendar itself
  function reduceIgnoredSlotsArray(day_idx) {
    let reducedArray = [];

    ignoredSlots.forEach((slot) => {
      if (slot[0] === day_idx) {
        reducedArray.push([slot[1], slot[2]]);
      }
    });

    return reducedArray;
  }

  // Scrolls to the first occurence of a free slot
  function calculateScroll(free_blocks: Array<any>) {
    if (free_blocks.length > 0) {
      const earliestTime = DateTime.fromISO(free_blocks[0].start_time);
      const earliestHour = earliestTime.hour;

      return earliestHour * BAR_WIDTH - BAR_WIDTH * 0.25;
    } else {
      return 300;
    }
  }

  return (
    <div style={calendarBodyStyle} ref={bodyRef}>
      {calendar_data.days.map((data, idx) => (
        <div
          key={idx}
          style={{
            display: 'flex',
            minWidth: '430px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <HorizontalCalendar
            date={data.calendar_date}
            hard_start={data.hard_start}
            hard_end={data.hard_end}
            free_blocks={data.free_blocks}
            ignoreHandler={ignoreHandler}
            events={data.events}
            index={idx}
            textSnippetOpen={textEngineLaunched}
            ignoredSlots={reduceIgnoredSlotsArray(idx)}
            eventTooltipId={idx.toString() + data.hard_start}
            initial_scroll_amount={initial_scroll_amount}
            scheduleNewEvent={scheduleNewEvent}
            event_overlap_depth={data.event_overlap_depth}
            selectedDayIdx={selectedDayIdx}
            setModalShow={setModalShow}
            setModalEventDayIdx={setSelectedDayIdx}
            setModalEventIdxInDay={setSelectedEventIdxInSelectedDay}
            setShowsNewEvent={setModalShowsNewEvent}
            setModalEventEnd={setModalEventEnd}
            setModalEventStart={setModalEventStart}
            setModalEventTitle={setModalEventTitle}
            setModalEventLocation={setModalEventLocation}
            setModalEventDescription={setModalEventDescription}
            setModalEventCalendar={setModalEventCalendar}
            setSelectedDayIdx={setSelectedDayIdx}
          />
        </div>
      ))}
      <div style={{ height: '20px' }}></div>
      {modalShow && (
        <EventModal
          dayIdx={selectedDayIdx}
          isNewEvent={modalShowsNewEvent}
          eventStart={modalEventStart}
          eventEnd={modalEventEnd}
          eventTitle={modalEventTitle}
          eventLocation={modalEventLocation}
          eventCalendar={modalEventCalendar}
          eventDescription={modalEventDescription}
          modalEventIdxInDay={selectedEventIdxInSelectedDay}
          setIsOpen={setModalShow}
          setShowsNewEvent={setModalShowsNewEvent}
          setEventStart={setModalEventStart}
          setEventEnd={setModalEventEnd}
          setEventTitle={setModalEventTitle}
          setEventLocation={setModalEventLocation}
          setEventCalendar={setModalEventCalendar}
          setEventDescription={setModalEventDescription}
          scheduleNewEvent={scheduleNewEvent}
          modifyExistingEvent={modifyExistingEvent}
        />
      )}
    </div>
  );
}
