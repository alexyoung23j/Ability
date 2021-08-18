import React, { useEffect, useState } from 'react';
import AutocompleteBar, { AutocompleteBarProps } from './AutocompleteBar';
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
  ALL_MODIFIER_CATEGORIES,
} from '../types';

var nodeConsole = require('console');
var myConsole = new nodeConsole.Console(process.stdout, process.stderr);

export interface BaseAutocompleteEngineProps extends AutocompleteBarProps {
  precedingQueryPieces: Array<Piece>;
  queryFragment: QueryFragment;
  dirtyQueryFragment: QueryFragment;
  updateRoot: (autocompletions: Array<Piece>) => void;
}

interface AutocompleteEngineProps extends BaseAutocompleteEngineProps {
  onAutocompletion: (autocompletions: Array<Piece>) => Array<Piece>;
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
    dirtyQueryFragment,
    updateRoot,
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

  autocompletions = onAutocompletion(autocompletions);

  useEffect(() => {
    if (queryFragment.value.length > 0) {
      updateRoot(autocompletions);
    }
  }, [dirtyQueryFragment.value]);

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
