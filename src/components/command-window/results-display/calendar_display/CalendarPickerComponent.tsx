import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { Overrides } from '@material-ui/core/styles/overrides';
import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';
import { Multiselect } from 'multiselect-react-dropdown';
const miniCalendar = require('/src/content/svg/MiniCalendarIcon.svg');

interface CalendarPickerProps {
    eventCalendar: {name: string, color: string};
    setEventCalendar: any
}
export default function CalendarPickerComponent(props: CalendarPickerProps) {

    // TODO: Add access to context containing the calendar information 
    const calendars = [{name: "Alex's Calendar", color: "red"}, {name: "Alex's Calendar 2", color: "blue"}, {name: "Alex's Calendar 3", color: "green"},]

    const {
        eventCalendar,
        setEventCalendar
    } = props

    // State
    const [textColor, setTextColor] = useState("#7D7D7D")


    return ( 
        <div
        style={{marginLeft: "5px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}
        >
            <img src={miniCalendar} style={{height: "13px", width: "13px"}}/>
            <div
                style={{marginLeft: "10px", color: textColor, cursor: "pointer"}}
                onMouseEnter={() => setTextColor("rgb(125, 189, 220)")}
                onMouseLeave={() => setTextColor("#7D7D7D")}
                className="eventModalCalendarText"
            >
                {eventCalendar.name}
            </div>
            <div
                style={{marginLeft: "10px", width: "8px",  height: "8px", borderRadius: "20px", backgroundColor: eventCalendar.color}}
            >

            </div>
            
       </div>
    )
}