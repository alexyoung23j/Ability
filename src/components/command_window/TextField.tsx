import React, { useEffect, useRef, useState } from 'react'
import { EditorState, SelectionState, ContentState } from 'draft-js'
import CSS from 'csstype'


import TextEditWindow from "./TextEditWindow"
import { textSnippet } from '../../types'


const { ipcRenderer } = require('electron')
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface TextField {
    snippetPayload: textSnippet[]
}


export default function TextField(props: TextField) {
    // props
    const snippetPayload = props.snippetPayload
    

    function WindowDisplayer() {
        return (
            <TextEditWindow 
                defaultContent={snippetPayload[0].content}
            />
        )
    }

    function TabDisplayer() {

        return (
            <div></div>
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
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
}


