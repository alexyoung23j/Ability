import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { Overrides } from '@material-ui/core/styles/overrides';
import { MuiPickersOverrides } from '@material-ui/pickers/typings/overrides';
import { Multiselect } from 'multiselect-react-dropdown';
const miniCalendar = require('/src/content/svg/MiniCalendarIcon.svg');


export default function CalendarPickerComponent() {

    const [calendars, setCalendars] = useState([{calendarName: "Alex's Calendar", color: "blue"}, {calendarName: "Birthdays", color: "pink"}])

    const [selectedCalendar, setSelectedCalendar] = useState([{calendarName: "Alex's Calendar", color: "blue"}])

    return ( 
        <div
        style={{marginLeft: "5px", display: "flex", flexDirection: "row", alignItems: "center"}}
        >
            <Multiselect 
                options={calendars}
                isObject={true}
                displayValue="calendarName"
                singleSelect={true}
                placeholder="12:30"
                selectedValues={selectedCalendar}
                showArrow={false}
                style={{
                    searchBox: {
                      border: 'none',
                      fontFamily: "Montserrat, sans serif",
                      width: "80px"
                    },
                    multiselectContainer: {
                        height: "15px",
                        arrow: 'none',
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