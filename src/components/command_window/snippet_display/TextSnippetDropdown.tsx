import React, { useEffect, useRef, useState } from 'react'
import { EditorState, SelectionState } from 'draft-js'
import CSS from 'csstype'
import { motion, useAnimation } from "framer-motion"


import TextField from "./TextField"
import { textSnippet } from '../../../types'


const { ipcRenderer } = require('electron')
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface TextSnippetDisplay {
    snippetPayload: textSnippet[]
}


export default function TextSnippetDropdown(props: TextSnippetDisplay) {

    const snippetPayload = props.snippetPayload

    const [wasToggled, setWasToggled] = useState(true)
    const clipboardAnimationControls = useAnimation()

    const setToggleHandler = (val: boolean) => {
        setWasToggled(val)
    }

    
    

    useEffect(() => {
        if (wasToggled) {
            clipboardAnimationControls.start({})
            setWasToggled(false)
        }
    }, [wasToggled])

    function ClipboardCopiedMessage() {
        return (
            <motion.div
                animate={{
                  scale: [0,1.2,1],
                  opacity: [0,1] ,
                  transition: {
                      duration: .2,
                      delay: .1,
                      type: "spring"
                  } 
                }}
                className="clipboardCopiedText"
            >
                {'📋 copied to clipboard'}
            </motion.div>
        )
    }


    return (
        <div style={SnippetDisplayStyles}>
            <TextField 
                snippetPayload={snippetPayload}
                setToggleHandler={setToggleHandler}
            />
            <div
                style={bottomBarStyle}
            >
                <ClipboardCopiedMessage />
            </div>
        </div>
    )
}

const SnippetDisplayStyles: CSS.Properties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "25px",
    flexDirection: "column"
}

const bottomBarStyle: CSS.Properties = {
    display: "flex",
    marginTop: "20px"
}
