import React, { useEffect, useState } from 'react';
import AutocompleteEngine, {
  BaseAutocompleteEngineProps,
} from './autocomplete/AutocompleteEngine';
import { Piece, QueryFragment } from './types';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export const NUMERIC_WILDCARD = '_';

interface ParserProps extends BaseAutocompleteEngineProps {
  precedingQueryPieces: Array<Piece>;
  queryFragment: QueryFragment;
  dirtyQueryFragment: QueryFragment; //redundant here
  updateRoot: (autocompletions: Array<Piece>) => void;
}

// Replace whitespace with non break whitespace and replace numbers with numeric wildcard
function _normalizeQuery({ value }: QueryFragment): string {
  return value.replace(/\u00A0/, ' ').replace(/\d+/g, NUMERIC_WILDCARD);
}

function _insertNumbers(
  autocompletions: Array<Piece>,
  numerics: Array<String>
): Array<Piece> {
  const hydratedCompletions = [];
  for (const completion of autocompletions) {
    if (
      completion.value.includes(NUMERIC_WILDCARD) &&
      numerics != null &&
      numerics.length > 0
    ) {
      const hydratedValue = [];
      let numIdx = 0;
      for (const char of completion.value) {
        if (char === NUMERIC_WILDCARD && numIdx <= numerics.length - 1) {
          
          hydratedValue.push(numerics[numIdx]);
          numIdx += 1;
        } else {
          hydratedValue.push(char);
        }
      }
      
      hydratedCompletions.push({
        ...completion,
        value: hydratedValue.join(''),
      });
    } else {
      hydratedCompletions.push(completion);
    }
  }

  //myConsole.log(hydratedCompletions)

  return hydratedCompletions;
}

export default function Parser(props: ParserProps) {
  const { queryFragment } = props;
  const { value } = queryFragment;

  const cleanQueryFragment = {
    value: _normalizeQuery(queryFragment),
    type: queryFragment.type,
  };
  const numerics = value.match(/\d+/g);

  // create array of numerical characters separated by any other characters

  return (
    <AutocompleteEngine
      {...props}
      onAutocompletion={(autocompletions: Array<Piece>) =>
        _insertNumbers(autocompletions, numerics)
      }
      queryFragment={cleanQueryFragment}
      dirtyQueryFragment={queryFragment}
    />
  );
}

/* 

High Level Plan for Parser:

We intercept text and check for numbers in that text. If we find them, we record them in order and then replace them with NUMERIC_WILDCARD. 
This will allow the values to be found in the trie. From within AutocompleteEngine, we convert those NUMERIC_WILDCARD strings into the correct
numerical values before displaying them to the user and saving them in our queryPieces array that is kept in CommandView.


Current Problems:
For some reason, when we enter a number for the first time in a mounted session, that number is stuck as the return valu eof the autocomplete
for the rest of the session. Need to look into it more. 
  

 */
