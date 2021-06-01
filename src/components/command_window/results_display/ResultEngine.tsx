import CSS from 'csstype'
import React from 'react'
import CalendarView from './calendar_display/CalendarView'
import TextSnippetDropdown from './snippet_display/TextSnippetDropdown'
import { textSnippet } from '../../../types'
import { ContentState } from 'draft-js'



export default function ResultEngine() {

    // dummy calendar index query response
    var calendarResults = {
        "days": [
            {
                "calendar_date": "2021-06-09",
                "hard_start": "2021-06-09T08:00:00Z",
                "hard_end": "2021-06-09T21:00:00Z",
                "free_blocks": [
                    {
                        "start_time": "2021-06-09T12:00:00Z",
                        "end_time": "2021-06-09T13:00:00Z"
                    },
                    {
                        "start_time": "2021-06-09T15:00:00Z",
                        "end_time": "2021-06-09T16:00:00Z"
                    },
                ],
                "events": [
                    {
                        "start_time": "2021-06-09T10:00:00Z",
                        "end_time": "2021-06-09T11:00:00Z",
                        "title": "Event 1",
                        "url": "https://calendar.google.com/calendar/u/4/r/week/2021/6/10",
                        "color": "red"
                    },
                    {
                        "start_time": "2021-06-09T17:00:00Z",
                        "end_time": "2021-06-09T18:00:00Z",
                        "title": "Event 2",
                        "url": "https://calendar.google.com/calendar/u/4/r/week/2021/6/10",
                        "color": "blue"
                    }
                ]
            },
            {
                "calendar_date": "2021-06-10",
                "hard_start": "2021-06-10T08:00:00Z",
                "hard_end": "2021-06-10T21:00:00Z",
                "free_blocks": [
                    {
                        "start_time": "2021-06-10T12:00:00Z",
                        "end_time": "2021-06-10T13:00:00Z"
                    },
                    {
                        "start_time": "2021-06-10T15:00:00Z",
                        "end_time": "2021-06-10T16:00:00Z"
                    },
                ],
                "events": [
                    {
                        "start_time": "2021-06-10T10:00:00Z",
                        "end_time": "2021-06-10T11:00:00Z",
                        "title": "Event 3",
                        "url": "https://calendar.google.com/calendar/u/4/r/week/2021/6/10",
                        "color": "red"
                    },
                    {
                        "start_time": "2021-06-10T17:00:00Z",
                        "end_time": "2021-06-10T18:00:00Z",
                        "title": "Event 4",
                        "url": "https://calendar.google.com/calendar/u/4/r/week/2021/6/10",
                        "color": "blue"
                    }
                ]
            }
        ]
    }


    // Filler for the text snippet (replace with the real values)
    var myContentState1 = ContentState.createFromText("Would any of the following times work for you? \n\nTuesday 3/18 - 4:00 PM, 5:00 PM, or 6:30 PM\n\nI think a one hour meeitng would be great and oh that is just so fucking cool im looking forward to it")
    var myContentState2 = ContentState.createFromText("Would any of the following times work for you?")

    let textSnippetArray: textSnippet[]
    textSnippetArray = [{content: myContentState1, id: "1", title: "email"}, {content: myContentState2, id: "2", title: "slack"}]

    return (
        <div>
            <CalendarView 
                calendar_data={calendarResults}
            />
            <TextSnippetDropdown snippetPayload={textSnippetArray}/>
        </div>
    )
}