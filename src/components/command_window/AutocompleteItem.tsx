import React, {useState, useRef, useEffect, useLayoutEffect, KeyboardEvent, ChangeEvent, InputHTMLAttributes} from 'react';
import CSS from 'csstype';

import {queryPiece} from "../../types"  

interface AutocompleteItem {
    value: string
    highlight: boolean
    clickHandler: any
    hoverHandler: any
    index: number
}

export default function AutocompleteItem(props: AutocompleteItem) {
    // props
    const value = props.value
    const highlight = props.highlight
    const index = props.index

    // callbacks
    const clickHandler = props.clickHandler
    const hoverHandler = props.hoverHandler
    

    var highlightColor = highlight === true ? "#E9E9E9" : "white"

    const autocompleteItemStyle: CSS.Properties = {
        backgroundColor: highlightColor,
        height: "50px",
        display: "flex",
        justifyContent: "flex-start",
        marginLeft: "34px",
        marginRight: "34px",
        alignItems: "center",
        borderRadius: "10px"
    }

    const autocompleteItemTextStyle: CSS.Properties = {
        marginLeft: "15px",
        fontFamily: "Montserrat",
        fontSize: "20px",
        color: "#7D7D7D",
        fontWeight: "bolder"
    }

    return (
        <div
            style={autocompleteItemStyle}
            onClick={() => clickHandler(index)}
            onMouseEnter={() => hoverHandler(index)}
        >
            <div
                style={autocompleteItemTextStyle}
            >
                {value}
            </div>
        </div>
    )
}