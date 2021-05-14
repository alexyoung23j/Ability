import React, {useState, useRef, useEffect, useLayoutEffect, KeyboardEvent, } from 'react';
import CSS from 'csstype';
import {EditorState, getDefaultKeyBinding, DraftHandleValue, Modifier, SelectionState, } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import '../../css/EditorComponent.css'
import {OrderedSet} from 'immutable'
import {queryPiece} from "../../types"  
//import enterIcon from  "../../content/svg/enterIcon.svg"

// Interface for CommandLine 
interface CommandLine {
    // state props
    queryPiecePositions: number[]
    autocompleteInProgress: boolean
    finalQueryLaunched: boolean
    autocompleteItemClicked: boolean
    currentQueryFragment: string
    currentAutocomplete: any | queryPiece
    queryPieces: queryPiece[]

    // callback function props
    currentQueryFragmentHandler: any
    finalQueryLaunchedHandler: any
    addToQueryPiecePositionsHandler: any
    removeFromQueryPiecePositionsHandler: any
    selectedIdxHandler: any
    autocompleteItemClickedHandler: any
}


export default function CommandLine(props: CommandLine) {
    // Props
    const queryPiecePositions = props.queryPiecePositions
    const autocompleteInProgress = props.autocompleteInProgress
    const finalQueryLaunched = props.finalQueryLaunched
    const autocompleteItemClicked = props.autocompleteItemClicked
    const currentQueryFragment = props.currentQueryFragment
    const currentAutocomplete = props.currentAutocomplete
    const queryPieces = props.queryPieces

    // Callbacks to update props
    const currentQueryFragmentHandler = props.currentQueryFragmentHandler
    const finalQueryLaunchedHandler = props.finalQueryLaunchedHandler
    const addToQueryPiecePositionsHandler = props.addToQueryPiecePositionsHandler
    const removeFromQueryPiecePositionsHandler = props.removeFromQueryPiecePositionsHandler
    const selectedIdxHandler = props.selectedIdxHandler
    const autocompleteItemClickedHandler = props.autocompleteItemClickedHandler
    
    
    // State
    const [editorState, setEditorState] = useState(EditorState.createEmpty())
    const [updateQueryPiecePositions, setUpdateQueryPiecePositions] = useState(false)
    const [updateCurrentQueryFragment, setUpdateCurrentQueryFragment] = useState(false)

    // Refs
    const commandRef = useRef<Editor>(null);

    // Styling objects 
    const styleMap = {
        'WHEN-MODIFIER': whenModifierStyles,
        'PREPOSITION': prepositionsStyles
    }


    //-------------------------- FOCUS HANDLERS -----------------------//

    // Bring the div into focus immediately
    useLayoutEffect(() => {
        focusCommandLine()
    }, [commandRef])

    const focusCommandLine = () => {
        if (null !== commandRef.current) {
            commandRef.current.focus();
        }
    }

    // Turn focus off when the finalQueryLaunched is true
    useEffect(() => {
        if (finalQueryLaunched === true && null !== commandRef.current) {
            commandRef.current.blur();
        }
    }, [finalQueryLaunched])

    const onFocusHandler = () => {
        finalQueryLaunchedHandler(false)
    }

    // returns which queryPiece (0 indexed) the focus is currently within.
    function focusLocation() {
        const focusIdx = editorState.getSelection().getFocusOffset()
        const currentText = editorState.getCurrentContent().getLastBlock().getText()

        if (focusIdx === currentText.length) {
            return -1 // indicating we are not in any query piece, we are at the most updated location
        } 
        if (queryPiecePositions.length === 1) {
            return -1
        }
        var i = 1;
        while (i < queryPiecePositions.length) {
            const low = queryPiecePositions[i-1];
            const high = queryPiecePositions[i];

            if (focusIdx >= low && focusIdx <= high){
                return i-1
            }
            i++
        }
        return 0
    }

    
    //----------------------- USE-EFFECT METHODS ---------------------------// 
    // These methods are needed to avoid timing issues with state updates

    // Handles queryPiece and queryPiecePosition updates 
    useEffect(() => {
        if (updateQueryPiecePositions === true) {
            // Update queryPiecePositions
            updateQueryPieces()
            
            // set update listener to false
            setUpdateQueryPiecePositions(false)

            // Add a space that is not a real space 
            const newEditorState = handleSpaceBar()
            setEditorState(newEditorState)
        }
    }, [editorState])

    // Handles normal typing 
    useEffect(() => {
        if (updateCurrentQueryFragment === true) {
            handleNormalTyping()
        }
    }, [editorState])

    useEffect(() => {
        if (autocompleteItemClicked === true) {
            performAutocompletion()
            autocompleteItemClickedHandler(false)
        }
    }, [autocompleteItemClicked])

    //----------------------- HELPER METHODS ---------------------------// 
    // Small methods to handle small details of implementation

    function performAutocompletion() {
        const newEditorState = handleAutocomplete()
        setEditorState(newEditorState)

        // Update state variable to trigger updateQueryPieces() to ensure we don't miss the editorState change 
        setUpdateQueryPiecePositions(true)

        // Autocomplete Is Ended, set it to False
        currentQueryFragmentHandler('')

        EditorState.moveFocusToEnd(editorState)
    }

    // Function to update the queryPieces state in our parent. Called by a Use-Effect Method
    function updateQueryPieces() {
        const currentContentBlock = editorState.getCurrentContent().getLastBlock()
        const updatedText = currentContentBlock.getText()

        const focusPiece = focusLocation()

        addToQueryPiecePositionsHandler(focusPiece, updatedText.length+1)
    }

    // Updates the currentQueryFragment in the parent component 
    function handleNormalTyping() {
        const currentText = editorState.getCurrentContent().getLastBlock().getText()
        const currentTextLength = currentText.length

        const endOfLastValidPiece = queryPiecePositions[queryPiecePositions.length-1]
        const fragment = currentText.slice(endOfLastValidPiece, currentTextLength)
        currentQueryFragmentHandler(fragment)
    }

    // Handle space bar presses and replace spaces with Unicode 169, the 'non break space' character. This avoids wrappign a new line
    function handleSpaceBar() {
        const contentState = editorState.getCurrentContent()

        const newContent = Modifier.replaceText(
            contentState, 
            editorState.getSelection(), 
            String.fromCharCode(160)
        )

        const newEditorState = EditorState.push(editorState, newContent, 'insert-characters')
        return EditorState.moveFocusToEnd(newEditorState)
    }

    // Replaces space characters with the non break space character
    const parseOutSpaces = (text: string) => {
        const newText = text.replace(/\s/g, String.fromCharCode(160))
        return newText
    }

    // Utility Method to replace text in the editor state with any other text
    function editorTextReplacer(lowIdx: number, focusLength: number, payload: string, style: any | string, reFocus: boolean) {
        // Get the current ContentBlock (there should only be one)
        const currentContentBlock = editorState.getCurrentContent().getLastBlock()
        const blockKey = currentContentBlock.getKey()

        // Create the range that we are replacing
        // Uses the queryPiecePositions prop to identify the end of the last query piece
        const blockSelection = SelectionState.createEmpty(blockKey).merge({
            anchorOffset: lowIdx,
            focusOffset: focusLength
        })

        // Create new content block with Modifiers (fill with the current Autocomplete value)
        const contentState = editorState.getCurrentContent()

        const newContent = Modifier.replaceText(
            contentState, 
            blockSelection, 
            payload,
            OrderedSet.of(style)
        )

        // return new state with the focused pushed to the end 
        const newEditorState = EditorState.push(editorState, newContent, 'insert-characters')
        if (reFocus) {
            return EditorState.moveFocusToEnd(newEditorState)
        } else {
            return newEditorState
        }
    }

    // Deletes the Query Piece 
    function deleteQueryPiece(pieceIdx: number) {
        // Ensure query fragment is cleared
        currentQueryFragmentHandler('')

        var removePrep = false
        var queryPieceStart = 0
        var queryPieceEnd = 0
        if (pieceIdx >= 1 && queryPieces[pieceIdx-1].type === 'PREPOSITION') {
            queryPieceStart = queryPiecePositions[pieceIdx-1]
            queryPieceEnd = queryPiecePositions[pieceIdx+1]
            removePrep = true
        } else {
            queryPieceStart = queryPiecePositions[pieceIdx]
            queryPieceEnd = queryPiecePositions[pieceIdx+1]
        }
        
        // Replace the query piece in editor state 
        const newEditorState = editorTextReplacer(queryPieceStart, queryPieceEnd, "", 'WHEN-MODIFIER', false)
        setEditorState(EditorState.moveFocusToEnd(newEditorState))

        // update queryPiecePositions to reflect this deletion
        removeFromQueryPiecePositionsHandler(pieceIdx, removePrep)
    }

    // Deals with Enter Key presses 
    function handleEnterKey() {
        // Handling Enter when nothing is being autocompleted
        if (currentQueryFragment === '' && queryPiecePositions.length > 1) {
            // We haven't started creating a new piece anymore, 
            // QUERY ENDS HERE
            finalQueryLaunchedHandler(true)
            return 'handled'
        } 

        // Generate new Editor State with Autocomplete
        if (autocompleteInProgress) {
            performAutocompletion()
        }
    }

    // Autocomplete Handling 
    function handleAutocomplete() {
        // Get the current ContentBlock (there should only be one)
        const currentContentBlock = editorState.getCurrentContent().getLastBlock()
        // Grab the Text from the contentBlock
        const text = currentContentBlock.getText()

        // Grab autocomplete value and type from the queryPiece object
        const autocompleteValue = parseOutSpaces(currentAutocomplete.value)
        const autocompleteType = currentAutocomplete.type

        // replace text with autocomplete value 
        const newState = editorTextReplacer(queryPiecePositions[queryPiecePositions.length-1], text.length, autocompleteValue, autocompleteType, true)
        return newState
        
    }
    

    //------------------------ KEYSTROKE HANDLERS --------------------------//

    // Handle the interception of the enter key to prevent new line 
    function keyBindingFunction(e: KeyboardEvent) {
        if (e.keyCode === 13) {
            return 'enter-key'
        } else if (e.keyCode === 32) {
            return 'space-bar'
        } else if (e.keyCode === 38) { // up arrow
            selectedIdxHandler(true)
            return 'up-arrow'
        } else if (e.keyCode === 40) { // down array
            selectedIdxHandler(false)
            return 'down-arrow'
        } else if (e.keyCode === 39 || e.keyCode === 37) { // left and right arrows (should work no matter what)
            return getDefaultKeyBinding(e)
        } else if (e.keyCode === 8) { // backspace key
            const focusInQueryPiece = focusLocation()

            if (focusInQueryPiece === -1) {   
                // If we have nothing typed, delete the most recent queryPiece
                if (currentQueryFragment === '') {
                    setUpdateCurrentQueryFragment(false)
                    deleteQueryPiece(queryPiecePositions.length-2)   
                    return 'delete-existing'
                } 
                // Otherwise just let us update the query fragment normally 
                setUpdateCurrentQueryFragment(true)       
                return getDefaultKeyBinding(e)
            } else { // If we are focused inside the query, delete the existing query piece
                setUpdateCurrentQueryFragment(false)
                deleteQueryPiece(focusInQueryPiece)   
                return 'delete-existing'
            }
        } else {
            const focusInQueryPiece = focusLocation()

            if (focusInQueryPiece === -1) {    
                setUpdateCurrentQueryFragment(true)       
                return getDefaultKeyBinding(e)
            } else {
                setUpdateCurrentQueryFragment(false)   
                return 'editing-existing'
            }
            
        }
        
    }

    // Handle Key Commands 
    function keyCommandHandler(key: string): DraftHandleValue {
        if (key === 'enter-key') {
            handleEnterKey()
            return 'handled'
        } else if (key === 'space-bar') {
            const focusInQueryPiece = focusLocation()
            
            // Delete query piece unless we are on the current query
            if (focusInQueryPiece === -1) {

                // Handle when we dont press enter but autocomplete should occur
                const fragmentWithoutFinalSpace = currentQueryFragment.slice(0, currentQueryFragment.length)
                if (currentAutocomplete.type === "PREPOSITION" && fragmentWithoutFinalSpace === currentAutocomplete.value) {
                    handleEnterKey()
                } else {
                    const newEditorState = handleSpaceBar()
                    setEditorState(newEditorState)
                }

            } else {
                setUpdateCurrentQueryFragment(false)
                deleteQueryPiece(focusInQueryPiece) 
            }
            
            return "handled"
        } 
        
        return 'not-handled'
    }

    // Component to Conditionally display the enter icon button
    /* function EnterIconComponent() {
        if (currentQueryFragment.length === 0 && finalQueryLaunched === false) {
            return (
                <img style={{height: "12px", position: "absolute", marginLeft: "691px", marginTop: "5px"}} src={enterIcon}/>
            )
        } else {
            return <div />
        }
    } */

    // Defines default styling for text in this Editor
    function myBlockStyleFn(contentBlock: any) {
        return 'commandLineStyle'
    }
    

    // JSX Content 
    return (
        <div
            style={commandLineStyle} 
            onClick={focusCommandLine}
        >
            <Editor  
                editorState={editorState} 
                onChange={setEditorState} 
                ref={commandRef}
                handleKeyCommand={keyCommandHandler}
                keyBindingFn={keyBindingFunction}
                customStyleMap={styleMap}
                onFocus={onFocusHandler}
                blockStyleFn={myBlockStyleFn}
            />   
            {/* <EnterIconComponent />           */}

        </div>
    )
}

// Styling 

const commandLineStyle: CSS.Properties = {
    minHeight: "60px",
    maxHeight: "60px",
    minWidth: "91%",
    width: 0,
    justifyContent: "center", 
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    outline: "none",
    marginLeft: "3%",
    overflowX: "auto",
    overflow: "hidden",
    marginTop: "2px",

   
}

const whenModifierStyles: CSS.Properties = {
    fontWeight: "bold",
    color: "#87DCD7",
    fontSize: "24px"

}

const prepositionsStyles: CSS.Properties = {
    fontWeight: "bold",
    fontSize: "24px"

}