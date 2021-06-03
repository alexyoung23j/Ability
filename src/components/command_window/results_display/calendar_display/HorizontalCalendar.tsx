import React, { useRef, useEffect, useState } from 'react'
import CSS from 'csstype'
import ScrollContainer from 'react-indiana-drag-scroll'
import useDragScroll from 'use-drag-scroll'

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


// MARKERS
const timeMarkersAM = ["12 AM", "", "2 AM", "", "4 AM", "", "6 AM", "", "8 AM", "", "10 AM", "",]
const timeMarkersPM = ["12 PM", "", "2 PM", "", "4 PM", "", "6 PM", "", "8 PM", "", "10 PM", "", "12 AM"]

interface HorizontalCalendar {
    date: string,
    hard_start: string,
    hard_end: string,
    free_blocks: any,
    events: any
    index: number
}

export default function HorizontalCalendar(props: HorizontalCalendar) {
    const  { date, hard_start, hard_end, free_blocks, events, index } = props

    const [newElementOffset, setNewElementOffset] = useState(0)


    // -------------------------- HORIZONTAL SCROLL STUFF -------------------------- //
    const scrollRef = useRef(null)

    useDragScroll({
        sliderRef: scrollRef,
        momentumVelocity: 0
    })
    
    useEffect(() => {
        if (scrollRef.current !== null) {
            scrollRef.current.scrollTo(0, 0)
        }
    }, [])


    // -------------------------- Calculating Positioning -------------------------- //
    function calculateMinutes(minutes: number) {
        var minOffset;

        if (Math.abs(minutes) < 15) {
            minOffset=0
        } else if (Math.abs(minutes) < 30) {
            minOffset = 1
        } else if (Math.abs(minutes) < 45) {
            minOffset = 2
        } else {
            minOffset = 3
        }

        return minutes >= 0 ? minOffset : -minOffset
    }

    function datetimeToOffset(start: string, end: string) {

        
        const startTime = new Date(start)
        const endTime = new Date(end)

        const startHour = startTime.getUTCHours()
        const endHour = endTime.getUTCHours()

        const startMin= startTime.getUTCMinutes()
        const endMin = endTime.getUTCMinutes()
        
        var minOffset = calculateMinutes(startMin)
        var minDifferenceOffset = calculateMinutes(endMin-startMin)

        // Formula for finding the offset from right needed (assumes the size of each bar is 40px, as defined in index.css)

        const offset = newElementOffset + 20 + (24-startHour)*40 - minOffset*10

        const width = (endHour-startHour)*40 + minDifferenceOffset*10

        if (end === "2021-06-09T24:00:00Z") {
            return [String(offset+width + 'px'), String(-width + "px")]
        }
        return [String(offset-width + 'px'), String(width + "px")]

    }

    
    // -------------------------- Time Bars -------------------------- //
    
    function HorizontalBars() {
        return (
            <div style={{display: "flex"}}>
               
                <div style={{display:"flex"}}>
                    {timeMarkersAM.map((time, idx) => (
                        <div key={idx} style={timeBarStyle}>
                            <div className="timeBarText">
                                {time}
                            </div>
                            <div style={{width: "0.5px", backgroundColor: "#7D7D7D", opacity: "50%", height: "25px"}}>
                                
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{display:"flex"}}>
                    {timeMarkersPM.map((time, idx) => (
                        <div key={idx} style={timeBarStyle}>
                            <div className="timeBarText">
                                {time}
                            </div>
                            <div style={{width: "0.5px", backgroundColor: "#7D7D7D", opacity: "50%", height: "25px"}}>
                                
                            </div>
                        </div>
                    ))}
                </div>
               
            </div>
        )
    }

    // -------------------------- Hard Limit Bars -------------------------- //
    function LimitBars() {
        // Create offset and width for the start hard limit
        const [startOffset, startWidth] = datetimeToOffset("2021-06-09T00:00:00Z", hard_start)

        // Create offset and width for the start hard limit
        const [endOffset, endWidth] = datetimeToOffset(hard_end, "2021-06-09T24:00:00Z")
        

        return (
            <div style={{position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px"}}>
                <div style={{position: "absolute", right: startOffset, minWidth: startWidth, width: startWidth, backgroundColor: "gray", opacity: "20%", minHeight: "19px"}}>
                </div>

                <div style={{position: "absolute", right: endOffset, minWidth: endWidth, width: endWidth, backgroundColor: "gray", opacity: "20%", minHeight: "19px"}}>
                </div>

            </div>
        )
    }
    
    
    
    return (
        <div 
            ref={scrollRef} 
            style={horizontalCalendarStyle}
        >
           <HorizontalBars />   
           <LimitBars />
            
          
        </div>
    )

}

const horizontalCalendarStyle: CSS.Properties = {
    display: "flex",
    overflowX: "hidden",
    marginTop: "15px",
    flexFlow: "nowrap",
    width: "370px",
    cursor: "grab",
}

const timeBarStyle: CSS.Properties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "40px"
}
