import CSS from 'csstype';
import 'draft-js/dist/Draft.css';
import React, { useEffect, useState } from 'react';
import {
  Piece,
  QueryPieceType,
  ModifierCategory,
  ModifierPiece,
} from '../../constants/types';
import CommandLine from './command-line/CommandLine';
import AutocompleteParser from './autocomplete/AutocompleteParser';
import ResultEngine from './results-display/engines/ResultEngine';
import { QueryTransformEngine } from './results-display/engines/QueryTransformEngine';
import { ScheduledSingledInstanceJob } from '../util/cron-util/CronUtil';
const { DateTime } = require('luxon');

const { ipcRenderer } = require('electron');

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

const DEFAULT_AUTOCOMPLETE: ModifierPiece = {
  value: 'week',
  category: ModifierCategory.RANGE,
  type: QueryPieceType.MODIFIER,
};

export default function CommandView() {
  // State

  const [autocompleteInProgress, setAutocompleteInProgress] = useState(false);
  const [autocompleteItemClicked, setAutocompleteItemClicked] = useState(false);
  const [finalQueryLaunched, setFinalQueryLaunched] = useState(false);

  const [queryPiecePositions, setQueryPiecePositions] = useState<number[]>([0]);
  const [queryPieces, setQueryPieces] = useState<Piece[]>([]);
  const [validAutocompletes, setValidAutocompletes] = useState<Piece[]>([]);

  const [currentQueryFragment, setCurrentQueryFragment] = useState('');
  const [currentAutocomplete, setCurrentAutocomplete] =
    useState<Piece>(DEFAULT_AUTOCOMPLETE);
  const [currentAutocompleteIdx, setCurrentAutocompleteIdx] = useState(0);
  const [alertCommandLineToClear, setAlertCommandLineToClear] =
    useState('default');
  const [currentlyClearing, setCurrentClearing] = useState(false);

  ipcRenderer.on('clear-command-line', () => {
    clearCommandLine().then(() => {
      setCurrentClearing(true);
    });
  });

  // ---------------- USE EFFECT METHODS ------------------- //

  useEffect(() => {
    if (queryPieces.length == 0) {
      setCurrentAutocomplete(DEFAULT_AUTOCOMPLETE);
    }
  }, [currentQueryFragment]);

  useEffect(() => {
    if (validAutocompletes.length > 0) {
      setCurrentAutocomplete(validAutocompletes[0]);
      setCurrentAutocompleteIdx(0);
      setAutocompleteInProgress(true);
    } else {
      setCurrentAutocompleteIdx(0);
      setAutocompleteInProgress(false);
    }
    //myConsole.log("my completes: ", validAutocompletes.slice(0, 5))
  }, [validAutocompletes]);

  // Parse the autocomplete when the query fragment is updated
  // useEffect(() => {
  //   autocompleteParser(currentQueryFragment);
  // }, [currentQueryFragment]);

  // ------------------------------ CALLBACK METHODS ------------------------------ //

  // Handles all instances when we want to add a new Piece to the state,
  const addToQueryPiecePositionsHandler = (query: number, idxOfEnd: number) => {
    if (query === -1) {
      // No previous query pieces will be changed
      setQueryPiecePositions((queryPiecePositions) => [
        ...queryPiecePositions,
        idxOfEnd,
      ]);
      // update queryPieces here soon
    }

    if (currentAutocomplete) {
      setQueryPieces((queryPieces) => [...queryPieces, currentAutocomplete]);
    }
  };

  // Handles all instances when we want to add a new Piece to the state,
  const removeFromQueryPiecePositionsHandler = (
    removedPieceIdx: number,
    removePrep: boolean
  ) => {
    if (removePrep) {
      // we have a preposition leading our Piece, so we need to remove both
      const queryPieceLength =
        queryPiecePositions[removedPieceIdx + 1] -
        queryPiecePositions[removedPieceIdx - 1];
      var queryPiecePositionsCopy = queryPiecePositions;
      queryPiecePositions.splice(removedPieceIdx - 1, 2);

      for (var i = removedPieceIdx - 1; i < queryPiecePositions.length; i++) {
        queryPiecePositionsCopy[i] =
          queryPiecePositionsCopy[i] - queryPieceLength;
      }

      setQueryPiecePositions(queryPiecePositionsCopy);

      const queryPiecesCopy = queryPieces;
      queryPiecesCopy.splice(removedPieceIdx - 1, 2);

      setQueryPieces(queryPiecesCopy);
    } else {
      const queryPieceLength =
        queryPiecePositions[removedPieceIdx + 1] -
        queryPiecePositions[removedPieceIdx];
      var queryPiecePositionsCopy = queryPiecePositions;
      queryPiecePositions.splice(removedPieceIdx, 1);

      for (var i = removedPieceIdx; i < queryPiecePositions.length; i++) {
        queryPiecePositionsCopy[i] =
          queryPiecePositionsCopy[i] - queryPieceLength;
      }

      setQueryPiecePositions(queryPiecePositionsCopy);

      const queryPiecesCopy = queryPieces;
      queryPiecesCopy.splice(removedPieceIdx, 1);

      setQueryPieces(queryPiecesCopy);
    }
  };

  const selectedIdxHandler = (up: boolean) => {
    if (up && validAutocompletes.length > 0) {
      if (currentAutocompleteIdx != 0) {
        setCurrentAutocomplete(validAutocompletes[currentAutocompleteIdx - 1]);
        setCurrentAutocompleteIdx(currentAutocompleteIdx - 1);
      }
    } else if (validAutocompletes.length > 0) {
      if (currentAutocompleteIdx < validAutocompletes.length - 1) {
        setCurrentAutocomplete(validAutocompletes[currentAutocompleteIdx + 1]);
        setCurrentAutocompleteIdx(currentAutocompleteIdx + 1);
      }
    }
  };

  // Handles Click events on an autocomplete item in AutocompleteBar
  const autocompleteClickHandler = (idx: number) => {
    setCurrentAutocomplete(validAutocompletes[idx]);
    setAutocompleteItemClicked(true);
  };

  const autocompleteHoverHandler = (idx: number) => {
    setCurrentAutocomplete(validAutocompletes[idx]);
    setCurrentAutocompleteIdx(idx);
  };

  // --------------------- HELPER METHODS ---------------------- //

  async function clearCommandLine() {
    // Reset all State
    setAlertCommandLineToClear('to-clear');
    setAutocompleteInProgress(false);
    setAutocompleteItemClicked(false);
    setFinalQueryLaunched(false);
    setQueryPiecePositions([0]);
    setQueryPieces([]);
    setValidAutocompletes([]);
    setCurrentQueryFragment('');
    setCurrentAutocomplete(null);
    setCurrentAutocompleteIdx(0);
  }

  // Blur the browserwindow
  function triggerBrowserWindowBlur() {
    clearCommandLine().then(() => {
      setCurrentClearing(true);
    });
  }

  // Listen for update from CommandLine and
  useEffect(() => {
    if (alertCommandLineToClear === 'cleared') {
      ipcRenderer.send('command-line-native-blur', []);
      setAlertCommandLineToClear('default');
      setCurrentClearing(false);
    }
  }, [alertCommandLineToClear]);

  return (
    <div style={commandAreaStyle} onClick={() => triggerBrowserWindowBlur()}>
      <div style={commandStyle} onClick={(e) => e.stopPropagation()}>
        <CommandLine
          queryPiecePositions={queryPiecePositions}
          autocompleteInProgress={autocompleteInProgress}
          finalQueryLaunched={finalQueryLaunched}
          autocompleteItemClicked={autocompleteItemClicked}
          currentQueryFragment={currentQueryFragment}
          currentAutocomplete={currentAutocomplete}
          queryPieces={queryPieces}
          validAutocompletes={validAutocompletes}
          alertCommandLineToClear={alertCommandLineToClear}
          currentlyClearing={currentlyClearing}
          clearCommandLine={clearCommandLine}
          currentQueryFragmentHandler={setCurrentQueryFragment}
          finalQueryLaunchedHandler={setFinalQueryLaunched}
          addToQueryPiecePositionsHandler={addToQueryPiecePositionsHandler}
          removeFromQueryPiecePositionsHandler={
            removeFromQueryPiecePositionsHandler
          }
          selectedIdxHandler={selectedIdxHandler}
          autocompleteItemClickedHandler={setAutocompleteItemClicked}
          alertCommandLineClearHandler={setAlertCommandLineToClear}
        />
        {(finalQueryLaunched && (
          <QueryTransformEngine queryPieces={queryPieces} />
        )) || (
          <AutocompleteParser
            updateRoot={setValidAutocompletes}
            validAutocompletes={validAutocompletes}
            highlightedIdx={currentAutocompleteIdx}
            autocompleteInProgress={autocompleteInProgress}
            clickHandler={autocompleteClickHandler}
            hoverHandler={autocompleteHoverHandler}
            precedingQueryPieces={queryPieces}
            queryFragment={{
              value: currentQueryFragment,
              type: QueryPieceType.MODIFIER,
            }}
            dirtyQueryFragment={{
              value: currentQueryFragment,
              type: QueryPieceType.MODIFIER,
            }}
          />
        )}
      </div>
    </div>
  );
}

const commandStyle: CSS.Properties = {
  minHeight: '65px',
  minWidth: '600px',
  width: '600px',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  flexDirection: 'column',
  outline: 'none',
  marginTop: '5%',
  boxShadow: '0 0 50px rgba(0,0,0, 0.3)',
};

const commandAreaStyle: CSS.Properties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: 'rgba(211,211,211, 0.05)',
  position: 'fixed',
  width: '100%',
};
