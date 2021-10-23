import { shell } from 'electron';
import React, { useContext, useState } from 'react';

import { SIGN_IN_URL } from '../../constants/EnvConstants';
import { SessionContext, useFirebaseSignIn } from '../AllContextProvider';
import firebase from '../../firebase/config';
import { db } from '../../firebase/db';

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
  firebaseAuthToken?: string;
}

async function signInToFirebase(
  { firebaseAuthToken }: UserAuthInfo,
  onSignIn: () => void
) {
  if (firebaseAuthToken != null) {
    try {
      await firebase.auth().signInWithCustomToken(firebaseAuthToken);
      onSignIn();
    } catch (e) {
      console.log('Failed to sign in with custom token.');
      throw e;
    }
  }
}

export default function SignIn(): JSX.Element {
  const { isSignedInToFirebase, setIsSignedInToFirebase } = useFirebaseSignIn();
  const sessionId = useContext(SessionContext);

  const [userId, setUserId] = useState<null | string>(null);

  db.doc(`electronIdsToUserIds/${sessionId}`).onSnapshot(
    (doc: firebase.firestore.DocumentSnapshot<UserAuthInfo>) => {
      const userAuthInfo = doc.data() as UserAuthInfo | undefined;
      if (!isSignedInToFirebase && userAuthInfo?.firebaseAuthToken != null) {
        signInToFirebase(userAuthInfo, () => {
          setIsSignedInToFirebase(true);
        });
      }
    }
  );

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
