import React from 'react';

import AutocompleteEngine, {
  AutocompleteEngineProps,
} from './autocomplete/AutocompleteEngine';
import ResultEngine from './results-display/ResultEngine';

// Toggle Lower Field Component (Leave here to avoid annoying problems with how the directory is structured)
interface ToggleLowerFieldProps extends AutocompleteEngineProps {
  finalQueryLaunched: boolean;
}

export default function ToggleLowerField(props: ToggleLowerFieldProps) {
  const { finalQueryLaunched, ...autocompleteEngineProps } = props;
  return (
    (props.finalQueryLaunched && <ResultEngine />) || (
      <AutocompleteEngine {...autocompleteEngineProps} />
    )
  );
}
