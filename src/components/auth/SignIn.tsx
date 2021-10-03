import { shell } from 'electron';
import React from 'react';

import useSession from '../../hooks/auth/useSession';
import { SIGN_IN_URL } from '../../constants/EnvConstants';

export default function SignIn(): JSX.Element {
  const { electronSessionId } = useSession();
  return (
    <button
      onClick={() => {
        shell.openExternal(`${SIGN_IN_URL}/${electronSessionId}`);
      }}
    >
      Sign In
    </button>
  );
}
