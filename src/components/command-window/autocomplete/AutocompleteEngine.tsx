import React, { useEffect, useState } from 'react';
import AutocompleteBar, { AutocompleteBarProps } from './AutocompleteBar';
import { ALL_MODIFIER_CATEGORIES } from '../constants';
import {
  buildModifierTrie,
  buildPrepositionTrie,
  CategoryFilters,
  isPrepositionPiece,
  ModifierPiece,
  ModifierQueryFragment,
  Piece,
  PrepositionPiece,
  PrepositionQueryFragment,
  QueryFragment,
  TreeNode,
} from '../TreeNode';

export interface AutocompleteEngineProps extends AutocompleteBarProps {
  precedingQueryPieces: Array<Piece>;
  queryFragment: QueryFragment;
  onAutocompletion: (autocompletions: Array<Piece>) => void;
}

export default function AutocompleteEngine(props: AutocompleteEngineProps) {
  const [modifierTrieRoot] = useState<
    TreeNode<ModifierPiece, ModifierQueryFragment>
  >(buildModifierTrie());
  const [prepositionTrieRoot] = useState<
    TreeNode<PrepositionPiece, PrepositionQueryFragment>
  >(buildPrepositionTrie());

  const {
    precedingQueryPieces,
    queryFragment,
    onAutocompletion,
    ...autocompleteBarProps
  } = props;

  let allowedModifierCategories: CategoryFilters = ALL_MODIFIER_CATEGORIES;

  // Check if previous query is a preposition
  if (precedingQueryPieces.length > 0) {
    const previousPiece = precedingQueryPieces[precedingQueryPieces.length - 1];
    if (isPrepositionPiece(previousPiece)) {
      allowedModifierCategories = previousPiece.allowedModifierCategories;
    }
  }
  // Check if query already contains a modifier

  const autocompletions = modifierTrieRoot.autocomplete(
    { ...queryFragment } as ModifierQueryFragment,
    allowedModifierCategories
  );

  useEffect(() => {
    onAutocompletion(autocompletions);
  }, [queryFragment.value]);

  return (
    <AutocompleteBar
      {...autocompleteBarProps}
      validAutocompletes={autocompletions}
    />
  );
}
