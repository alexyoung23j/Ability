import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { Overrides } from '@material-ui/core/styles/overrides';
import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';
import { Multiselect } from 'multiselect-react-dropdown';



// Stuff for the MUI component
type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P];
};

declare module '@material-ui/core/styles/overrides' {
  export interface ComponentNameToClassKey extends overridesNameToClassKey {}
}

const clockIcon = require('/src/content/svg/ClockIcon.svg');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


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


export default function DatePickerComponent() {

    const [selectedDate, handleDateChange] = useState(new Date())
    const [datePickerColor, setDatePickerColor] = useState("rgba(172, 170, 170, 0.5)")

    const [startTime, setStartTime] = useState(["12:30"])

    const [options, setOptions] = useState(["12:30", "12:00", "12:00","12:00","12:00","12:00","12:00","12:00"])



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
                        value={selectedDate}
                        onChange={handleDateChange}
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
                showArrow={false}
                style={{
                    searchBox: {
                      border: 'none',
                      fontFamily: "Montserrat, sans serif",
                      width: "60px"
                    },
                    multiselectContainer: {
                        height: "15px",
                        arrow: 'none',
                        width: "60px"
                    },
                    chips: {
                        
                        height: "15px"
                    }
                    
                }}                
            />

            
            

                
           
        </div>
    )
}


