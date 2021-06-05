import React from 'react';
import AutocompleteEngine, {
  AutocompleteEngineProps,
} from './autocomplete/AutocompleteEngine';
import { isNumeric } from './QueryUtil';
import { QueryFragment } from './TreeNode';

const FULL_NUMERIC = new RegExp('[0-9]+');

const CONTAINS_NUMERIC = new RegExp('.*[0-9]*.*');

const TIME = new RegExp('[0-9]?[0-9]:[0-9][0-9]');

interface ParserProps extends AutocompleteEngineProps {}

function _validateInput({ value }: QueryFragment): boolean {
  // Empty input gets handled by AutocompleteEngine
  if (value.length === 0) {
    return true;
  }

  if (FULL_NUMERIC.test(value)) {
  }
}

export default function Parser(props: ParserProps) {
  const { queryFragment } = props;

  const { value } = queryFragment;

  if (value.length > 0 && isNumeric(value[0])) {
    //   Parse value here and choose what to render?
  } else {
    return <AutocompleteEngine {...props} />;
  }
}
