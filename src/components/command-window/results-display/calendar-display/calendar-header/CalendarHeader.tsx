import React from 'react';
const leftArrow = require('/src/content/svg/LeftArrow.svg');
const rightArrow = require('/src/content/svg/RightArrow.svg');
const dropdownArrowNormal = require('/src/content/svg/DropdownArrowNormal.svg');
const dropdownArrowHighlight = require('/src/content/svg/DropdownArrowHighlight.svg');

const { DateTime } = require('luxon');

interface CalendarHeaderProps {
  calendar_data: any; // TODO: Make the result data into a type when its all finalized
  showButtons: boolean;
  calendarPickerLaunched: boolean;
  setCalendarPickerLaunched: any;
}

export default function CalendarHeader(props: CalendarHeaderProps) {
  const {
    calendar_data,
    showButtons,
    calendarPickerLaunched,
    setCalendarPickerLaunched,
  } = props;

  // Date Stuff
  let start_day = DateTime.fromISO(calendar_data.days[0].calendar_date);
  let end_day = DateTime.fromISO(
    calendar_data.days[calendar_data.days.length - 1].calendar_date
  );
  const StartString = start_day.monthLong + ' ' + start_day.day;
  let EndString = '';

  if (calendar_data.days.length > 1) {
    if (end_day.month == start_day.month) {
      EndString = '  -  ' + end_day.day;
    } else {
      EndString = '  -  ' + end_day.monthLong + ' ' + end_day.day;
    }
  }

  const FullText = StartString + EndString;
  const YearText = end_day.year;

  return (
    <div
      style={{
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ShowCalendarsButton
        calendarPickerLaunched={calendarPickerLaunched}
        setCalendarPickerLaunched={setCalendarPickerLaunched}
      />
      {showButtons && (
        <div
          style={{ marginRight: '25px', cursor: 'pointer' }}
          onClick={() => {}} // TODO: Add handling for updating the days via click
        >
          <img src={leftArrow} style={{ height: '10px', width: '10px' }} />
        </div>
      )}
      <div className="calendarHeaderText">{FullText}</div>
      {showButtons && (
        <div style={{ marginLeft: '25px', cursor: 'pointer' }}>
          <img src={rightArrow} style={{ height: '10px', width: '10px' }} />
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <div
          style={{ position: 'absolute', top: '-10px', left: '150px' }}
          className="calendarHeaderText"
        >
          {YearText}
        </div>
      </div>
    </div>
  );
}

// The plan: We will have a button here that triggers the showing of a tooltip. This tooltip is rendered in Calendar View
// Selecting/deselecting calendars in the tooltip will update a list of "allowed" calendars that gets passed into calendar body
// This list will be used to filter out events before they are passed into horizontal calendars and also will be used to define the default
// calendar that the event modal will show for new events
// This "alowed" list also is initially fetched from context? and updates to the list will get pushed to context. However, these updates to context
//dont have a direct implication the current component lifecycle, only matters for next time we open the calendar

function ShowCalendarsButton(props: {
  calendarPickerLaunched: boolean;
  setCalendarPickerLaunched: any;
}) {
  const { calendarPickerLaunched, setCalendarPickerLaunched } = props;
  const className =
    calendarPickerLaunched === true
      ? 'launchTextEngineTextLaunched'
      : 'launchTextEngineTextStandard';

  const arrowToDisplay =
    calendarPickerLaunched === true
      ? dropdownArrowHighlight
      : dropdownArrowNormal;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <div
        onClick={() => setCalendarPickerLaunched(!calendarPickerLaunched)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          right: '90px',
        }}
      >
        <img src={arrowToDisplay} style={{ height: '8px', width: '8px' }} />
        <div
          style={{ marginLeft: '10px', marginRight: '10px' }}
          className={className}
        >
          calendars
        </div>
      </div>
    </div>
  );
}
