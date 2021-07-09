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
import CSS from 'csstype'
const {clipboard} = require('electron')
import {stateToHTML} from 'draft-js-export-html';



const { ipcRenderer } = require('electron')
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface TextEditWindow {
    defaultContent: ContentState
    containsStyles: boolean
}


export default function TextEditWindow(props: TextEditWindow) {

    // Load up with the text snippet we passed
    const myContentState = props.defaultContent

    const content = EditorState.createWithContent(myContentState)
    const [editorState, setEditorState] = useState(EditorState.createWithContent(myContentState))
    const [editorStateHidden, setEditorStateHidden] = useState(EditorState.createWithContent(myContentState))

    const editorVisibleRef = useRef<Editor>(null)
    const editorHiddenRef = useRef<Editor>(null)

    // Copies the current content to the clipboard 
    // TODO: Handle styled content 
    useEffect(() => {
        if (editorHiddenRef.current !== null) {
            copyToClipboard()
        }
    })

    function copyToClipboard() {
        var toCopy = content.getCurrentContent().getPlainText()
        clipboard.writeText(toCopy)
    }

    function visibleBlockStyleFn(contentBlock: any) {
        return 'visibleTextSnippetStyle'
    }

    // We have an invisible div that allows us to copy paste using other styles easily
    function hiddenBlockStyleFn(contentBlock: any) {
        return 'hiddenTextSnippetStyle'
    }

    return (
        <div style={textEditWindowStyle}>
            <div>
                <Editor 
                    editorState={content}
                    onChange={setEditorState}
                    readOnly={true}
                    ref={editorVisibleRef}
                    blockStyleFn={visibleBlockStyleFn}
                />
            </div>
            <div style={{visibility: "hidden", position: "absolute"}}>
                <Editor 
                    editorState={content}
                    onChange={setEditorStateHidden}
                    readOnly={true}
                    ref={editorHiddenRef}
                    blockStyleFn={hiddenBlockStyleFn}
                />
            </div>
            
        </div>
    )
}

const textEditWindowStyle: CSS.Properties = {
    marginTop: "10px",
    marginBottom: "10px",
    marginRight: "10px"
}

