import React, { useEffect, useState } from 'react';
import AutocompleteBar, { AutocompleteBarProps } from './AutocompleteBar';
import { ALL_MODIFIER_CATEGORIES } from '../constants';
import { buildModifierTrie, buildPrepositionTrie, TreeNode } from '../TreeNode';
import {
  isModifierPiece,
  isPrepositionPiece,
  ModifierCategory,
  ModifierPiece,
  ModifierQueryFragment,
  Piece,
  PrepositionPiece,
  PrepositionQueryFragment,
  QueryFragment,
} from './types';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);


export interface AutocompleteEngineProps extends AutocompleteBarProps {
  precedingQueryPieces: Array<Piece>;
  queryFragment: QueryFragment;
  numerics: Array<String>;
  setHandlingNumericInput: (val: boolean) => void;
  onAutocompletion: (autocompletions: Array<Piece>) => void;
}

function locations(substring,string){
  var a=[],i=-1;
  while((i=string.indexOf(substring,i+1)) >= 0) a.push(i);
  return a;
}

function _insertNumbers(autocompletions: Array<Piece>, numerics: Array<String>): Array<Piece> {
  const completionCopy = autocompletions
  for (const completion of completionCopy) {
    //myConsole.log("completion: ", completion)
    if (completion.value.includes("x") && numerics != null && numerics.length > 0) {

      let newVal = completion.value;
      const indicesToReplace = locations('x', newVal)

     
      let numIdx = 0
      for (const idx of indicesToReplace) {
        if (numerics[numIdx] != null) {
          newVal = newVal.substring(0, idx) + numerics[numIdx] + newVal.substring(idx+1)
          numIdx+=1
        } else {
          newVal = newVal.substring(0, idx) + numerics[numIdx-1] + newVal.substring(idx+1)
        }
        
      }

      completion.value = newVal

    }
  }


  return completionCopy
}

export default function AutocompleteEngine(props: AutocompleteEngineProps) {
  const [modifierTrieRoot] = useState<
    TreeNode<ModifierPiece, ModifierQueryFragment>
  >(buildModifierTrie());
  const [prepositionTrieRoot] = useState<
    TreeNode<PrepositionPiece, PrepositionQueryFragment>
  >(buildPrepositionTrie());

  const [unusedModifierCategories, setUnusedModifierCategories] = useState<
    Array<ModifierCategory>
  >(ALL_MODIFIER_CATEGORIES);

  const {
    precedingQueryPieces,
    queryFragment,
    numerics,
    onAutocompletion,
    ...autocompleteBarProps
  } = props;

  let autocompletions = [];
  let allowedModifierCategories = ALL_MODIFIER_CATEGORIES;

  // Check if previous query is a preposition
  let runOnPrepositions = true;
  if (precedingQueryPieces.length > 0) {
    const previousPiece = precedingQueryPieces[precedingQueryPieces.length - 1];
    if (isPrepositionPiece(previousPiece)) {
      allowedModifierCategories = previousPiece.allowedModifierCategories;
      runOnPrepositions = false;
    }
  }

  if (runOnPrepositions) {
    autocompletions = autocompletions.concat(
      prepositionTrieRoot.autocomplete(queryFragment.value)
    );
  }

  autocompletions = autocompletions.concat(
    modifierTrieRoot.autocomplete(
      queryFragment.value,
      // intersect allowedModifierCategories with unusedModifierCategories
      allowedModifierCategories.filter((category) =>
        unusedModifierCategories.includes(category)
      )
    )
  );

  myConsole.log("numerics: ", numerics)
  autocompletions = _insertNumbers(autocompletions, numerics)

  useEffect(() => {
    if (queryFragment.value.length > 0) {
      onAutocompletion(autocompletions);
    }
  }, [queryFragment.value]);

  useEffect(() => {
    let usedModifierCategories = [];
    for (const piece of precedingQueryPieces) {
      if (isModifierPiece(piece)) {
        usedModifierCategories.push(piece.category);
      }
    }
    setUnusedModifierCategories(
      ALL_MODIFIER_CATEGORIES.filter(
        (category) => !usedModifierCategories.includes(category)
      )
    );
  }, [precedingQueryPieces.length]);

  return (
    <AutocompleteBar
      {...autocompleteBarProps}
      validAutocompletes={autocompletions}
    />
  );
}
