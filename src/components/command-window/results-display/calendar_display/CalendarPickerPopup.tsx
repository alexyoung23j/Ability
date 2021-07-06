import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { AnimationType } from 'framer-motion/types/render/utils/types';
const { DateTime } = require("luxon");
import { generatePickerTimeOptions } from '../../../util/CalendarUtil';


var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface CalendarPickerPopupProps {
    isOpen: boolean;
    calendars: Array<{name: string, color: string}>
    eventCalendar: {name: string, color: string}
    setEventCalendar: any

}

export default function CalendarPickerPopup(props: CalendarPickerPopupProps) {

    const {
        isOpen,
        calendars,
        eventCalendar,
        setEventCalendar
    } = props

    return (
        <div
            style={pickerAreaStyles}
        >
            <div
                style={pickerStyle}
            >
                {calendars.map((calendar, idx) => (
                    <div key={idx}>
                        <CalendarOption 
                            color={calendar.color}
                            name={calendar.name}
                            setEventCalendar={setEventCalendar}
                            eventCalendar={eventCalendar}
                        
                        />

                    </div>
                ))}


            </div>

        </div>
    )
}

interface CalendarOptionProps {
    color: string,
    name: string
    setEventCalendar: any
    eventCalendar: {name: string, color: string}
    
}


function CalendarOption(props: CalendarOptionProps) {

    const {
        color, 
        name,
        setEventCalendar,
        eventCalendar
    } = props;

    let initialColor = (eventCalendar.name == name) ? "rgb(125, 189, 220)" : "rgba(172, 170, 170, 1)"
    const [textColor, setTextColor] = useState(initialColor)

    return (
        <div
            style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", marginLeft: "5px", marginRight: "5px", marginTop: "5px", marginBottom: "5px"}}
        >
             <div
                style={{marginLeft: "0px", width: "8px",  height: "8px", borderRadius: "20px", backgroundColor: color}}
            >
            <div
                className="calendarPopupText"
                style={{color: textColor, height: "20px", marginLeft: "10px", minWidth: "200px"}}
            >
                {name}

            </div>
           

            </div>

        </div>
    )
}



const pickerStyle: CSS.Properties = {
    position: "relative",
    boxShadow: '0 0 100px rgba(0,0,0, 0.1)',
    borderRadius: "4px",
    minWidth: "200px",
    maxHeight: "250px",
    marginLeft: "140px",
    marginTop: "40px",
    backgroundColor: "#FFFFFF", 
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    overflowY: "auto"
}


const pickerAreaStyles: CSS.Properties = {
    position: "absolute",
    width: "420px",
    marginTop: "200px", 
    marginLeft: "240px",
    minHeight: "430px",
    backgroundColor: "rgba(211,211,123,0.5)", 
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}