import CSS from 'csstype'
import React, { useState, useEffect } from 'react'


interface Tab {
    highlighted: boolean
    text: string
    onClickHandler: (number: number) => void
    index: number
}

export default function Tab(props: Tab) {
    // props
    const {text, highlighted, onClickHandler, index} = props

    var borderColor = highlighted === true ? "1px solid rgba(135,189,220,0.5)" : "0px"
    var initialFontColor = highlighted === true ? "#87BDDC" : "#7D7D7D"
    const initialClass = highlighted === true ? "textSnippetTabLaunched" : "textSnippetTabStandard"

    const [className, setClassName] = useState(initialClass)

    useEffect(() => {
        setClassName(initialClass)
    }, [highlighted])
    
    const tabStyle: CSS.Properties = {
        backgroundColor: "#FBFBFB",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "65px",
        height: "20px",
        WebkitUserSelect: "none",
        borderTop: borderColor,
        borderLeft: borderColor,
        borderRight: borderColor
    }

    return (
        <div
            style={tabStyle}
            onClick={() => onClickHandler(index)}
            onMouseEnter={() => setClassName("textSnippetTabLaunched")}
            onMouseLeave={() => setClassName(initialClass)}
        >
            <div className={className} style={{fontSize: "12px"}}>
                {text}
            </div>
        </div>
    )
}