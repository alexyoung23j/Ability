import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';
import { Multiselect } from 'multiselect-react-dropdown';
const clockIcon = require('/src/content/svg/ClockIcon.svg');
import ReactModal from 'react-modal'

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
              borderColor: "grey"
              // .. other styling that you want
            }
        },
        MuiFormLabel: {
            root: {
                color: 'grey',
            },
        },
    }   
});

interface DatePickerProps {
    eventStart: Date
    eventEnd: Date
    setEventStart: any
    setEventEnd: any
}
 


export default function DatePickerComponent(props: DatePickerProps) {

    const {eventStart, eventEnd, setEventStart, setEventEnd} = props

    const [datePickerColor, setDatePickerColor] = useState("rgba(172, 170, 170, 0.5)")

    const [startTime, setStartTime] = useState(["12:30"])
    const [options, setOptions] = useState(["12:30", "12:00", "12:00","12:00","12:00","12:00","12:00","12:00"])

    // Resets the start and end times to reflect a change in date
    function setEventTimesOnDateChange(date: Date) {
        let newStartHours = eventStart.getHours()
        let newStartMinutes = eventStart.getMinutes()

        let newEndHours = eventEnd.getHours()
        let newEndMinutes = eventEnd.getMinutes()

        let newStart = new Date(date)
        let newEnd = new Date(date)

        myConsole.log(newStartHours)
        newStart.setHours(newStartHours)
        newStart.setMinutes(newStartMinutes)

        newEnd.setHours(newEndHours)
        newEnd.setMinutes(newEndMinutes)

        setEventStart(newStart)
        setEventEnd(newEnd)
    }


    return (
        <div
            style={{marginLeft: "5px", display: "flex", flexDirection: "row", alignItems: "center"}}
        >
            <img src={clockIcon} style={{height: "15px", width: "15px"}}/>
            <div
                style={{marginLeft: "10px"}}
            >
                <ThemeProvider theme={materialTheme}>
                    <DatePicker
                        disableToolbar
                        variant="inline"
                        value={eventStart}
                        onChange={(date) => setEventTimesOnDateChange(date)}
                        className="datePicker"
                        InputProps={{disableUnderline: true}}
                        onOpen={() => setDatePickerColor("rgb(125, 189, 220)")}
                        onClose={() => setDatePickerColor("rgba(172, 170, 170, 0.5)")}
                    />
                </ThemeProvider>
                <div style={{height: "1px", marginTop: "-2px", marginLeft: "1px", width: "100px", backgroundColor: datePickerColor}}></div>
            </div>
            <Multiselect 
                options={options}
                isObject={false}
                singleSelect={true}
                placeholder="12:30"
                selectedValues={startTime}
                style={{
                    searchBox: {
                      border: 'none',
                      fontFamily: "Montserrat, sans serif",
                      width: "80px"
                    },
                    multiselectContainer: {
                        height: "10px",
                        width: "80px"
                    },
                    chips: {
                        
                        height: "15px"
                    }
                    
                }}                
            />   
        </div>
    )
}


