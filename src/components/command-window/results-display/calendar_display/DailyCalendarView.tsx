import React, { useState, useEffect } from 'react';

interface DailyCalendarViewProps {
  calendar_data: any;
  selected_day_idx: number;
}

export default function DailyCalendarView(props: DailyCalendarViewProps) {
  const { calendar_data, selected_day_idx } = props;

  return <div>{calendar_data.days[selected_day_idx].calendar_date}</div>;
}
