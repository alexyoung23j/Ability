import React from 'react';
import { useState } from 'react';

export function RerenderButton(): JSX.Element {
  const [state, setState] = useState(0);
  return (
    <button
      onClick={() => {
        setState(state + 1);
      }}
    >
      Click me to re-render
    </button>
  );
}
