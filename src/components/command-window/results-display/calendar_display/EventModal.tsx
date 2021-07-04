import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import DatePickerComponent from './DatePickerComponent';
import CalendarPickerComponent from './CalendarPickerComponent';
const locationIcon = require('/src/content/svg/locationIcon.svg');
const textIcon = require('/src/content/svg/TextIcon.svg');

interface EventModalProps {
    isOpen: boolean
    isNewEvent: boolean
    eventStart: Date
    eventEnd: Date
    eventTitle: string
    eventLocation: string
    eventCalendar: string
    eventDescription: string

    setIsOpen: any
    setShowsNewEvent: any
    setEventStart: any
    setEventEnd: any
    setEventTitle: any
    setEventLocation: any
    setEventCalendar: any
    setEventDescription: any

    scheduleNewEvent: any
}

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function EventModal(props: EventModalProps) {

    const {isOpen,
        isNewEvent,
        eventStart,
        eventEnd, 
        eventTitle,
        eventLocation, 
        eventCalendar, 
        eventDescription, 
        setIsOpen, 
        setShowsNewEvent,
        setEventStart, 
        setEventEnd, 
        setEventLocation, 
        setEventTitle, 
        setEventCalendar, 
        setEventDescription,
        scheduleNewEvent
    
    } = props

    // State
    const [titleBarColor, setTitleBarColor] = useState("rgba(172, 170, 170, 0.5)")
    const [locationBarColor, setLocationBarColor] = useState("rgba(172, 170, 170, 0.5)")

    return ( 
        isOpen && ( 
        <div
            style={ModalAreaStyles}
            onClick={() => setIsOpen(false)}
        >
            <div
                style={ModalStyles}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{marginTop: "30px"}}
                >
                     <input 
                        className="eventModalTitle" 
                        placeholder="Title.."
                        style={{}}
                        onFocus={() => setTitleBarColor("rgb(125, 189, 220)")}
                        onBlur={() => setTitleBarColor("rgba(172, 170, 170, 0.5)")}
                        onMouseEnter={() => setTitleBarColor("rgb(125, 189, 220)")}
                        onMouseLeave={() => setTitleBarColor("rgba(172, 170, 170, 0.5)")}
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                    />
                    <div style={{height: "1px", marginLeft: "3px", width: "350px", backgroundColor: titleBarColor}}></div>
                </div>
                <div
                    style={{marginTop: "20px"}}
                >
                    <DatePickerComponent 
                        eventStart={eventStart}
                        eventEnd={eventEnd}
                        setEventStart={setEventStart}
                        setEventEnd={setEventEnd}
                    />
                </div>
                <div
                    style={{marginTop: "10px", marginLeft: "5px", display: "flex", justifyContent: "center", alignItems: "center"}}
                >
                    <img src={locationIcon} style={{height: "15px", width: "15px"}}/>
                    <div>
                        <input 
                            className="eventModalLocation"
                            placeholder="Location.."
                            style={{marginLeft: "10px"}}
                            onFocus={() => setLocationBarColor("rgb(125, 189, 220)")}
                            onBlur={() => setLocationBarColor("rgba(172, 170, 170, 0.5)")}
                            onMouseEnter={() => setLocationBarColor("rgb(125, 189, 220)")}
                            onMouseLeave={() => setLocationBarColor("rgba(172, 170, 170, 0.5)")}
                            value={eventLocation}
                            onChange={(e) => setEventLocation(e.target.value)}
                        />
                        <div style={{height: "1px", marginLeft: "10px", width: "150px", backgroundColor: locationBarColor}}></div>
                    </div>
                </div>
                <div
                    style={{marginTop: "0px"}}
                >
                   {/*  <CalendarPickerComponent /> */}
                </div>
                <div
                    style={{marginTop: "20px", marginLeft: "5px", display: "flex", justifyContent: "center", alignItems: "flex-start", }}
                >
                    <img src={textIcon} style={{height: "13px", width: "13px"}}/>
                    <div style={{marginTop: "-3px"}}>
                        <textarea 
                            className="eventModalDescription"
                            placeholder="Description.."
                            style={{marginLeft: "10px"}}
                            value={eventDescription}
                            onChange={(e) => setEventDescription(e.target.value)}
                        />
                    </div>
                    
                </div>
                <div
                    style={{marginTop: "0px", marginLeft: "0px", marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center", width: "400px"}}
                >
                    <div
                        onClick={() => {}}
                        style={{cursor: "pointer", height: "30px", width: "100px", backgroundColor: "rgb(125, 189, 220)", borderRadius: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                        <div
                            className="eventModalSaveButtonText"
                        >
                            Save
                        </div>
                    </div>
                </div>
              
            </div>
        </div>
        )
       
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