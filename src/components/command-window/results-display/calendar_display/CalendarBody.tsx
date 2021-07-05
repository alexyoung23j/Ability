import React, { useRef, useState, useEffect } from 'react'
import CSS from 'csstype'
import HorizontalCalendar from './HorizontalCalendar'
import EventModal from './EventModal';
const { DateTime } = require("luxon");


var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarBody {
    calendar_data: any
    ignoreHandler: any
    ignoredSlots: Array<Array<number>>
    textEngineLaunched: boolean;
    scheduleNewEvent: any

}

// State needs to contain the folllwing information about the event that is currently selected (or none is selected):
// event start time, event end time, event date, event description, event location, event calendar, event title
export default function CalendarBody(props: CalendarBody) {
    
    const {calendar_data, ignoreHandler, ignoredSlots, textEngineLaunched, scheduleNewEvent} = props

    const bodyRef = useRef(null)

    // State
    const [modalShow, setModalShow] = useState(true)
    const [modalShowsNewEvent, setModalShowsNewEvent] = useState(false)
    const [modalEventStart, setModalEventStart] = useState(DateTime.fromISO('2021-06-09T16:10:00-07:00'))
    const [modalEventEnd, setModalEventEnd] = useState(DateTime.fromISO("2021-06-09T17:10:00-07:00"))
    const [modalEventTitle, setModalEventTitle] = useState('')
    const [modalEventLocation, setModalEventLocation] = useState('')
    const [modalEventCalendar, setModalEventCalendar] = useState({name: "First Calendar", color: "blue"}) // TODO: Fetch from context 
    const [modalEventDescription, setModalEventDescription] = useState('')


    useEffect(() => {
        myConsole.log(modalEventStart.toString(), modalEventEnd.toString())
    }, [modalEventStart, modalEventEnd])


    // Since each slot in our ignoredSlots array has a day index associated with it, we extract only the block and slot indices 
    // for processing with the horizontal calendar itself
    function reduceIgnoredSlotsArray(day_idx) {
        let reducedArray = []

        ignoredSlots.forEach((slot) => {
            if (slot[0] === day_idx) {
                reducedArray.push([slot[1], slot[2]])
            }
        })
        
        return reducedArray
    }
    
    return (
        <div style={calendarBodyStyle} ref={bodyRef}>
            {calendar_data.days.map((data, idx) => (
                <div key={idx} style={{display: "flex", minWidth: "430px", justifyContent: "center", alignItems: "center"}}>
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
                        scheduleNewEvent={scheduleNewEvent}
                        event_overlap_depth={data.event_overlap_depth}
                        setModalShow={setModalShow}
                        setShowsNewEvent={setModalShowsNewEvent}
                        setModalEventEnd={setModalEventEnd}
                        setModalEventStart={setModalEventStart}
                        setModalEventTitle={setModalEventTitle}
                        setModalEventLocation={setModalEventLocation}
                        setModalEventDescription={setModalEventDescription}
                        setModalEventCalendar={setModalEventCalendar}
                    />
                </div>
            ))}
            <div style={{height: "20px"}}>

            </div>
            <EventModal 
                isOpen={modalShow}
                isNewEvent={modalShowsNewEvent}
                eventStart={modalEventStart}
                eventEnd={modalEventEnd}    
                eventTitle={modalEventTitle}
                eventLocation={modalEventLocation}
                eventCalendar={modalEventCalendar}
                eventDescription={modalEventDescription}

                setIsOpen={setModalShow}
                setShowsNewEvent={setModalShowsNewEvent}
                setEventStart={setModalEventStart}
                setEventEnd={setModalEventEnd}
                setEventTitle={setModalEventTitle}
                setEventLocation={setModalEventLocation}
                setEventCalendar={setModalEventCalendar}
                setEventDescription={setModalEventDescription}

                scheduleNewEvent={scheduleNewEvent}
            />    
        </div>
    )
}

const calendarBodyStyle: CSS.Properties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: "550px",
    borderRadius: "12px",
    boxShadow: "inset 0 0 20px rgba(0, 0, 0, .05)",
    flexDirection: "column",
    maxHeight: "305px",
    overflow: "overlay",
    scrollMarginTop: "5px"

}