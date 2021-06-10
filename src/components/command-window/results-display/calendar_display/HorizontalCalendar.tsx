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


    // -------------------------- HORIZONTAL SCROLL STUFF -------------------------- //
    const scrollRef = useRef(null)

    useDragScroll({
        sliderRef: scrollRef,
        momentumVelocity: 0
    })
    
    useEffect(() => {
        if (scrollRef.current !== null) {
            const xScrollAmount = calculateScroll()
            scrollRef.current.scrollTo(xScrollAmount, 0)
        }
    }, [])

    function calculateScroll() {
        if(free_blocks.length > 0) {
            const earliestTime = new Date(free_blocks[0].start_time)
            const earliestHour = earliestTime.getUTCHours()
            const earliestMin = earliestTime.getUTCMinutes()

            const minOffset = calculateMinutes(earliestMin)

            return (earliestHour)*40 - 20

        } else {
            return 300
        }
        
    }


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

    function datetimeToOffset(start: string, end: string, borderAdjust: number) {

        
        const startTime = new Date(start)
        const endTime = new Date(end)

        const startHour = startTime.getUTCHours()
        const endHour = endTime.getUTCHours()

        const startMin= startTime.getUTCMinutes()
        const endMin = endTime.getUTCMinutes()
        
        var minOffset = calculateMinutes(startMin)
        var minDifferenceOffset = calculateMinutes(endMin-startMin)

        // Formula for finding the offset from right needed (assumes the size of each bar is 40px, as defined in index.css)

        const offset =  20 + (24-startHour)*40 - minOffset*10 - borderAdjust

        const width = (endHour-startHour)*40 + minDifferenceOffset*10 - borderAdjust

        if (end === "2021-06-09T24:00:00Z") {
            const newWidth = (24 - (startHour-endHour))*40 + minDifferenceOffset*10 - borderAdjust

            return [String(offset-newWidth + 'px'), String(newWidth + 'px')]
        }
        return [String(offset-width + 'px'), String(width + "px")]

    }

    
    // -------------------------- IMMUTABLE STUFF -------------------------- //
    
    // Creates the horizontal bars needed for 
    function HorizontalBars() {
        return (
            <div style={{display: "flex"}}>
               
                <div style={{display:"flex"}}>
                    {timeMarkersAM.map((time, idx) => (
                        <div key={idx} style={timeBarStyle}>
                            <div className="timeBarText">
                                {time}
                            </div>
                            <div style={{width: "0.5px", backgroundColor: "#7D7D7D", opacity: "50%", height: "28px"}}>
                                
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
                            <div style={{width: "0.5px", backgroundColor: "#7D7D7D", opacity: "50%", height: "28px"}}>
                                
                            </div>
                        </div>
                    ))}
                </div>
               
            </div>
        )
    }

    function GradientEdges() {

        return(
            <div style={{position: "absolute", marginTop: "12px"}}>
                <div style={{position: "absolute", minWidth: "10px", minHeight: "30px", backgroundColor: "white", opacity: "80%", zIndex: 1}}>

                </div>
                <div style={{position: "absolute", minWidth: "10px", minHeight: "30px", backgroundColor: "white", left: "360px", opacity: "80%", zIndex: 1}}>
                
                </div>
            </div>
            
        )
    }

    // -------------------------- Hard Limit Bars -------------------------- //
    function LimitBars() {
        // Create offset and width for the start hard limit
        const [startOffset, startWidth] = datetimeToOffset("2021-06-09T00:00:00Z", hard_start, 0)

        // Create offset and width for the start hard limit
        const [endOffset, endWidth] = datetimeToOffset(hard_end, "2021-06-09T24:00:00Z", 0)
        

        return (
            <div style={{position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "16px"}}>
                <div style={{position: "absolute", right: startOffset, minWidth: startWidth, width: startWidth, backgroundColor: "gray", opacity: "15%", minHeight: "19px"}}>
                </div>

                <div style={{position: "absolute", right: endOffset, minWidth: endWidth, width: endWidth, backgroundColor: "gray", opacity: "15%", minHeight: "19px"}}>
                </div>

            </div>
        )
    }

    function CalendarEvents() {
        return (
            <div style={{position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginTop: "4px"}} >
                {events.map((event, idx) => (
                    <div key={idx}>
                        <div style={{position: "absolute", 
                                right: datetimeToOffset(event.start_time, event.end_time, 1)[0], 
                                width: datetimeToOffset(event.start_time, event.end_time, 1)[1],
                                backgroundColor: "gray",
                                opacity: "70%",
                                minHeight: "14px",
                                borderRadius: 3 , 
                                cursor: "pointer"    
                        }}
                            onClick={() => myConsole.log("wtf")}
                        >
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    function FreeBlocks() {
        return (
            <div style={{position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "6px"}} >
                {free_blocks.map((event, idx) => (
                    <div key={idx}>
                        <div style={{position: "absolute", 
                                right: datetimeToOffset(event.start_time, event.end_time, 5)[0], 
                                width: datetimeToOffset(event.start_time, event.end_time, 5)[1],
                                backgroundColor: "rgba(135, 220, 215, .35)",
                                minHeight: "20px",
                                borderRadius: 3 , 
                                border: "2px solid rgba(135, 220, 215, 1)",
                                cursor: "pointer", 
                                
                        }}
                            onClick={() => myConsole.log("wtf")}
                        >
                        </div>
                    </div>
                ))}
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
           <CalendarEvents />
           
           <FreeBlocks />
           <GradientEdges />
           
            
          
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