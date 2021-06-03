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

    function datetimeToOffset(start: string, end: string) {
        const startTime = new Date(start)
        const endTime = new Date(end)

        const startHour = startTime.getUTCHours()
        const endHour = endTime.getUTCHours()

        const startMin= startTime.getUTCMinutes()
        const endMin = endTime.getUTCMinutes()
        

        myConsole.log(startHour, startMin)

        // space + (22*space - start*)

        const offset = newElementOffset + 20 + (24-startHour)*40

        return offset

    }

    myConsole.log(datetimeToOffset(hard_start, hard_end))
    
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
                            <div style={{width: "0.5px", backgroundColor: "#7D7D7D", opacity: "50%", height: "30px"}}>
                                
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
                            <div style={{width: "0.5px", backgroundColor: "#7D7D7D", opacity: "50%", height: "30px"}}>
                                
                            </div>
                        </div>
                    ))}
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
           <div style={{position: "relative"}}>
                <div style={{position: "absolute", right: "660px",  minWidth: "40px", backgroundColor: "red"}}>
                    8 
                </div>

                <div style={{position: "relative", right: "620px",  minWidth: "40px", backgroundColor: "red"}}>
                    9 
                </div>
            </div> 
          
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
