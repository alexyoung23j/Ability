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
}


export default function TextField(props: TextField) {
    // props
    const snippetPayload = props.snippetPayload

    // State
    const [curDisplayIdx, setCurDisplayIdx] = useState(0)

    

    function WindowDisplayer() {
        return (
            <div style={textWindowStyle}>
                <div>
                    <TextEditWindow 
                        defaultContent={snippetPayload[curDisplayIdx].content}
                    />
                </div>
                
            </div>
            
        )
    }

    
    function TabDisplayer() {

        return (
            <div style={{display: "flex", flexDirection:"row", alignItems: "flex-end", justifyContent: "flex-end", marginLeft: "8px"}}>
                {snippetPayload.map((snippet, idx) => (
                    <div key={idx}>
                        <Tab 
                            highlighted={idx === curDisplayIdx ? true : false}
                            text={snippet.title}
                        />
                    </div>
                ))}
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
    justifyContent: "center",
    width: "450px",
    borderRadius: "12px",
    boxShadow: "inset 0 0 40px rgba(0, 0, 0, .05)"
}

