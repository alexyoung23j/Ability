import CSS from 'csstype'
import React from 'react'


interface Tab {
    highlighted: boolean
    text: string
}

export default function Tab(props: Tab) {
    // props
    const text = props.text
    const highlighted = props.highlighted

    var highlightColor = highlighted === true ? "#FBFBFB" : "#E7E7E7"
    var height = highlighted === true ? "20px" : "15px"

    const tabStyle: CSS.Properties = {
        backgroundColor: highlightColor,
        borderRadius: "2px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "40px",
        height: height,
    }

    return (
        <div
            style={tabStyle}
        >
            <div>
                {text}
            </div>
        </div>
    )
}