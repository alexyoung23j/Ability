import React, { useEffect, useRef, useState } from 'react'
import { EditorState, SelectionState, ContentState } from 'draft-js'
import CSS from 'csstype'


import TextEditWindow from "./TextEditWindow"
import { textSnippet } from '../../../../types'
import Tab from "./Tab"


const { ipcRenderer } = require('electron')
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface TextField {
    snippetPayload: textSnippet[]
    setWasCopied: any
}


export default function TextField(props: TextField) {
    // props
    const {snippetPayload, setWasCopied } = props

    // State
    const [curDisplayIdx, setCurDisplayIdx] = useState(0)
    
    return (
        <div style={textFieldStyle}>
            <TabDisplayer 
                snippetPayload={snippetPayload}
                curDisplayIdx={curDisplayIdx}
                setCurDisplayIdx={setCurDisplayIdx}
            />
            <div style={textWindowStyle}>
                <div style={{marginLeft: "5%", marginRight: "7px", marginTop: "10px", marginBottom: "10px", maxHeight: "200px", overflow: "auto"}}>
                    <TextEditWindow 
                        defaultContent={snippetPayload[curDisplayIdx].content}
                        containsStyles={false}
                    />
                </div>
                
            </div>
        </div>
    )
}

function TabDisplayer(props: {snippetPayload, curDisplayIdx, setCurDisplayIdx}) {

    const {snippetPayload, curDisplayIdx, setCurDisplayIdx} = props

    return (
        <div style={{display: "flex", flexDirection:"row", alignItems: "flex-end", justifyContent: "center", marginLeft: "14px"}}>
            {snippetPayload.map((snippet, idx) => (
                <div key={idx}>
                    <Tab 
                        highlighted={idx === curDisplayIdx ? true : false}
                        text={snippet.title}
                        onClickHandler={() => setCurDisplayIdx(idx)}
                        index={idx}
                    />
                </div>
            ))}
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
    width: "420px",
    borderRadius: "12px",
    boxShadow: "inset 0 0 20px rgba(0, 0, 0, .05)"
}

