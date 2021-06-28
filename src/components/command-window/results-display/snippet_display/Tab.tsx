import CSS from 'csstype'
import React, { useState } from 'react'


interface Tab {
    highlighted: boolean
    text: string
    onClickHandler: (number: number) => void
    index: number
}

export default function Tab(props: Tab) {
    // props
    const {text, highlighted, onClickHandler, index} = props

    const [largeFont, setLargeFont] = useState(false)

    var highlightColor = highlighted === true ? "#E7E7E7" : "#FBFBFB"
    var height = highlighted === true ? "24px" : "20px"
    var fontColor = highlighted === true ? "#87BDDC" : "#7D7D7D"

    var fontSize = (highlighted === true || largeFont === true) ? "12px" : "11px"

    const tabStyle: CSS.Properties = {
        backgroundColor: highlightColor,
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "65px",
        height: height,
        WebkitUserSelect: "none",
    }

    return (
        <div
            style={tabStyle}
            onClick={() => onClickHandler(index)}
            onMouseEnter={() => setLargeFont(true)}
            onMouseLeave={() => setLargeFont(false)}
        >
            <div className="textSnippetTab" style={{color: fontColor, fontSize: fontSize}}>
                {text}
            </div>
        </div>
    )
}