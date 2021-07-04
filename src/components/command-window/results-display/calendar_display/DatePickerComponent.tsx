import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';
const clockIcon = require('/src/content/svg/ClockIcon.svg');
import TimePickerPopup from './TimePickerPopup';
const { DateTime } = require("luxon");


var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);



// Stuff for the MUI component
type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P];
};

declare module '@material-ui/core/styles/overrides' {
  export interface ComponentNameToClassKey extends overridesNameToClassKey {}
}

const materialTheme = createMuiTheme({
    typography: {
        fontFamily: 'Montserrat, sans serif',
        fontSize: 12,
    },
    palette: {
        primary: {
            main: "rgb(125, 189, 220)",
           
        },
    },
    overrides: {
        MuiInputBase: {
            input: {
              color: "grey",
              borderColor: "grey",
              // .. other styling that you want
              cursor: "pointer"
            }
        },
        MuiFormLabel: {
            root: {
                color: 'grey',
            },
        },
    }   
});

// Generates a string to show the time correctly
function  _getTimeString(time, military: boolean) {
    let hour = time.hour;
    let minute = time.minute;

    let minuteString = minute.toString()
    if (minute < 10) {
        minuteString = "0" + minute.toString()
    }

    let period = ''

    if (!military) {
        if (hour > 12) {
            hour = hour % 12
            period = ' PM'
        } else if (hour == 0) {
          hour = 12
          period = " AM"  
        } else {
            period = ' AM'
        }
    }

    return hour.toString() + ":" + minuteString + period

}


interface DatePickerProps {
    eventStart: any
    eventEnd: any
    setEventStart: any
    setEventEnd: any
}
 

export default function DatePickerComponent(props: DatePickerProps) {

    const {eventStart, eventEnd, setEventStart, setEventEnd} = props
    const [datePickerColor, setDatePickerColor] = useState("rgba(172, 170, 170, 0.5)")
    const [startTimeColor, setStartTimeColor] = useState("rgba(172, 170, 170, 0.5)")
    const [endTimeColor, setEndTimeColor] = useState("rgba(172, 170, 170, 0.5)")

    const [showTimePicker, setShowTimePicker] = useState(false)
    const [timePickerModifying, setTimePickerModifying] = useState('start')


    // Resets the start and end times to reflect a change in date
    // Used by the date picker from material-ui
    function setEventTimesOnDateChange(date) {
        let newStartHours = eventStart.hour
        let newStartMinutes = eventStart.minute

        let newEndHours = eventEnd.hour
        let newEndMinutes = eventEnd.minute

        let newStart = date.set({hour: newStartHours, minute: newStartMinutes})
        let newEnd = date.set({hour: newEndHours, minute: newEndMinutes})

        setEventStart(newStart)
        setEventEnd(newEnd)
    }


    return (
        <div
            style={{marginLeft: "5px", display: "flex", flexDirection: "row", alignItems: "center"}}
        >
            <img src={clockIcon} style={{height: "15px", width: "15px"}}/>
            <div
                style={{marginLeft: "10px", marginTop: '-3px', cursor: "pointer"}}
                onMouseEnter={() => setDatePickerColor("rgb(125, 189, 220)")}
                onMouseLeave={() => setDatePickerColor("rgba(172, 170, 170, 0.5)")}
            >
                <ThemeProvider theme={materialTheme}>
                    <DatePicker
                        disableToolbar
                        autoOk={true}
                        variant="inline"
                        value={eventStart}
                        onChange={(date) => setEventTimesOnDateChange(DateTime.fromISO(date.toISOString()))}
                        className="datePicker"
                        InputProps={{disableUnderline: true}}
                        onOpen={() => setDatePickerColor("rgb(125, 189, 220)")}
                        onClose={() => setDatePickerColor("rgba(172, 170, 170, 0.5)")}
                    />
                </ThemeProvider>
                <div style={{height: "1px", marginTop: "-2px", marginLeft: "1px", width: "100px", backgroundColor: datePickerColor}}></div>
            </div>
            <div
                style={{marginTop: "3px", cursor: "pointer"}}
                onMouseEnter={() => setStartTimeColor("rgb(125, 189, 220)")}
                onMouseLeave={() => setStartTimeColor("rgba(172, 170, 170, 0.5)")}
                onClick={() => {setShowTimePicker(true); setTimePickerModifying('start')}}
            >
                <div
                    className="eventModalTime"
                >
                    {_getTimeString(eventStart, false)}
                </div>
                <div style={{height: "1px", marginTop: "2px", marginLeft: "0px", width: "60px", backgroundColor: startTimeColor}}></div>
            </div>
            <div
                className="eventModalTimePlainString"
            >
                to
            </div>

            <div
                style={{marginTop: "3px", cursor: "pointer"}}
                onMouseEnter={() => setEndTimeColor("rgb(125, 189, 220)")}
                onMouseLeave={() => setEndTimeColor("rgba(172, 170, 170, 0.5)")}
                onClick={() => {setShowTimePicker(true); setTimePickerModifying('end')}}
            >
                <div
                    className="eventModalTime"
                >
                    {_getTimeString(eventEnd, false)}
                </div>
                <div style={{height: "1px", marginTop: "2px", marginLeft: "0px", width: "60px", backgroundColor: endTimeColor}}></div>
            </div>

            {showTimePicker && ( 
                <TimePickerPopup 
                    isOpen={showTimePicker}
                    setIsOpen={setShowTimePicker}
                    timePickerModifying={timePickerModifying} 
                    eventStart={eventStart}
                    eventEnd={eventEnd}
                    setEventStart={setEventStart} 
                    setEventEnd={setEventEnd}
                />
            )}

            


           
        </div>
    )
}




