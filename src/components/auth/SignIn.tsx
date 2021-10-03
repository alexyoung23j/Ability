import { shell } from 'electron';
import React, { useState } from 'react';

import useSession from '../../hooks/auth/useSession';
import { SIGN_IN_URL } from '../../constants/EnvConstants';
import { useFirebaseSignIn } from '../../App';
import { subscribe } from '../../firebase/db';
import { IdTokenResult } from '@firebase/auth';
import firebase from '../../firebase/config';

interface UserAuthInfo {
  uid: string;
  idTokenResult: Pick<
    IdTokenResult,
    'token' | 'authTime' | 'issuedAtTime' | 'signInProvider' | 'expirationTime'
  >;
}

export default function SignIn(): JSX.Element {
  const { electronSessionId } = useSession();
  const { setSignedInToFirebase } = useFirebaseSignIn();

  const [userId, setUserId] = useState<null | string>(null);

  subscribe(
    `electronIdsToUserIds/${electronSessionId}`,
    async (userAuthInfo: UserAuthInfo) => {
      if (userAuthInfo != null) {
        const { token } = userAuthInfo.idTokenResult;
        try {
          await firebase.auth().signInWithCustomToken(token);
          setSignedInToFirebase(true);
          debugger;
        } catch (e) {
          console.log('Failed to sign in with custom token.');
          throw e;
        }
      }
    }
  );

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
