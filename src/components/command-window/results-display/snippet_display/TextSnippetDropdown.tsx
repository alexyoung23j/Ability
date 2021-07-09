import React, { useEffect, useRef, useState } from 'react';
import { EditorState, SelectionState } from 'draft-js';
import CSS from 'csstype';
import { motion, useAnimation } from 'framer-motion';

import TextField from './TextField';
import { textSnippet } from '../../../../types';

const { ipcRenderer } = require('electron');
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface TextSnippetDisplay {
  snippetPayload: textSnippet[];
}

export default function TextSnippetDropdown(props: TextSnippetDisplay) {
  const snippetPayload = props.snippetPayload;

  const [wasCopied, setWasCopied] = useState(true);
  const clipboardAnimationControls = useAnimation();

  useEffect(() => {
    if (wasCopied) {
      clipboardAnimationControls.start({});
      setWasCopied(false);
    }
  }, [wasCopied]);

  function ClipboardCopiedMessage() {
    return (
      <motion.div
        animate={{
          scale: [0, 1.2, 1],
          opacity: [0, 1],
          transition: {
            duration: 0.2,
            delay: 0.1,
            type: 'spring',
          },
        }}
        className="clipboardCopiedText"
      >
        {'📋 copied to clipboard'}
      </motion.div>
    );
  }

  return (
    <div style={SnippetDisplayStyles}>
      <TextField
        snippetPayload={snippetPayload}
        setWasCopied={setWasCopied}
      />
      <div style={bottomBarStyle}>
        <ClipboardCopiedMessage />
      </div>
    </div>
  );
}

const SnippetDisplayStyles: CSS.Properties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  marginBottom: '25px',
  marginLeft: "25px",
  marginRight: "25px",
  flexDirection: 'column',
};

const bottomBarStyle: CSS.Properties = {
  display: 'flex',
  marginTop: '20px',
};
