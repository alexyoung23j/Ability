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
    wasCopied: boolean
}


export default function TextField(props: TextField) {
    // props
    const {snippetPayload, setWasCopied, wasCopied } = props

    // State
    const [curDisplayIdx, setCurDisplayIdx] = useState(0)

    const border = (wasCopied == true) ? "1px solid rgba(135,189,220,0.5)" : ""
    
    return (
        <div style={textFieldStyle}>
            <TabDisplayer 
                snippetPayload={snippetPayload}
                curDisplayIdx={curDisplayIdx}
                setCurDisplayIdx={setCurDisplayIdx}
                setWasCopied={setWasCopied}
            />
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "420px",
                borderRadius: "12px",
                boxShadow: "inset 0 0 20px rgba(0, 0, 0, .05)",
                border: border
            }}>
                <div style={{marginLeft: "5%", marginRight: "7px", marginTop: "10px", marginBottom: "10px", maxHeight: "200px", overflow: "auto"}}>
                    <TextEditWindow 
                        defaultContent={snippetPayload[curDisplayIdx].content}
                        containsStyles={false}
                        wasCopied={wasCopied}
                    />
                </div>
                
            </div>
        </div>
    )
}

function TabDisplayer(props: {snippetPayload, curDisplayIdx, setCurDisplayIdx, setWasCopied}) {

    const {snippetPayload, curDisplayIdx, setCurDisplayIdx, setWasCopied} = props

    return (
        <div style={{display: "flex", flexDirection:"row", alignItems: "flex-end", justifyContent: "center", marginLeft: "14px"}}>
            {snippetPayload.map((snippet, idx) => (
                <div key={idx}>
                    <Tab 
                        highlighted={idx === curDisplayIdx ? true : false}
                        text={snippet.title}
                        onClickHandler={() => { if (idx != curDisplayIdx) {
                            setCurDisplayIdx(idx)
                            setWasCopied(false)
                        }}}
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



