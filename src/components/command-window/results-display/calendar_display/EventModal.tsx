import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import DatePickerComponent from './DatePickerComponent';
import CalendarPickerComponent from './CalendarPickerComponent';
const locationIcon = require('/src/content/svg/locationIcon.svg');
const textIcon = require('/src/content/svg/TextIcon.svg');
const { DateTime } = require("luxon");


interface EventModalProps {
    dayIdx: number
    isNewEvent: boolean
    eventStart: any
    eventEnd: any
    eventTitle: string
    eventLocation: string
    eventCalendar: {name: string, color: string};
    eventDescription: string
    modalEventIdxInDay: number

    setIsOpen: any
    setShowsNewEvent: any
    setEventStart: any
    setEventEnd: any
    setEventTitle: any
    setEventLocation: any
    setEventCalendar: any
    setEventDescription: any

    scheduleNewEvent: any
    modifyExistingEvent: any
}

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function EventModal(props: EventModalProps) {

    const {
        dayIdx,
        isNewEvent,
        eventStart,
        eventEnd, 
        eventTitle,
        eventLocation, 
        eventCalendar, 
        eventDescription, 
        modalEventIdxInDay,
        setIsOpen, 
        setShowsNewEvent,
        setEventStart, 
        setEventEnd, 
        setEventLocation, 
        setEventTitle, 
        setEventCalendar, 
        setEventDescription,
        scheduleNewEvent, 
        modifyExistingEvent
    
    } = props

    
    const [changeMade, setChangeMade] = useState(false) // Tracks whether we actually changed anything

    const saveButtonColor = (changeMade && eventTitle != '') ? "rgb(125, 189, 220)" : "rgba(125, 189, 220, .4)"

    // Little hack to avoid triggering on first mount
    const dummyRef = useRef(true)
    useEffect(() => {
        if (dummyRef.current) {
            dummyRef.current = false;
        } else {
            setChangeMade(true)
        }
    })

    

    function handleSave() {
        if (isNewEvent) {
            // create new event
            scheduleNewEvent(
                eventStart.toISO(),
                eventEnd.toISO(),
                eventTitle,
                "fake_url", // TODO: generate a UrL? maybe this takes place in the new event scheduler in ResultEngine
                eventCalendar.color,
                eventCalendar.name,
                eventCalendar.color, 
                dayIdx
            )

            setIsOpen(false)
        } else {

            // modify existing event 
            modifyExistingEvent(
                eventStart.toISO(),
                eventEnd.toISO(),
                eventTitle,
                "fake_url", // TODO: generate a UrL? maybe this takes place in the new event scheduler in ResultEngine
                eventCalendar.color,
                eventCalendar.name,
                eventCalendar.color, 
                dayIdx, 
                modalEventIdxInDay
            )
            
            setIsOpen(false)

        }

    }

    function handleCancel() {
        setEventTitle('')
        setShowsNewEvent(true)
        setEventStart(DateTime.now()) // just use Now as a filler to avoid type issues
        setEventEnd(DateTime.now())
        setEventLocation('')
        setEventCalendar(null)
        setEventDescription('')
        setIsOpen(false)
    }


    return ( 
        <div
            style={ModalAreaStyles}
            onClick={() => setIsOpen(false)}
        >
            <div
                style={ModalStyles}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{marginTop: "25px"}}
                >
                     <input 
                        className="eventModalTitle" 
                        placeholder="Title.."
                        style={{}}
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                    />
                    
                </div>
                <div style={{height: "0.25px", marginTop: "10px", marginLeft: "1px", width: "375px", backgroundColor: "grey", opacity: "30%"}}></div>

                <div
                    style={{marginTop: "15px"}}
                >
                    <DatePickerComponent 
                        eventStart={eventStart}
                        eventEnd={eventEnd}
                        setEventStart={setEventStart}
                        setEventEnd={setEventEnd}
                    />
                </div>
                <div
                    style={{marginTop: "10px", marginLeft: "2px"}}
                >
                    <CalendarPickerComponent 
                        eventCalendar={eventCalendar}
                        setEventCalendar={setEventCalendar}
                    />
                </div>
                <div
                    style={{marginTop: "15px", marginLeft: "6px", display: "flex", justifyContent: "center", alignItems: "center"}}
                >
                    <img src={locationIcon} style={{height: "15px", width: "15px"}}/>
                    <div>
                        <input 
                            className="eventModalLocation"
                            placeholder="Location.."
                            style={{marginLeft: "7px"}}
                            value={eventLocation}
                            onChange={(e) => setEventLocation(e.target.value)}
                        />
                    </div>
                </div>
                
                <div
                    style={{marginTop: "15px", marginLeft: "7px", display: "flex",  }}
                >
                    <img src={textIcon} style={{height: "13px", width: "13px"}}/>
                    <div style={{marginTop: "-3px"}}>
                        <textarea 
                            className="eventModalDescription"
                            placeholder="Description.."
                            style={{marginLeft: "8px", height: "100px"}}
                            value={eventDescription}
                            onChange={(e) => setEventDescription(e.target.value)}
                        />
                    </div>
                    
                </div>
                <div
                    style={{marginTop: "0px", marginLeft: "0px", marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center", width: "400px"}}
                >
                    <div
                        onClick={() => { if (changeMade && eventTitle != '') {handleSave()}}}
                        style={{cursor: "pointer", height: "30px", width: "100px", backgroundColor: saveButtonColor, borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                        <div
                            className="eventModalSaveButtonText"
                        >
                            Save
                        </div>
                    </div>
                    <div
                        className="eventModalCancelButtonText"
                        style={{marginLeft: "170px", position: "absolute", cursor: "pointer"}}
                        onClick={() => handleCancel()}
                    >
                        cancel
                    </div>
                </div>
              
            </div>
        </div>
        
       
    )
}


const ModalStyles: CSS.Properties = {
    minWidth: "400px",
    minHeight: "300px",
    backgroundColor: "#FFFFFF",
    boxShadow: '0 0 100px rgba(0,0,0, 0.3)',
    borderRadius: "12px",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    paddingLeft: "20px", 
    marginTop: "50px"
}

const ModalAreaStyles: CSS.Properties = {
    position: "absolute",
    width: "800px", 
    minHeight: "800px",
    marginTop: "-200px", 
    backgroundColor: "rgba(211,211,211,0.0)", 
    zIndex: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}