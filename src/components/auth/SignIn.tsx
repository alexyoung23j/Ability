import { shell } from 'electron';
import React, { useContext, useState } from 'react';

import useSession from '../../hooks/auth/useSession';
import { SIGN_IN_URL } from '../../constants/EnvConstants';
import { SessionContext, useFirebaseSignIn } from '../AllContextProvider';
import { IdTokenResult } from '@firebase/auth';
import firebase from '../../firebase/config';

interface CalendarAccount {
  calendarId: string;
  calendarAccessInfo: {
    access_token: string | null;
    // id_token: string | null;   <-- Not needed for now
    // login_hint: string | null; <-- Not needed for now
  };
}

export interface UserAuthInfo {
  uid: string;
  idTokenResult: Pick<
    firebase.auth.IdTokenResult,
    'authTime' | 'issuedAtTime' | 'signInProvider' | 'expirationTime'
  > & {
    //  This is the token from auth.IdTokenResult, but renamed for clarity
    firebaseToken: string;
  };
}

async function signInToFirebase(
  userAuthInfo: UserAuthInfo,
  onSignIn: () => void
) {
  if (userAuthInfo != null) {
    const { firebaseToken } = userAuthInfo.idTokenResult;
    try {
      // TODO(ABI-88): This doesn't work. We need to swap it out with a custom token through firebase-admin.
      await firebase.auth().signInWithCustomToken(firebaseToken);
      onSignIn();
    } catch (e) {
      console.log('Failed to sign in with custom token.');
      throw e;
    }
  }
}

export default function SignIn(): JSX.Element {
  const { setSignedInToFirebase } = useFirebaseSignIn();
  const sessionId = useContext(SessionContext);

  const [userId, setUserId] = useState<null | string>(null);

  // subscribe(
  //   `electronIdsToUserIds/${electronSessionId}`,
  //   async (userAuthInfo: UserAuthInfo) => {
  //     // signInToFirebase(userAuthInfo, () => {
  //     //   setSignedInToFirebase(true);
  //     // });
  //   }
  // );

  return (
    <button
      onClick={() => {
        shell.openExternal(`${SIGN_IN_URL}/${sessionId}`);
      }}
    >
      Sign In
    </button>
  );
}
