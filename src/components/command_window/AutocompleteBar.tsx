import React, {useState, useRef, useEffect, useLayoutEffect, KeyboardEvent, ChangeEvent, InputHTMLAttributes} from 'react';
import CSS from 'csstype';
import AutocompleteItem from "./AutocompleteItem"

import {queryPiece} from "../../types"  



interface AutocompleteBar {
    validAutocompletes: queryPiece[]
    highlightedIdx: number
    autocompleteInProgress: boolean
    clickHandler: any
    hoverHandler: any
}


export default function AutocompleteBar(props: AutocompleteBar) {
    // props
    const validAutocompletes = props.validAutocompletes
    const highlightedIdx = props.highlightedIdx
    const autocompleteInProgress = props.autocompleteInProgress

    // Callbacks 
    const clickHandler = props.clickHandler
    const hoverHandler = props.hoverHandler

    if (autocompleteInProgress && validAutocompletes.length > 0) {
        return (
            <div
                style={autocompleteStyle}
            >
                {validAutocompletes.map((piece, idx) => 
                    <div key={idx}>
                        <AutocompleteItem 
                                value={piece.value} 
                                highlight={idx === highlightedIdx ? true : false}
                                clickHandler={clickHandler}
                                hoverHandler={hoverHandler}
                                index={idx}
                            />
                    </div>
                            
                )}
            </div>
        )
    } 
    else {
        return (
            <div></div>
        )
    }

}

const autocompleteStyle: CSS.Properties ={
    marginBottom: "8px",
    marginTop: "8px"
}

