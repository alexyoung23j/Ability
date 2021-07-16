import Editor from '@draft-js-plugins/editor';
import CSS from 'csstype';
import {
  DraftHandleValue,
  EditorState,
  getDefaultKeyBinding,
  Modifier,
  SelectionState,
} from 'draft-js';
import { OrderedSet } from 'immutable';
import React, {
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Piece, QueryPieceType, ModifierCategory } from '../types';
const { ipcRenderer } = require('electron');

const enterIcon = require('/src/content/svg/enterIcon.svg');
const settingsIcon = require('/src/content/svg/settingsIcon.svg');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

// Interface for CommandLine
interface CommandLineProps {
  // state props
  queryPiecePositions: number[];
  autocompleteInProgress: boolean;
  finalQueryLaunched: boolean;
  autocompleteItemClicked: boolean;
  currentQueryFragment: string;
  currentAutocomplete: any | Piece;
  queryPieces: Piece[];
  alertCommandLineToClear: string;
  currentlyClearing: boolean;
  validAutocompletes: Piece[];

  // callback function props
  currentQueryFragmentHandler: any;
  finalQueryLaunchedHandler: any;
  addToQueryPiecePositionsHandler: any;
  removeFromQueryPiecePositionsHandler: any;
  selectedIdxHandler: any;
  autocompleteItemClickedHandler: any;
  alertCommandLineClearHandler: any;
}

