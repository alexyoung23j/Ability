import React, { useRef, useEffect, useState, Fragment } from 'react';
import CSS from 'csstype';
import { AnimationType } from 'framer-motion/types/render/utils/types';
const { DateTime } = require("luxon");

interface TimePickerPopupProps {
    isOpen: boolean;
    setIsOpen: any
    timePickerModifying: string
    setEventStart: any 
    setEventEnd: any
}


export default function TimePickerPopup(props: TimePickerPopupProps) {

    const {
        isOpen,
        setIsOpen,
        timePickerModifying,
        setEventStart,
        setEventEnd,
    } = props;


    return (
        isOpen && ( 
            <div
                style={pickerAreaStyles}
                onClick={() => setIsOpen(false)}
            >

            </div>
        )

    )
}

const pickerAreaStyles: CSS.Properties = {
    position: "absolute",
    width: "420px",
    marginTop: "220px", 
    marginLeft: "-25px",
    minHeight: "420px",
    backgroundColor: "rgba(211,211,123,0.6)", 
    zIndex: 100,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}