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
    const [datePickerColor, setDatePickerColor] = useState("#7D7D7D")
    const [startTimeColor, setStartTimeColor] = useState("#7D7D7D")
    const [endTimeColor, setEndTimeColor] = useState("#7D7D7D")

    const [showTimePicker, setShowTimePicker] = useState(false)
    const [timePickerModifying, setTimePickerModifying] = useState('start')

    const materialTheme = createMuiTheme({
        typography: {
            fontFamily: 'Montserrat',
            fontSize: 12,
            fontWeightBold: "bolder"
        },
        palette: {
            primary: {
                main: "rgb(125, 189, 220)",
               
            },
        },
        overrides: {
            MuiInputBase: {
                input: {
                  color: datePickerColor,
                  borderColor: "#7D7D7D",
                  // .. other styling that you want
                  cursor: "pointer"
                }
            },
            MuiFormLabel: {
                root: {
                    color: '#7D7D7D',
                },
            },
        }   
    });


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
            style={{marginLeft: "5px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center"}}
        >
            <img src={clockIcon} style={{height: "15px", width: "15px"}}/>
            <div
                style={{marginLeft: "10px", marginTop: '0px', cursor: "pointer"}}
                onMouseEnter={() => setDatePickerColor("rgb(125, 189, 220)")}
                onMouseLeave={() => setDatePickerColor("#7D7D7D")}
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
                        onClose={() => setDatePickerColor("#7D7D7D")}
                    />
                </ThemeProvider>
            </div>
            <div
                style={{marginTop: "2px", cursor: "pointer", 
                        display: "flex", flexDirection: "column", alignItems: "center"}}
                onMouseEnter={() => setStartTimeColor("rgb(125, 189, 220)")}
                onMouseLeave={() => setStartTimeColor("#7D7D7D")}
                onClick={() => {setShowTimePicker(true); setTimePickerModifying('start')}}
            >
                <div
                    className="eventModalTime"
                    style={{color: startTimeColor, marginTop: "3px", marginLeft: "3px", marginBottom: "1px", marginRight: "3px"}}
                >
                    {_getTimeString(eventStart, false)}
                </div>
                <div style={{height: "1px", marginTop: "0px", marginLeft: "1px", width: "55px", backgroundColor: startTimeColor}}></div>
            </div>
            <div
                className="eventModalTimePlainString"
                style={{marginTop: "2px"}}
            >
                to
            </div>

            <div
                style={{marginTop: "4px", cursor: "pointer", 
                    display: "flex", flexDirection: "column", alignItems: "center"}}
                onMouseEnter={() => setEndTimeColor("rgb(125, 189, 220)")}
                onMouseLeave={() => setEndTimeColor("#7D7D7D")}
                onClick={() => {setShowTimePicker(true); setTimePickerModifying('end')}}
            >
                <div
                    className="eventModalTime"
                    style={{color: endTimeColor}}
                >
                    {_getTimeString(eventEnd, false)}
                </div>
                <div style={{height: "1px", marginTop: "0px", marginLeft: "1px", width: "55px", backgroundColor: endTimeColor}}></div>

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