export default function CommandLine(props: CommandLineProps) {
  // Props
  const queryPiecePositions = props.queryPiecePositions;
  const autocompleteInProgress = props.autocompleteInProgress;
  const finalQueryLaunched = props.finalQueryLaunched;
  const autocompleteItemClicked = props.autocompleteItemClicked;
  const currentQueryFragment = props.currentQueryFragment;
  const currentAutocomplete = props.currentAutocomplete;
  const queryPieces = props.queryPieces;
  const alertCommandLineToClear = props.alertCommandLineToClear;
  const currentlyClearing = props.currentlyClearing;
  const validAutocompletes = props.validAutocompletes;

  // Callbacks to update props
  const currentQueryFragmentHandler = props.currentQueryFragmentHandler;
  const finalQueryLaunchedHandler = props.finalQueryLaunchedHandler;
  const addToQueryPiecePositionsHandler = props.addToQueryPiecePositionsHandler;
  const removeFromQueryPiecePositionsHandler =
    props.removeFromQueryPiecePositionsHandler;
  const selectedIdxHandler = props.selectedIdxHandler;
  const autocompleteItemClickedHandler = props.autocompleteItemClickedHandler;
  const alertCommandLineClearHandler = props.alertCommandLineClearHandler;

  // State
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [updateQueryPiecePositions, setUpdateQueryPiecePositions] =
    useState(false);
  const [updateCurrentQueryFragment, setUpdateCurrentQueryFragment] =
    useState(false);

  // Refs
  const commandRef = useRef<Editor>(null);

  // Styling objects
  const styleMap = {
    TIME: timeModifierStyles,
    DATE: dateModifierStyles,
    DURATION: durationModifierStyles,
    RANGE: rangeModifierStyles,
    PREPOSITION: prepositionsStyles,
  };

  //-------------------------- FOCUS HANDLERS -----------------------//

  // Bring the div into focus immediately
  useLayoutEffect(() => {
    focusCommandLine();
  }, [commandRef]);

  async function focusCommandLine() {
    if (null !== commandRef.current) {
      commandRef.current.focus();
    }
  }

  // Turn focus off when the finalQueryLaunched is true
  useEffect(() => {
    if (finalQueryLaunched === true && null !== commandRef.current) {
      commandRef.current.blur();
    }
  }, [finalQueryLaunched]);

  const onFocusHandler = () => {
    finalQueryLaunchedHandler(false);
  };

  // returns which Piece (0 indexed) the focus is currently within.
  function focusLocation() {
    const focusIdx = editorState.getSelection().getFocusOffset();
    const currentText = editorState
      .getCurrentContent()
      .getLastBlock()
      .getText();

    if (focusIdx === currentText.length) {
      return -1; // indicating we are not in any query piece, we are at the most updated location
    }
    if (queryPiecePositions.length === 1) {
      return -1;
    }
    var i = 1;
    while (i < queryPiecePositions.length) {
      const low = queryPiecePositions[i - 1];
      const high = queryPiecePositions[i];

      if (focusIdx >= low && focusIdx <= high) {
        return i - 1;
      }
      i++;
    }
    return 0;
  }

  //----------------------- USE-EFFECT METHODS ---------------------------//
  // These methods are needed to avoid timing issues with state updates

  // Handles Piece and queryPiecePosition updates
  useEffect(() => {
    if (updateQueryPiecePositions === true) {
      // Update queryPiecePositions
      updateQueryPieces();

      // set update listener to false
      setUpdateQueryPiecePositions(false);

      // Add a space that is not a real space
      const newEditorState = handleSpaceBar();
      setEditorState(newEditorState);
    }
  }, [editorState]);

  // Handles normal typing
  useEffect(() => {
    if (updateCurrentQueryFragment === true) {
      handleNormalTyping();
    }
  }, [editorState]);

  useEffect(() => {
    if (autocompleteItemClicked === true) {
      performAutocompletion();
      autocompleteItemClickedHandler(false);
    }
  }, [autocompleteItemClicked]);

  // Listen for Clearing Command from Parent
  useEffect(() => {
    if (alertCommandLineToClear === 'to-clear') {
      setEditorState(EditorState.createEmpty());
    }
  }, [currentlyClearing]);

  // Listen for changes to editor, if we are empty and need to clear, we update parent callback
  // to trigger the ipcRenderer event that hides the window
  useEffect(() => {
    var hasClearableText = editorState.getCurrentContent().hasText();
    if (currentlyClearing && !hasClearableText) {
      focusCommandLine().then(() => {
        alertCommandLineClearHandler('cleared');
      });
    }
  }, [editorState]);

  //----------------------- HELPER METHODS ---------------------------//
  // Small methods to handle small details of implementation

  function performAutocompletion() {
    const newEditorState = handleAutocomplete();
    setEditorState(newEditorState);

    // Update state variable to trigger updateQueryPieces() to ensure we don't miss the editorState change
    setUpdateQueryPiecePositions(true);

    // Autocomplete Is Ended, set it to False
    currentQueryFragmentHandler('');

    EditorState.moveFocusToEnd(editorState);
  }

  // Function to update the queryPieces state in our parent. Called by a Use-Effect Method
  function updateQueryPieces() {
    const currentContentBlock = editorState.getCurrentContent().getLastBlock();
    const updatedText = currentContentBlock.getText();

    const focusPiece = focusLocation();

    addToQueryPiecePositionsHandler(focusPiece, updatedText.length + 1);
  }

  // Updates the currentQueryFragment in the parent component
  function handleNormalTyping() {
    const currentText = editorState
      .getCurrentContent()
      .getLastBlock()
      .getText();
    const currentTextLength = currentText.length;

    const endOfLastValidPiece =
      queryPiecePositions[queryPiecePositions.length - 1];
    const fragment = currentText.slice(endOfLastValidPiece, currentTextLength);
    currentQueryFragmentHandler(fragment);
  }

  // Handle space bar presses and replace spaces with Unicode 169, the 'non break space' character. This avoids wrappign a new line
  function handleSpaceBar() {
    const contentState = editorState.getCurrentContent();

    const newContent = Modifier.replaceText(
      contentState,
      editorState.getSelection(),
      String.fromCharCode(160)
    );

    const newEditorState = EditorState.push(
      editorState,
      newContent,
      'insert-characters'
    );
    return EditorState.moveFocusToEnd(newEditorState);
  }

  // Replaces space characters with the non break space character
  const parseOutSpaces = (text: string) => {
    const newText = text.replace(/\s/g, String.fromCharCode(160));
    return newText;
  };

  // Utility Method to replace text in the editor state with any other text
  function editorTextReplacer(
    lowIdx: number,
    focusLength: number,
    payload: string,
    style: any | string,
    reFocus: boolean
  ) {
    // Get the current ContentBlock (there should only be one)
    const currentContentBlock = editorState.getCurrentContent().getLastBlock();
    const blockKey = currentContentBlock.getKey();

    // Create the range that we are replacing
    // Uses the queryPiecePositions prop to identify the end of the last query piece
    const blockSelection = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: lowIdx,
      focusOffset: focusLength,
    });

    // Create new content block with Modifiers (fill with the current Autocomplete value)
    const contentState = editorState.getCurrentContent();

    const newContent = Modifier.replaceText(
      contentState,
      blockSelection,
      payload,
      OrderedSet.of(style)
    );

    // return new state with the focused pushed to the end
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      'insert-characters'
    );
    if (reFocus) {
      return EditorState.moveFocusToEnd(newEditorState);
    } else {
      return newEditorState;
    }
  }

  // Deletes the Query Piece
  function deleteQueryPiece(pieceIdx: number) {
    // Ensure query fragment is cleared
    currentQueryFragmentHandler('');

    var removePrep = false;
    var queryPieceStart = 0;
    var queryPieceEnd = 0;
    if (pieceIdx >= 1 && queryPieces[pieceIdx - 1].type === 'PREPOSITION') {
      queryPieceStart = queryPiecePositions[pieceIdx - 1];
      queryPieceEnd = queryPiecePositions[pieceIdx + 1];
      removePrep = true;
    } else {
      queryPieceStart = queryPiecePositions[pieceIdx];
      queryPieceEnd = queryPiecePositions[pieceIdx + 1];
    }

    // Replace the query piece in editor state
    const newEditorState = editorTextReplacer(
      queryPieceStart,
      queryPieceEnd,
      '',
      'WHEN-MODIFIER',
      false
    );
    setEditorState(EditorState.moveFocusToEnd(newEditorState));

    // update queryPiecePositions to reflect this deletion
    removeFromQueryPiecePositionsHandler(pieceIdx, removePrep);
  }

  // Deals with Enter Key presses
  function handleEnterKey() {
    // Handling Enter when nothing is being autocompleted
    if (currentQueryFragment === '' && queryPiecePositions.length > 1) {
      // We haven't started creating a new piece anymore,
      // QUERY ENDS HERE

      // Ensure our final query piece was indeed a modifier, not a preposition
      if (queryPieces[queryPieces.length-1].type === 'MODIFIER') {
        finalQueryLaunchedHandler(true);
      }
      
      return 'handled';
    }

    // Generate new Editor State with Autocomplete
    if (autocompleteInProgress) {
      performAutocompletion();
    }
  }

  // Autocomplete Handling
  function handleAutocomplete() {
    // Get the current ContentBlock (there should only be one)
    const currentContentBlock = editorState.getCurrentContent().getLastBlock();
    // Grab the Text from the contentBlock
    const text = currentContentBlock.getText();

    // Grab autocomplete value and type from the Piece object
    const autocompleteValue = parseOutSpaces(currentAutocomplete.value);
    const autocompleteType = currentAutocomplete.type;
    let autocompleteStyle;
    if (autocompleteType === QueryPieceType.MODIFIER) {
      autocompleteStyle = currentAutocomplete.category;
    } else {
      autocompleteStyle = autocompleteType;
    }

    // replace text with autocomplete value
    const newState = editorTextReplacer(
      queryPiecePositions[queryPiecePositions.length - 1],
      text.length,
      autocompleteValue,
      autocompleteStyle,
      true
    );
    return newState;
  }

  //------------------------ KEYSTROKE HANDLERS --------------------------//

  // Handle the interception of the enter key to prevent new line
  function keyBindingFunction(e: KeyboardEvent) {
    if (e.keyCode === 13) {
      return 'enter-key';
    } else if (e.keyCode === 32) {
      return 'space-bar';
    } else if (e.keyCode === 38) {
      // up arrow
      selectedIdxHandler(true);
      return 'up-arrow';
    } else if (e.keyCode === 40) {
      // down array
      selectedIdxHandler(false);
      return 'down-arrow';
    } else if (e.keyCode === 39 || e.keyCode === 37) {
      // left and right arrows (should work no matter what)
      return getDefaultKeyBinding(e);
    } else if (e.keyCode === 8) {
      // backspace key
      // handle completely empty editor
      if (currentQueryFragment === '' && queryPieces.length === 0) {
        return 'do-nothing';
      }
      const focusInQueryPiece = focusLocation();

      if (focusInQueryPiece === -1) {
        // If we have nothing typed, delete the most recent Piece
        if (currentQueryFragment === '') {
          setUpdateCurrentQueryFragment(false);
          deleteQueryPiece(queryPiecePositions.length - 2);
          return 'delete-existing';
        }
        // Otherwise just let us update the query fragment normally
        setUpdateCurrentQueryFragment(true);
        return getDefaultKeyBinding(e);
      } else {
        // If we are focused inside the query, delete the existing query piece
        setUpdateCurrentQueryFragment(false);
        deleteQueryPiece(focusInQueryPiece);
        return 'delete-existing';
      }
    } else {
      const focusInQueryPiece = focusLocation();

      if (focusInQueryPiece === -1) {
        setUpdateCurrentQueryFragment(true);
        return getDefaultKeyBinding(e);
      } else {
        setUpdateCurrentQueryFragment(false);
        return 'editing-existing';
      }
    }
  }

  function shouldAutocompleteOnSpace(currentQueryFragment) {
    const fragmentWithoutFinalSpace = currentQueryFragment.slice(
      0,
      currentQueryFragment.length
    );

    // Catch situations where we have on autocomplete but it is open ended ("august _" for instance)
    if (
      validAutocompletes.length === 1 ||
      (currentAutocomplete != null &&
        parseOutSpaces(currentAutocomplete.value) === fragmentWithoutFinalSpace)
    ) {
      // Catch situations where we have on autocomplete but it is open ended ("august _" for instance)
      if (!validAutocompletes[0].value.includes("_")) {
        return true;
      } else {
        return false
      }
      
    } else {
      return false;
    }
  }
  // Handle Key Commands
  function keyCommandHandler(key: string): DraftHandleValue {
    if (key === 'enter-key') {
      handleEnterKey();
      return 'handled';
    } else if (key === 'space-bar') {
      const focusInQueryPiece = focusLocation();

      // Delete query piece unless we are on the current query
      if (focusInQueryPiece === -1) {
        // Handle when we dont press enter but autocomplete should occur

        if (shouldAutocompleteOnSpace(currentQueryFragment)) {
          handleEnterKey();
        } else {
          const newEditorState = handleSpaceBar();
          setEditorState(newEditorState);
        }
      } else {
        setUpdateCurrentQueryFragment(false);
        deleteQueryPiece(focusInQueryPiece);
      }

      return 'handled';
    }

    return 'not-handled';
  }

  // Component to Conditionally display the enter icon button
  function IconComponent() {
    if (currentQueryFragment.length === 0 && finalQueryLaunched === false) {
      return (
        <img
          style={{
            height: '12px',
            position: 'absolute',
            marginLeft: '545px',
            marginTop: '2px',
          }}
          src={enterIcon}
        />
      );
    } else if (finalQueryLaunched === true) {
      // TODO: Add logic for routing to settings view with information about the query that was entered
      return (
        <div
          onClick={(e) => {e.stopPropagation(); ipcRenderer.send('open-settings')}}
          style={{position: 'absolute',
          marginLeft: '545px',
          marginTop: '2px',}}
        >
          <img
            style={{
              height: '18px',
              
            }}
            src={settingsIcon}
           
          />
        </div>
        
      );
    } else {
      return <div />;
    }
  }

  // Defines default styling for text in this Editor
  function myBlockStyleFn(contentBlock: any) {
    return 'commandLineStyle';
  }

  // JSX Content
  return (
    <div style={commandLineStyle} onClick={focusCommandLine}>
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
      <IconComponent />
      {currentQueryFragment.length < 1 && queryPieces.length < 1 && (
        <DefaultText />
      )}
    </div>
  );
}

