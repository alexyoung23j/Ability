import React from 'react'
const leftArrow = require('/src/content/svg/LeftArrow.svg');
const rightArrow = require('/src/content/svg/RightArrow.svg');


const { DateTime } = require("luxon");


interface CalendarHeaderProps {
    calendar_data: any // TODO: Make the result data into a type when its all finalized
    showButtons: boolean
}

export default function CalendarHeader(props: CalendarHeaderProps) {

    const { calendar_data, showButtons } = props;

    let start_day = DateTime.fromISO(calendar_data.days[0].calendar_date)
    const StartString = start_day.monthLong + " " + start_day.day
    let EndString = ''

    if (calendar_data.days.length > 1) {
        let end_day = DateTime.fromISO(calendar_data.days[calendar_data.days.length-1].calendar_date)

        if (end_day.month == start_day.month) {
            EndString = "  -  " + end_day.day
        } else {
            EndString = "  -  " + end_day.monthLong + " " + end_day.day
        }

    }

    const FullText = StartString + EndString

    return (
        <div
            style={{marginBottom: "5px", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center"}}
        >
            {showButtons && (
                <div
                    style={{marginRight: "25px", cursor: "pointer"}}
                    onClick={() => {}} // TODO: Add handling for updating the days via click 
                >
                    <img src={leftArrow} style={{height: "10px", width: "10px"}}/>
                </div>    
            )}
            <div
                className="calendarHeaderText"
            >
                {FullText}
            </div>
            {showButtons && (
                <div
                    style={{marginLeft: "25px", cursor: "pointer"}}
                >
                    <img src={rightArrow} style={{height: "10px", width: "10px"}}/>
                </div>    
            )}
            
            
        </div>
    )
}