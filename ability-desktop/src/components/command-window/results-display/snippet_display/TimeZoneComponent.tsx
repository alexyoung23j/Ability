import React, { useEffect, useRef, useState } from 'react';
import CSS from 'csstype';
import { TimeZoneData } from '../engines/TextEngine';
import { css } from '@emotion/css';
import { Checkbox } from 'reakit/Checkbox';

export default function TimeZoneComponent(props: {
  selectedTimeZone: TimeZoneData;
  setSelectedTimeZone: any;
  timeZoneObjectList: Array<TimeZoneData>;
}) {
  const { selectedTimeZone, setSelectedTimeZone, timeZoneObjectList } = props;
  const [checked, setChecked] = useState(false);

  const [timeZoneTextColor, setTimeZoneTextColor] = useState('#7D7D7D');
  const [showZonePicker, setShowZonePicker] = useState(false);

  const CheckToggled = () => {
    if (checked) {
      setSelectedTimeZone({ ...selectedTimeZone, timezone_enabled: false });
      setChecked(false);
    } else {
      setSelectedTimeZone({ ...selectedTimeZone, timezone_enabled: true });
      setChecked(true);
    }
  };

  const checkboxStyle = css`
    appearance: none;
    border: 1px solid rgb(125, 189, 220);
    border-radius: 4px;
    outline: none;
    cursor: pointer;
    width: 12px;
    height: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 5px;
    &:after {
      content: '✔';
      display: none;
      color: white;
      font-size: 60%;
    }
    &:checked {
      background-color: rgb(125, 189, 220);
      border: 2px solid rgb(125, 189, 220);
      &:after {
        display: block;
      }
    }
  `;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
      }}
    >
      <div
        style={{
          marginTop: '2px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onMouseEnter={() => setTimeZoneTextColor('rgb(125, 189, 220)')}
        onMouseLeave={() => setTimeZoneTextColor('#7D7D7D')}
        onClick={() => {
          setShowZonePicker(true);
        }}
      >
        <div
          className="eventModalTime"
          style={{
            color: timeZoneTextColor,
            marginRight: '5px',
            marginBottom: '2px',
          }}
        >
          {selectedTimeZone.name}
        </div>
      </div>

      <Checkbox
        checked={checked}
        onChange={CheckToggled}
        className={checkboxStyle}
      />

      {showZonePicker && (
        <TimeZonePicker
          selectedTimeZone={selectedTimeZone}
          setSelectedTimeZone={setSelectedTimeZone}
          setShowZonePicker={setShowZonePicker}
          timeZoneObjectList={timeZoneObjectList}
        />
      )}
    </div>
  );
}

function TimeZonePicker(props: {
  selectedTimeZone: TimeZoneData;
  setSelectedTimeZone: any;
  setShowZonePicker: any;
  timeZoneObjectList: Array<TimeZoneData>;
}) {
  const {
    timeZoneObjectList,
    setShowZonePicker,
    setSelectedTimeZone,
    selectedTimeZone,
  } = props;

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollTo(0, CalculateScroll());
    }
  }, [scrollRef]);

  function CalculateScroll() {
    let indexInOptions;

    for (let i = 0; i < timeZoneObjectList.length; i++) {
      if (timeZoneObjectList[i].name === selectedTimeZone.name) {
        indexInOptions = i;
        break;
      }
    }

    return 30 * indexInOptions - 15;
  }

  return (
    <div style={pickerAreaStyles} onClick={() => setShowZonePicker(false)}>
      <div style={pickerStyle} ref={scrollRef}>
        {timeZoneObjectList.map((zoneObj, idx) => (
          <div key={idx}>
            <TimeZoneOption
              zoneObj={zoneObj}
              selectedTimeZone={selectedTimeZone}
              setSelectedTimeZone={setSelectedTimeZone}
              setShowZonePicker={setShowZonePicker}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeZoneOption(props: {
  zoneObj: TimeZoneData;
  selectedTimeZone: TimeZoneData;
  setSelectedTimeZone: any;
  setShowZonePicker: any;
}) {
  const { zoneObj, selectedTimeZone, setSelectedTimeZone, setShowZonePicker } =
    props;

  let initialColor =
    selectedTimeZone.name === zoneObj.name
      ? 'rgb(125, 189, 220)'
      : 'rgba(172, 170, 170, 1)';

  const [textColor, setTextColor] = useState(initialColor);

  function generateCities() {
    let resultString = '';

    for (let i = 0; i < Math.min(zoneObj.cities.length, 2); i++) {
      resultString += zoneObj.cities[i] + ' - ';
    }

    return resultString.slice(0, resultString.length - 2);
  }

  function handleClick(event) {
    event.stopPropagation();

    if (selectedTimeZone.timezone_enabled === true) {
      setSelectedTimeZone({ ...zoneObj, timezone_enabled: true });
    } else {
      setSelectedTimeZone(zoneObj);
    }

    setShowZonePicker(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      onClick={(e) => handleClick(e)}
      onMouseEnter={() => setTextColor('rgb(125, 189, 220)')}
      onMouseLeave={() => {
        // Only change the color if it isnt the selected value
        if (initialColor != 'rgb(125, 189, 220)') {
          setTextColor('rgba(172, 170, 170, 1)');
        }
      }}
    >
      <div style={{ color: textColor }} className="eventTimePickerTimeOption">
        {zoneObj.name}
      </div>
      <div style={{ color: textColor }} className="timeZonePickerCities">
        {generateCities()}
      </div>
    </div>
  );
}

const pickerStyle: CSS.Properties = {
  position: 'relative',
  boxShadow: '0 0 100px rgba(0,0,0, 0.1)',
  borderRadius: '8px',
  maxWidth: '250px',
  maxHeight: '200px',
  paddingTop: '5px',
  paddingBottom: '5px',
  marginTop: '300px',
  marginLeft: '250px',

  backgroundColor: '#FFFFFF',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexDirection: 'column',
  overflowX: 'auto',
};

const pickerAreaStyles: CSS.Properties = {
  position: 'absolute',
  width: '600px',
  marginLeft: '-425px',
  marginTop: '-150px',
  minHeight: '530px',
  backgroundColor: 'rgba(211,211,123,0)',
  zIndex: 100,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};
