import React, { useEffect, useRef, useState } from 'react'
import { EditorState, SelectionState } from 'draft-js'
import CSS from 'csstype'


import TextField from "./TextField"
import { textSnippet } from '../../types'


const { ipcRenderer } = require('electron')
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface TextSnippetDisplay {
    snippetPayload: textSnippet[]
}


export default function TextSnippetDisplay(props: TextSnippetDisplay) {

    const snippetPayload = props.snippetPayload


    return (
        <div style={SnippetDisplayStyles}>
            <TextField 
                snippetPayload={snippetPayload}
            />
        </div>
    )
}

const SnippetDisplayStyles: CSS.Properties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "25px"
}
