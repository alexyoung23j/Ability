import React from 'react'
import CSS from 'csstype'
import HorizontalCalendar from './HorizontalCalendar'


interface CalendarBody {
    calendar_data: any
}

export default function CalendarBody(props: CalendarBody) {
    
    const {calendar_data} = props

    
    
    return (
        <div style={calendarBodyStyle}>
            {calendar_data.days.map((data, idx) => (
                <div key={idx}>
                    <HorizontalCalendar 
                        date={data.calendar_date}
                        hard_start={data.hard_start}
                        hard_end={data.hard_end}
                        free_blocks={data.free_blocks}
                        events={data.events}
                        index={idx}
                    />
                </div>
            ))}
            <div style={{height: "15px"}}>

            </div>
        </div>
    )
}

const calendarBodyStyle: CSS.Properties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "450px",
    borderRadius: "12px",
    boxShadow: "inset 0 0 40px rgba(0, 0, 0, .05)",
    flexDirection: "column",
    //overflowX: "hidden"

}