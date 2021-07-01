import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import DatePickerComponent from './DatePickerComponent';


interface EventModalProps {
    isOpen: boolean
}

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function EventModal(props: EventModalProps) {

    const {isOpen} = props

    // State
    const [titleBarColor, setTitleBarColor] = useState("rgba(172, 170, 170, 0.5)")

    const [eventTitle, setEventTitle] = useState("")

    return ( 
        isOpen && ( 
        <div
            style={ModalAreaStyles}
        >
            <div
                style={ModalStyles}
            >
                <div
                    style={{marginTop: "20px"}}
                >
                    <input 
                        className="eventModalTitle" 
                        placeholder="Title.."
                        style={{}}
                        onFocus={() => setTitleBarColor("rgb(125, 189, 220)")}
                        onBlur={() => setTitleBarColor("rgba(172, 170, 170, 0.5)")}
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                    />
                    <div style={{height: "1px", marginLeft: "3px", width: "350px", backgroundColor: titleBarColor}}></div>
                </div>
                <div
                    style={{marginTop: "10px"}}
                >
                    <DatePickerComponent />
                </div>
              
            </div>
        </div>
        )
       
    )
}


const ModalStyles: CSS.Properties = {
    minWidth: "400px",
    minHeight: "300px",
    backgroundColor: "#FFFFFF",
    boxShadow: '0 0 100px rgba(0,0,0, 0.3)',
    borderRadius: "12px",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    flexDirection: "column",
    paddingLeft: "20px"

}

const ModalAreaStyles: CSS.Properties = {
    position: "absolute",
    width: "600px", 
    minHeight: "300px", 
    backgroundColor: "rgba(211,211,211,0.0)", 
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: "20px"
}