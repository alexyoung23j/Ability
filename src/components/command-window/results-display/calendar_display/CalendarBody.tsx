import React from 'react'
import CSS from 'csstype'
import HorizontalCalendar from './HorizontalCalendar'


var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface CalendarBody {
    calendar_data: any
    ignoreHandler: any
    ignoredSlots: Array<Array<number>>
    textEngineLaunched: boolean
}

export default function CalendarBody(props: CalendarBody) {
    
    const {calendar_data, ignoreHandler, ignoredSlots, textEngineLaunched} = props

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
        <div style={calendarBodyStyle}>
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
                    />
                </div>
            ))}
            <div style={{height: "20px"}}>

            </div>
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