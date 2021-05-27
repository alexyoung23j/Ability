import Editor from '@draft-js-plugins/editor'
import CSS from 'csstype'
import { EditorState, SelectionState } from 'draft-js'
import React, { useEffect, useRef, useState } from 'react'
const {clipboard} = require('electron')
import {stateToHTML} from 'draft-js-export-html';



var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function TextSnippetDisplayDummy() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [copyText, setCopyText] = useState('')
  const [copied, setCopied] = useState(false)

  const snippetRef = useRef<Editor>(null)

  function copyToClipboard() {
    if (snippetRef.current !== null) {
      snippetRef.current.focus()
    }

    const currentContent = editorState.getCurrentContent()
    const firstBlock = currentContent.getBlockMap().first()
    const lastBlock = currentContent.getBlockMap().last()
    const firstBlockKey = firstBlock.getKey()
    const lastBlockKey = lastBlock.getKey()
    const lengthOfLastBlock = lastBlock.getLength()

    const selection = new SelectionState({
      anchorKey: firstBlockKey,
      anchorOffset: 0,
      focusKey: lastBlockKey,
      focusOffset: lengthOfLastBlock,
    })

    setEditorState(EditorState.forceSelection(editorState, selection))
    setCopied(true)
    myConsole.log("wtf")

    
  }

  useEffect(() => {
    document.execCommand('copy')
    var toCopy = editorState.getCurrentContent()
    let htmlState = stateToHTML(toCopy)
    clipboard.writeHTML(htmlState)
    if (snippetRef.current !== null && copied) {
      //snippetRef.current.blur()
      setCopied(false)
    }
  }, [editorState])

  function copyToClipboard2() {
    var toCopy = editorState.getCurrentContent()
    let htmlState = stateToHTML(toCopy)
    clipboard.writeHTML(htmlState)
  }

  function myBlockStyleFn(contentBlock: any) {
    const type = contentBlock.getType()
    return 'textSnippetStyle'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        blockStyleFn={myBlockStyleFn}
        ref={snippetRef}
      />
      <button onClick={copyToClipboard2}>copy</button>
    </div>
  )
}

const otherStyle: CSS.Properties = {
  fontWeight: 'bold',
  fontSize: '12',
  color: '#87DCD7',
}
