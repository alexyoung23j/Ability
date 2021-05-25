import React, { useEffect, useRef, useState } from 'react'
import {
    DraftHandleValue,
    EditorState,
    getDefaultKeyBinding,
    Modifier,
    SelectionState,
    ContentState
  } from 'draft-js'
  import Editor from '@draft-js-plugins/editor'


const { ipcRenderer } = require('electron')
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface TextEditWindow {
    defaultContent: ContentState
}


export default function TextEditWindow(props: TextEditWindow) {

    // Load up with the text snippet we passed
    const myContentState = props.defaultContent
    const [editorState, setEditorState] = useState(EditorState.createWithContent(myContentState))

    const editorRef = useRef<Editor>(null)

    return (
        <div>
            <Editor 
                editorState={editorState}
                onChange={setEditorState}
                readOnly={true}
                ref={editorRef}
            />
        </div>
    )
}