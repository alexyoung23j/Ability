import CSS from 'csstype';
import React from 'react';
import AutocompleteItem from './AutocompleteItem';
import { Piece } from './types';

export interface AutocompleteBarProps {
  validAutocompletes: Array<Piece>;
  highlightedIdx: number;
  autocompleteInProgress: boolean;
  clickHandler: any;
  hoverHandler: any;
}

export default function AutocompleteBar(props: AutocompleteBarProps) {
  // props
  const validAutocompletes = props.validAutocompletes;
  const highlightedIdx = props.highlightedIdx;
  const autocompleteInProgress = props.autocompleteInProgress;

  // Callbacks
  const clickHandler = props.clickHandler;
  const hoverHandler = props.hoverHandler;

  if (autocompleteInProgress && validAutocompletes.length > 0) {
    return (
      <div style={autocompleteStyle}>
        {validAutocompletes.map((piece, idx) => (
          <div key={idx}>
            <AutocompleteItem
              value={piece.value}
              highlight={idx === highlightedIdx ? true : false}
              clickHandler={clickHandler}
              hoverHandler={hoverHandler}
              index={idx}
            />
          </div>
        ))}
        <div style={{ height: '8px' }}></div>
      </div>
    );
  } else {
    return <div></div>;
  }
}

const autocompleteStyle: CSS.Properties = {
  marginBottom: '8px',
  marginTop: '2px',
};
