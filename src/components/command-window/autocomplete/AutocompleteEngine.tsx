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

export interface AutocompleteEngineProps extends AutocompleteBarProps {
  precedingQueryPieces: Array<Piece>;
  queryFragment: QueryFragment;
  setHandlingNumericInput: (val: boolean) => void;
  onAutocompletion: (autocompletions: Array<Piece>) => void;
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
