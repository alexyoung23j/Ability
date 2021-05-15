import Editor from '@draft-js-plugins/editor'
import CSS from 'csstype'
import { EditorState, SelectionState } from 'draft-js'
import React, { useEffect, useRef, useState } from 'react'

export default function TextSnippetDisplay() {
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
  }

  useEffect(() => {
    document.execCommand('copy')
    if (snippetRef.current !== null && copied) {
      snippetRef.current.blur()
      setCopied(false)
    }
  }, [editorState])

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
      <button onClick={copyToClipboard}>copy</button>
    </div>
  )
}

const otherStyle: CSS.Properties = {
  fontWeight: 'bold',
  fontSize: '12',
  color: '#87DCD7',
}