// Display the default message
function DefaultText() {

  return(
    <div
      style={{position: "absolute", marginLeft: "3px"}}
      className="commandLineDefaultText"
    >
      start your calendar search!
    </div>
  )
}

// Styling

const commandLineStyle: CSS.Properties = {
  minHeight: '60px',
  maxHeight: '60px',
  minWidth: '87%',
  width: 0,
  justifyContent: 'center',
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
  marginLeft: '3%',
  overflowX: 'auto',
  overflow: 'hidden',
  marginTop: '2px',
};

const dateModifierStyles: CSS.Properties = {
  fontWeight: 'lighter',
  color: 'rgba(125, 125, 125, .5)',
  fontSize: '25px',
};

const timeModifierStyles: CSS.Properties = {
  fontWeight: 'lighter',
  color: 'rgba(125, 189, 220, 1)',
  fontSize: '25px',
};

const rangeModifierStyles: CSS.Properties = {
  fontWeight: 'lighter',
  color: 'rgba(125, 125, 125, .9)',
  fontSize: '25px',
};

const durationModifierStyles: CSS.Properties = {
  fontWeight: 'normal',
  color: '#87DCD7',
  fontSize: '25px',
};

const prepositionsStyles: CSS.Properties = {
  fontWeight: 'bold',
  fontSize: '25px',
  color: '#6B6B6B',
};
