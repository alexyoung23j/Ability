import React, { useEffect, useRef, useState } from 'react';
import { EditorState, SelectionState } from 'draft-js';
import CSS from 'csstype';
import { motion, useAnimation } from 'framer-motion';

import TextField from './TextField';
import { TextSnippet } from '../../../../constants/types';
import { TimeZoneData } from '../engines/TextEngine';
import TimeZoneComponent from './TimeZoneComponent';

const { ipcRenderer } = require('electron');
var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface TextSnippetDisplay {
  snippetPayload: TextSnippet[];
  selectedAnyTimeSlots: boolean;
  selectedTimeZone: any;
  setSelectedTimeZone: any;
  timeZoneObjectList: Array<TimeZoneData>;
}

export default function TextSnippetDropdown(props: TextSnippetDisplay) {
  const {
    snippetPayload,
    selectedAnyTimeSlots,
    selectedTimeZone,
    setSelectedTimeZone,
    timeZoneObjectList,
  } = props;

  const [wasCopied, setWasCopied] = useState(false);
  const [copyButtonOpacity, setCopyButtonOpacity] = useState('100%');
  const clipboardAnimationControls = useAnimation();

  function handleCopyClick() {
    clipboardAnimationControls.start({});
    setWasCopied(true);
  }

  useEffect(() => {
    if (wasCopied) {
      setCopyButtonOpacity('70%');
    } else {
      setCopyButtonOpacity('100%');
    }
  }, [wasCopied]);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={SnippetDisplayStyles}>
          <TextField
            snippetPayload={snippetPayload}
            selectedAnyTimeSlots={selectedAnyTimeSlots}
            setWasCopied={setWasCopied}
            wasCopied={wasCopied}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <CopyMessageComponent
            handleCopyClick={handleCopyClick}
            copyButtonOpacity={copyButtonOpacity}
          />
          <TimeZoneComponent
            selectedTimeZone={selectedTimeZone}
            setSelectedTimeZone={setSelectedTimeZone}
            timeZoneObjectList={timeZoneObjectList}
          />
        </div>
      </div>
      <ClipboardCopiedMessage wasCopied={wasCopied} />
    </div>
  );
}

function CopyMessageComponent(props: {
  handleCopyClick: any;
  copyButtonOpacity: string;
}) {
  const { handleCopyClick, copyButtonOpacity } = props;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginTop: '20px',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '35px',
          background:
            'linear-gradient(90deg, rgba(135, 220, 215, 1), rgba(125, 189, 220, 1))',
          borderRadius: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          opacity: copyButtonOpacity,
        }}
        onClick={() => handleCopyClick()}
      >
        <div>📋</div>
        <div className="copyTextButton">copy</div>
      </div>
      <div
        className="textEditButton"
        onClick={() => {}} // TODO: Redirect to settings window with the relevant snippet settings open
        style={{
          marginTop: '10px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: '70%',
          cursor: 'pointer',
        }}
      >
        edit settings
      </div>
    </div>
  );
}

function ClipboardCopiedMessage(props: { wasCopied }) {
  const { wasCopied } = props;

  if (wasCopied) {
    return (
      <motion.div
        animate={{
          scale: [0, 1.2, 1],
          transition: {
            duration: 0.2,
            delay: 0.1,
          },
        }}
        className="clipboardCopiedText"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '35px',
          marginBottom: '5px',
        }}
      >
        {'📋 copied!'}
      </motion.div>
    );
  } else {
    return <div style={{ height: '40px' }}></div>;
  }
}

const SnippetDisplayStyles: CSS.Properties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  marginBottom: '0px',
  marginLeft: '25px',
  marginRight: '25px',
  flexDirection: 'column',
};

const bottomBarStyle: CSS.Properties = {
  display: 'flex',
  marginTop: '20px',
};
