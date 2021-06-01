import React, { useEffect, useRef, useState } from 'react'
import { EditorState, SelectionState, ContentState } from 'draft-js'
import CSS from 'csstype'


import TextEditWindow from "./TextEditWindow"
import { textSnippet } from '../../../types'
import Tab from "./Tab"


const { ipcRenderer } = require('electron')
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface TextField {
    snippetPayload: textSnippet[]
    setToggleHandler: (val: boolean) => void
}


export default function TextField(props: TextField) {
    // props
    const {snippetPayload, setToggleHandler } = props

    // State
    const [curDisplayIdx, setCurDisplayIdx] = useState(0)

    const TabClickHandler = (idx: number) => {
        setCurDisplayIdx(idx)
        setToggleHandler(true)
    }

    useEffect(() => {
        setToggleHandler(true)
    }, [])
    
    function TabDisplayer() {

        return (
            <div style={{display: "flex", flexDirection:"row", alignItems: "flex-end", justifyContent: "center", marginLeft: "14px"}}>
                {snippetPayload.map((snippet, idx) => (
                    <div key={idx}>
                        <Tab 
                            highlighted={idx === curDisplayIdx ? true : false}
                            text={snippet.title}
                            onClickHandler={TabClickHandler}
                            index={idx}
                        />
                    </div>
                ))}
            </div>
        )
    }

    function WindowDisplayer() {
        // TODO: Add in the handling for styled content vs unstyle content
        return (
            <div style={textWindowStyle}>
                <div style={{marginLeft: "5%"}}>
                    <TextEditWindow 
                        defaultContent={snippetPayload[curDisplayIdx].content}
                        containsStyles={false}
                    />
                </div>
                
            </div>
            
        )
    }

    return (
        <div style={textFieldStyle}>
            <TabDisplayer />
            <WindowDisplayer />
        </div>
    )
}

const textFieldStyle: CSS.Properties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start"
}

const textWindowStyle: CSS.Properties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "450px",
    borderRadius: "12px",
    boxShadow: "inset 0 0 40px rgba(0, 0, 0, .05)"
}

