import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip'
import { datetimeToOffset } from '../../../../util/CalendarUtil';
import Popup from 'reactjs-popup';
const plusIcon = require('/src/content/svg/Plus.svg');
const minusIcon = require('/src/content/svg/Minus.svg');
const { DateTime } = require("luxon");


var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

interface FreeSlotsProps {
  free_blocks: Array<any>
  day_idx: number;
  ignoreHandler: any;
  textSnippetOpen: boolean;
  ignoredSlots: Array<any>
  launchModalFromFreeSlot: any
}


function checkIfIgnored(block_idx, slot_idx, ignoredSlots) {
  for (const slot of ignoredSlots) {
    if (slot[0] === block_idx && slot[1] === slot_idx) {
      return true
    }
  }

  return false
}

export default function FreeSlots(props: FreeSlotsProps) {
    const { free_blocks, day_idx, ignoreHandler, textSnippetOpen, ignoredSlots, launchModalFromFreeSlot } = props;
  
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
          block.free_slots.map((slot, slot_idx) => (
            <div key={slot_idx} style={{ display: 'flex', justifyContent: "center", alignItems: "center" }}>
              <Slot
                slot={slot}
                slot_idx={slot_idx}
                block_idx={block_idx}
                day_idx={day_idx}
                ignoreHandler={ignoreHandler}
                textSnippetOpen={textSnippetOpen}
                slotIsIgnored={checkIfIgnored(block_idx, slot_idx, ignoredSlots)}
                launchModalFromFreeSlot={launchModalFromFreeSlot}
              />
              
            </div>
          ))
        )}
        
      </div>
    );
}

interface FreeSlotProps {
  slot: any;
  slot_idx: number;
  block_idx: number;
  day_idx: number;
  ignoreHandler: any;
  textSnippetOpen: boolean;
  slotIsIgnored: boolean
  launchModalFromFreeSlot: any
}
  
function Slot(props: FreeSlotProps) {
  const { slot, slot_idx, block_idx, day_idx, ignoreHandler, textSnippetOpen, slotIsIgnored, launchModalFromFreeSlot} = props;

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
      const newEventStart = DateTime.fromISO(slot.start_time)
      const newEventEnd = DateTime.fromISO(slot.end_time)
      launchModalFromFreeSlot(newEventStart, newEventEnd)
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
        right: datetimeToOffset(slot.start_time, slot.end_time, 0)[0],
        width: datetimeToOffset(slot.start_time, slot.end_time, 0)[1],
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

    {showPlus && (<img src={plusIcon} style={{height: '10px'}}/>)}
    {showMinus && (<img src={minusIcon} style={{height: '2px'}}/>)}
    
    </div>
);
}