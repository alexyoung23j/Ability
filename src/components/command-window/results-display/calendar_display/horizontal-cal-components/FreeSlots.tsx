import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import ScrollContainer from 'react-indiana-drag-scroll';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip'
import { datetimeToOffset } from '../../../../util/CalendarUtil';
import Popup from 'reactjs-popup';
const plusIcon = require('/src/content/svg/Plus.svg');
const minusIcon = require('/src/content/svg/Minus.svg');



var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


function checkIfIgnored(block_idx, slot_idx, ignoredSlots) {
  for (const slot of ignoredSlots) {
    if (slot[0] === block_idx && slot[1] === slot_idx) {
      return true
    }
  }

  return false
}

export default function FreeSlots(props: { free_blocks; day_idx; ignoreHandler; textSnippetOpen; ignoredSlots }) {
    const { free_blocks, day_idx, ignoreHandler, textSnippetOpen, ignoredSlots } = props;
  
    useEffect(() => {
      ReactTooltip.rebuild()
    })
  
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '15px',
          flexDirection: 'row',
        }}
      >
        {free_blocks.map((block, block_idx) =>
          block.free_slots.map((event, slot_idx) => (
            <div key={slot_idx} style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
              <Slot
                event={event}
                slot_idx={slot_idx}
                block_idx={block_idx}
                day_idx={day_idx}
                ignoreHandler={ignoreHandler}
                textSnippetOpen={textSnippetOpen}
                slotIsIgnored={checkIfIgnored(block_idx, slot_idx, ignoredSlots)}
              />
              
            </div>
          ))
        )}
        
      </div>
    );
}
  
function Slot(props: { event; slot_idx; block_idx; day_idx; ignoreHandler; textSnippetOpen; slotIsIgnored }) {
  const { event, slot_idx, block_idx, day_idx, ignoreHandler, textSnippetOpen, slotIsIgnored} = props;

  let initialColor

  if (textSnippetOpen) {
    initialColor = slotIsIgnored === false ? 'rgba(135, 220, 215, 1)' : 'rgba(135, 220, 215, 0)'
  } else {
    initialColor = 'rgba(135, 220, 215, 0)'
  }

  const [isActive, setIsActive] = useState(!slotIsIgnored);
  const [color, setColor] = useState(initialColor);
  const [zIndex, setZIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showPlus, setShowPlus] = useState(false)
  const [showMinus, setShowMinus] = useState(false)

  useEffect(() => {
    setColor(initialColor)
  }, [textSnippetOpen])

  function handleClick() {
    if (textSnippetOpen) {
      if (isActive) {
        setColor('rgba(135, 220, 215, 0)');
        setIsActive(false);
        ignoreHandler([day_idx, block_idx, slot_idx], 'remove');
        setShowMinus(false)
      } else {
        setColor('rgba(135, 220, 215, 1)');
        setIsActive(true);
        ignoreHandler([day_idx, block_idx, slot_idx], 'add-back');
        setShowPlus(false)
      }
      
    } else {
      // launch create event modal
    }
  }

  function handleMouseEnter() {
    if (textSnippetOpen) {
      if (isActive) {
        setColor('rgba(135, 220, 215, .8)');
        setShowMinus(true)
      } else {
        setColor('rgba(125, 125, 125, .3)');
        setShowPlus(true)
      }
      setShowPopup(true);
      setZIndex(10);
    } else {
      setColor('rgba(125, 125, 125, .3)');
      setShowPlus(true)
    }
  }

  function handleMouseLeave() {
    if(textSnippetOpen) {
      if (isActive) {
        setColor('rgba(135, 220, 215, 1)');
        setShowMinus(false)
      } else {
        setColor('rgba(135, 220, 215, 0)');
        setShowPlus(false)
      }
        setZIndex(0);
        setShowPopup(false);
    } else {
      setColor('rgba(135, 220, 215, 0)');
      setShowPlus(false)
    }
  }

return (
    <div
    style={{
        position: 'absolute',
        right: datetimeToOffset(event.start_time, event.end_time, 0)[0],
        width: datetimeToOffset(event.start_time, event.end_time, 0)[1],
        minHeight: '20px',
        borderRadius: 3,
        borderColor: 'black',
        backgroundColor: color,
        cursor: 'pointer',
        zIndex: zIndex,
        display: "flex",
        justifyContent: "center", 
        alignItems: "center"
    }}
    onClick={() => {handleClick()}}
    onMouseEnter={() => {handleMouseEnter()}}
    onMouseLeave={() => {handleMouseLeave()}}
    data-tip
    data-for={"slot-tip"}
    >
   {/*  <ReactTooltip id="slot-tip">
        <div>
        {slot_idx}
        </div>
    </ReactTooltip> */}
    {showPlus && (<img src={plusIcon} style={{height: '8px'}}/>)}
    {showMinus && (<img src={minusIcon} style={{height: '1px'}}/>)}
    
    </div>
);
}