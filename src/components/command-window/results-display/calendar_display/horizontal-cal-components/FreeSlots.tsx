import React, { useRef, useEffect, useState } from 'react';
import CSS from 'csstype';
import ScrollContainer from 'react-indiana-drag-scroll';
import useDragScroll from 'use-drag-scroll';
import ReactDOM from 'react-dom';
import ReactTooltip from 'react-tooltip'
import { datetimeToOffset } from '../../../../util/CalendarUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);



export default function FreeSlots(props: { free_blocks; day_idx; ignoreHandler }) {
    const { free_blocks, day_idx, ignoreHandler } = props;
  
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
              />
              
            </div>
          ))
        )}
        
      </div>
    );
}
  
function Slot(props: { event; slot_idx; block_idx; day_idx; ignoreHandler }) {
  const { event, slot_idx, block_idx, day_idx, ignoreHandler } = props;

  const [isActive, setIsActive] = useState(true);
  const [color, setColor] = useState('#C1ECEA');
  const [zIndex, setZIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

return (
    <div
    style={{
        position: 'absolute',
        right: datetimeToOffset(event.start_time, event.end_time, 0)[0],
        width: datetimeToOffset(event.start_time, event.end_time, 1)[1],
        minHeight: '20px',
        borderRadius: 5,
        borderColor: 'black',
        backgroundColor: color,
        cursor: 'pointer',
        zIndex: zIndex,
    }}
    onClick={() => {
        if (isActive) {
        setColor('rgba(135, 220, 215, 0)');
        setIsActive(false);
        ignoreHandler([day_idx, block_idx, slot_idx], 'remove');
        } else {
        setColor('rgba(135, 220, 215, 1)');
        setIsActive(true);
        ignoreHandler([day_idx, block_idx, slot_idx], 'add-back');
        }
    }}
    onMouseEnter={() => {
        if (isActive) {
        setColor('rgba(135, 220, 215, 1)');
        } else {
        setColor('rgba(125, 125, 125, .3)');
        }
        setShowPopup(true);
        setZIndex(10);
    }}
    onMouseLeave={() => {
        if (isActive) {
        setColor('#C1ECEA');
        } else {
        setColor('rgba(135, 220, 215, 0)');
        }
        setZIndex(0);
        setShowPopup(false);
    }}
    data-tip
    data-for={"slot-tip"}
    >
    <ReactTooltip id="slot-tip">
        <div>
        {slot_idx}
        </div>
    </ReactTooltip>
    </div>
);
}