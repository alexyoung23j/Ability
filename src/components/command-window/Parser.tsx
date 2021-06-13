import React, { useEffect, useState } from 'react';
import AutocompleteEngine, {
  AutocompleteEngineProps,
} from './autocomplete/AutocompleteEngine';
import { QueryFragment } from './autocomplete/types';
import { isNumeric } from './QueryUtil';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


interface ParserProps extends AutocompleteEngineProps {}


// Replace whitespace with non break whitespace and replace numbers with x
function _normalizeQuery({ value }: QueryFragment): string {
  
  const newVal = value.replace(/\u00A0/, ' ').replace(/\d+/g, 'x')
  return newVal
}

export default function Parser(props: ParserProps) {
  const { queryFragment, setHandlingNumericInput } = props;
  const { value } = queryFragment;


  const cleanQueryFragment = {
    value: _normalizeQuery(queryFragment),
    type: queryFragment.type
  }
  const numerics = value.match(/\d+/g)

  myConsole.log(numerics)
  // create array of numerical characters seperated by any other characters
  

  return <AutocompleteEngine {...props} numerics={numerics} queryFragment={cleanQueryFragment} />;
  
}

/* 

High Level Plan for Parser:

We intercept text and check for numbers in that text. If we find them, we record them in order and then replace them with "x". 
This will allow the values to be found in the trie. From within AutocompleteEngine, we convert those "x" strings into the correct
numerical values before displaying them to the user and saving them in our queryPieces array that is kept in CommandView.


Current Problems:
For some reason, when we enter a number for the first time in a mounted session, that number is stuck as the return valu eof the autocomplete
for the rest of the session. Need to look into it more. 
  

 */