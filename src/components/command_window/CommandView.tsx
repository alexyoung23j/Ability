import CSS from 'csstype'
import 'draft-js/dist/Draft.css'
import React, { useEffect, useState } from 'react'
import { queryPiece } from '../../types'
import AutocompleteBar from './AutocompleteBar'
import CommandLine from './CommandLine'
import TextSnippetDisplay from './TextSnippetDisplay'

const { ipcRenderer } = require('electron')

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export default function CommandView() {
  // State

  const [autocompleteInProgress, setAutocompleteInProgress] = useState(false)
  const [autocompleteItemClicked, setAutocompleteItemClicked] = useState(false)
  const [finalQueryLaunched, setFinalQueryLaunched] = useState(false)

  const [queryPiecePositions, setQueryPiecePositions] = useState<number[]>([0])
  const [queryPieces, setQueryPieces] = useState<queryPiece[]>([])
  const [validAutocompletes, setValidAutocompletes] = useState<queryPiece[]>([])

  const [currentQueryFragment, setCurrentQueryFragment] = useState('')
  const [currentAutocomplete, setCurrentAutocomplete] = useState<queryPiece>()
  const [currentAutocompleteIdx, setCurrentAutocompleteIdx] = useState(0)
  const [alertCommandLineToClear, setAlertCommandLineToClear] = useState('default')
  const [currentlyClearing, setCurrentClearing] = useState(false)

  // AUTOCOMPLETE PARSER (to be swapped out)//
  // eventually this will handle the preposition work and prevent us from recommending invalid preposition followers
  const autocompleteParser = (rawFragment: string) => {
    //console.log("That: ", fragment)
    // Strip Fragment of Spaces to avoid confusion
    const fragment = rawFragment.trim()

    const autocompleteDummyVals = ['lunch', 'monday', 'april 2', 'next week']
    if (fragment.length > 2) {
      setValidAutocompletes([])

      setCurrentAutocomplete({
        value: autocompleteDummyVals[0],
        type: 'WHEN-MODIFIER',
      })

      for (var i = 0; i < autocompleteDummyVals.length; i++) {
        const piece: queryPiece = {
          value: autocompleteDummyVals[i],
          type: 'WHEN-MODIFIER',
        }
        setValidAutocompletes((validAutocompletes) => [
          ...validAutocompletes,
          piece,
        ])
      }
      setAutocompleteInProgress(true)

      /// setValidAutocompletes should be called too
    } else if (fragment.length > 1) {
      setCurrentAutocompleteIdx(0)
      setValidAutocompletes([])
      setCurrentAutocomplete({
        value: 'on',
        type: 'PREPOSITION',
      })
      setAutocompleteInProgress(true)
    } else {
      setCurrentAutocompleteIdx(0)
      setValidAutocompletes([])
      setAutocompleteInProgress(false)
    }
  }

  // ---------------- USE EFFECT METHODS ------------------- //

  // Parse the autocomplete when the query fragment is updated
  useEffect(() => {
    autocompleteParser(currentQueryFragment)
  }, [currentQueryFragment])

  // CALLBACKS METHODS //

  const currentQueryFragmentHandler = (fragment: string) => {
    setCurrentQueryFragment(fragment)
  }

  const finalQueryLaunchedHandler = (launched: boolean) => {
    setFinalQueryLaunched(launched)
  }

  // Handles all instances when we want to add a new queryPiece to the state,
  const addToQueryPiecePositionsHandler = (query: number, idxOfEnd: number) => {
    if (query === -1) {
      // No previous query pieces will be changed
      setQueryPiecePositions((queryPiecePositions) => [
        ...queryPiecePositions,
        idxOfEnd,
      ])
      // update queryPieces here soon
    }

    if (currentAutocomplete) {
      setQueryPieces((queryPieces) => [...queryPieces, currentAutocomplete])
    }
  }

  // Handles all instances when we want to add a new queryPiece to the state,
  const removeFromQueryPiecePositionsHandler = (
    removedPieceIdx: number,
    removePrep: boolean
  ) => {
    if (removePrep) {
      // we have a preposition leading our queryPiece, so we need to remove both
      const queryPieceLength =
        queryPiecePositions[removedPieceIdx + 1] -
        queryPiecePositions[removedPieceIdx - 1]
      var queryPiecePositionsCopy = queryPiecePositions
      queryPiecePositions.splice(removedPieceIdx - 1, 2)

      for (var i = removedPieceIdx - 1; i < queryPiecePositions.length; i++) {
        queryPiecePositionsCopy[i] =
          queryPiecePositionsCopy[i] - queryPieceLength
      }

      setQueryPiecePositions(queryPiecePositionsCopy)

      const queryPiecesCopy = queryPieces
      queryPiecesCopy.splice(removedPieceIdx - 1, 2)

      setQueryPieces(queryPiecesCopy)
    } else {
      const queryPieceLength =
        queryPiecePositions[removedPieceIdx + 1] -
        queryPiecePositions[removedPieceIdx]
      var queryPiecePositionsCopy = queryPiecePositions
      queryPiecePositions.splice(removedPieceIdx, 1)

      for (var i = removedPieceIdx; i < queryPiecePositions.length; i++) {
        queryPiecePositionsCopy[i] =
          queryPiecePositionsCopy[i] - queryPieceLength
      }

      setQueryPiecePositions(queryPiecePositionsCopy)

      const queryPiecesCopy = queryPieces
      queryPiecesCopy.splice(removedPieceIdx, 1)

      setQueryPieces(queryPiecesCopy)
    }
  }

  const selectedIdxHandler = (up: boolean) => {
    if (up && validAutocompletes.length > 0) {
      if (currentAutocompleteIdx != 0) {
        setCurrentAutocomplete(validAutocompletes[currentAutocompleteIdx - 1])
        setCurrentAutocompleteIdx(currentAutocompleteIdx - 1)
      }
    } else if (validAutocompletes.length > 0) {
      if (currentAutocompleteIdx < validAutocompletes.length - 1) {
        setCurrentAutocomplete(validAutocompletes[currentAutocompleteIdx + 1])
        setCurrentAutocompleteIdx(currentAutocompleteIdx + 1)
      }
    }
  }

  // Updates autocompleteItemClicked via CommandLine
  const autocompleteItemClickedUpdater = (val: boolean) => {
    setAutocompleteItemClicked(val)
  }

  // Handles Click events on an autocomplete item in AutocompleteBar
  const autocompleteClickHandler = (idx: number) => {
    setCurrentAutocomplete(validAutocompletes[idx])
    setAutocompleteItemClicked(true)
  }

  const autocompleteHoverHandler = (idx: number) => {
    setCurrentAutocomplete(validAutocompletes[idx])
    setCurrentAutocompleteIdx(idx)
  }

  const alertCommandLineClearHandler = (value: string) => {
    setAlertCommandLineToClear(value)
    
  }

  // --------------------- HELPER METHODS ---------------------- //

  async function clearCommandLine() {
    // Reset all State
    setAlertCommandLineToClear('to-clear')
    setAutocompleteInProgress(false)
    setAutocompleteItemClicked(false)
    setFinalQueryLaunched(false)
    setQueryPiecePositions([0])
    setQueryPieces([])
    setValidAutocompletes([])
    setCurrentQueryFragment('')
    setCurrentAutocomplete(null)
    setCurrentAutocompleteIdx(0)
    
  }

  function ToggleLowerField() {
    
    if (finalQueryLaunched) {
      return <TextSnippetDisplay />
    } else {
      return (
        <AutocompleteBar
          validAutocompletes={validAutocompletes}
          highlightedIdx={currentAutocompleteIdx}
          autocompleteInProgress={autocompleteInProgress}
          clickHandler={autocompleteClickHandler}
          hoverHandler={autocompleteHoverHandler}
        />
      )
    }
  }

  // Blur the browserwindow
  function triggerBrowserWindowBlur() {
    clearCommandLine().then(() => {
      setCurrentClearing(true)
    })
  }

  // Listen for update from CommandLine and 
  useEffect(() => {
    if (alertCommandLineToClear === 'cleared') {
      ipcRenderer.send('command-line-native-blur', [])
      setAlertCommandLineToClear('default')
      setCurrentClearing(false)
    }
  }, [alertCommandLineToClear])


  return (
    <div 
      style={commandAreaStyle}
      onClick={() => triggerBrowserWindowBlur()}
    >
      <div 
        style={commandStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <CommandLine
          queryPiecePositions={queryPiecePositions}
          autocompleteInProgress={autocompleteInProgress}
          finalQueryLaunched={finalQueryLaunched}
          autocompleteItemClicked={autocompleteItemClicked}
          currentQueryFragment={currentQueryFragment}
          currentAutocomplete={currentAutocomplete}
          queryPieces={queryPieces}
          alertCommandLineToClear={alertCommandLineToClear}
          currentlyClearing={currentlyClearing}

          currentQueryFragmentHandler={currentQueryFragmentHandler}
          finalQueryLaunchedHandler={finalQueryLaunchedHandler}
          addToQueryPiecePositionsHandler={addToQueryPiecePositionsHandler}
          removeFromQueryPiecePositionsHandler={
            removeFromQueryPiecePositionsHandler
          }
          selectedIdxHandler={selectedIdxHandler}
          autocompleteItemClickedHandler={autocompleteItemClickedUpdater}
          alertCommandLineClearHandler={alertCommandLineClearHandler}
        />
        <ToggleLowerField />
      </div>
    </div>
   
  )
}

const commandStyle: CSS.Properties = {
  minHeight: '65px',
  minWidth: '650px',
  width: "650px",
  backgroundColor: '#FFFFFF',
  borderRadius: '15px',
  flexDirection: 'column',
  outline: 'none',
  marginTop: "20%",
  //boxShadow: "3px 3px 3px "
}

const commandAreaStyle: CSS.Properties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  height: "100%",
  backgroundColor: "rgba(211,211,211, 0.04)",
  //opacity: "4%"
}
