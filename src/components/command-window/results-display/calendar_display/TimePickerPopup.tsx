import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { AnimationType } from 'framer-motion/types/render/utils/types';
const { DateTime } = require("luxon");
import { generatePickerTimeOptions } from '../../../util/CalendarUtil';


var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);



interface TimePickerPopupProps {
    isOpen: boolean;
    setIsOpen: any
    timePickerModifying: string
    setEventStart: any 
    setEventEnd: any
    eventStart: any
    eventEnd: any
}

export default function TimePickerPopup(props: TimePickerPopupProps) {

    const {
        isOpen,
        setIsOpen,
        timePickerModifying,
        eventStart,
        eventEnd,
        setEventStart,
        setEventEnd,
    } = props;

    // Array of time options
    const timeOptions = generatePickerTimeOptions(false, 5)

    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current !== null) {
            scrollRef.current.scrollTo(0, CalculateScroll())
        }
    },  [scrollRef])

    function CalculateScroll() {
        let indexInOptions

        if (timePickerModifying == "start") {
            indexInOptions = (eventStart.minute/5) + eventStart.hour*12
        } else {
            indexInOptions = (eventEnd.minute/5) + eventEnd.hour*12
        }


        return 30*indexInOptions - 15
    }

    return (
            <div
                style={pickerAreaStyles}
                onClick={() => setIsOpen(false)}
            >
                <div
                    style={pickerStyle}
                    ref={scrollRef}
                >
                    {timeOptions.map((option, idx) => (
                        <div key={idx}>
                            <TimeOption 
                                setIsOpen={setIsOpen}
                                option={option}
                                timePickerModifying={timePickerModifying}
                                eventStart={eventStart}
                                eventEnd={eventEnd}
                                setEventStart={setEventStart}
                                setEventEnd={setEventEnd}
                            />
                        </div>
                    ))}

                </div>

            </div>
        

    )
}

interface TimeOptionProps {
    setIsOpen: any
    option: any
    timePickerModifying: string
    setEventStart: any 
    setEventEnd: any
    eventStart: any
    eventEnd: any
}

function TimeOption(props: TimeOptionProps) {
    const {
        setIsOpen,
        option,
        timePickerModifying,
        eventStart,
        eventEnd,
        setEventStart,
        setEventEnd,
    } = props;

    let initialColor
    if (timePickerModifying == "start") {
        initialColor = (option.hour == eventStart.hour && option.minute == eventStart.minute) ? "rgb(125, 189, 220)" : "rgba(172, 170, 170, 1)"
    } else {
        initialColor = (option.hour == eventEnd.hour && option.minute == eventEnd.minute) ? "rgb(125, 189, 220)" : "rgba(172, 170, 170, 1)"
    }


    const [color, setColor] = useState(initialColor)
    function handleClick(event) {
        event.stopPropagation()

        if (timePickerModifying == 'start') {
            let newEventStart = eventStart.set({hour: option.hour, minute: option.minute})
            setEventStart(newEventStart)
        } else {
            
            let newEventEnd = eventEnd.set({hour: option.hour, minute: option.minute})
            if (newEventEnd > eventStart) {
                setEventEnd(newEventEnd)
            }
            
        }

        setIsOpen(false)

    }

    return (
        <div
            className="eventTimePickerTimeOption"
            onClick={(e) => handleClick(e)}
            onMouseEnter={() => setColor("rgb(125, 189, 220)")}
            onMouseLeave={() => {
                // Only change the color if it isnt the selected value
                if (initialColor != "rgb(125, 189, 220)") {
                    setColor("rgba(172, 170, 170, 1)")
                }
                
            }}

            style={{color: color}}
        >
            {option.text}
        </div>
    )

}

const pickerStyle: CSS.Properties = {
    position: "relative",
    boxShadow: '0 0 100px rgba(0,0,0, 0.1)',
    borderRadius: "4px",
    maxWidth: "100px",
    maxHeight: "250px",
    marginLeft: "140px",
    marginTop: "60px",
    backgroundColor: "#FFFFFF", 
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    overflowX: "auto"
}


const pickerAreaStyles: CSS.Properties = {
    position: "absolute",
    width: "420px",
    marginTop: "220px", 
    marginLeft: "-25px",
    minHeight: "420px",
    backgroundColor: "rgba(211,211,123,0.0)", 
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}