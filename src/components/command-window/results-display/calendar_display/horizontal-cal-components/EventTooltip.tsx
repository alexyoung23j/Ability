import React, { useRef, useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip'
import { datetimeToRangeString } from '../../../../util/CalendarUtil';


var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function EventTooltip(props: {events; currentlyHoveredEventIdx, eventTooltipId, setExternalHighlightIdx}) {
    const {events, currentlyHoveredEventIdx, eventTooltipId, setExternalHighlightIdx} = props

    useEffect(() => {
        ReactTooltip.rebuild()
    })

    const currentEvent = events[currentlyHoveredEventIdx]
    let eventsArr = [[currentEvent, currentlyHoveredEventIdx]]
    for (let i = 0; i < events[currentlyHoveredEventIdx].index_of_overlapped_events.length; i++) {
        const hiddenEventIdx = events[currentlyHoveredEventIdx].index_of_overlapped_events[i]
        const hiddenEvent = events[hiddenEventIdx] // The event corresponding to to the index storred in the array of overlaps
        eventsArr.push([hiddenEvent, hiddenEventIdx])
    }


    return (
        <ReactTooltip 
            id={eventTooltipId}
            place='bottom'
            effect="solid"
            backgroundColor="#FFFFFF"
            className="event-tooltip"
            offset={{'left': 30}}
            arrowColor="rgba(0,0,0,0)"
            delayHide={150}
            > 

            {eventsArr.map((event, stupid_idx) => ( 
                <div key={stupid_idx}>
                    <EventDescriptionView 
                        currentEvent={event[0]} 
                        eventIdx={event[1]}
                        setExternalHighlightIdx={setExternalHighlightIdx} 
                    />

                </div>
            ))}
                       
        
            </ReactTooltip>
    )
}

function EventDescriptionView(props: {currentEvent, eventIdx, setExternalHighlightIdx}) {

    const {currentEvent, eventIdx, setExternalHighlightIdx} = props

    const [backgroundColor, setBackgroundColor] = useState('rgba(135, 220, 215, 0)')

    function onMouseEnter() {
        setBackgroundColor('#E9E9E9')
        setExternalHighlightIdx(eventIdx)
    }

    function onMouseLeave() {
        setBackgroundColor('rgba(135, 220, 215, 0)')
        setExternalHighlightIdx(-1)
    }

    function onClick() {
        myConsole.log(eventIdx)
    }

    return ( 
        <div
            style={{backgroundColor: backgroundColor, display: "flex", borderRadius: 6, justifyContent: "flex-start", alignItems: "flex-start", flexDirection: "column", }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        >
            <div style={{marginLeft: "15px", marginRight: "15px", marginTop: "5px", marginBottom: "5px"}}>
                <div style={{display: "flex", justifyContent: "flex-start", alignItems: "flex-start",}}>
                    <div style={{borderRadius: 100, width: "6px", height: "6px", marginTop: "5px", backgroundColor: currentEvent.color, marginRight: "5px"}}>
                    </div>
                    <div
                    className="eventTooltipText"
                    >
                    {currentEvent.title}
                    </div>
                </div>

                <div
                    className="eventTooltipDateText"
                >
                    {datetimeToRangeString(currentEvent.start_time, currentEvent.end_time, false)}
                </div>
            </div>
          
            
        </div>
    )
}
