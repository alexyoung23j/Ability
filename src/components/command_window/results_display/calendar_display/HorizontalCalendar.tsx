import React from 'react'
import CSS from 'csstype'


interface HorizontalCalendar {
    date: string,
    hard_start: string,
    hard_end: string,
    free_blocks: any,
    events: any
    index: number
}

export default function HorizontalCalendar(props: HorizontalCalendar) {
    const  {date} = props
    return (
        <div style={horizontalCalendarStyle}>
            <div style={timeBarStyle}>hi</div>
            <div style={timeBarStyle}></div>
            <div style={timeBarStyle}></div>
            <div style={timeBarStyle}></div>
            <div style={timeBarStyle}></div>
            <div style={timeBarStyle}></div>
            <div style={timeBarStyle}></div>
            <div style={timeBarStyle}></div>

        </div>
    )

}

const horizontalCalendarStyle: CSS.Properties = {
    display: "flex",
    overflowX: "scroll",
    marginTop: "15px",
    flexFlow: "nowrap"
}

const timeBarStyle: CSS.Properties = {
    minWidth: "80px",
    borderLeftColor: "green",
    borderLeftWidth: "2px",
    backgroundColor: "red",
    display: "flex",
    marginLeft: "5px"
}