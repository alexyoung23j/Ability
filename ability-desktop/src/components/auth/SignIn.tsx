import { shell } from 'electron';
import React, { useContext } from 'react';

import { SIGN_IN_URL } from '../../constants/EnvConstants';
import { SessionContext } from '../AllContextProvider';
import firebase from '../../firebase/config';
import * as DatabaseUtil from 'firebase/DatabaseUtil';
import { isUserSignedIn } from '../../firebase/util/FirebaseUtil';

interface CalendarAccessInfo {
  accessToken: string;
  // id_token: string | null;   <-- Not needed for now
  // login_hint: string | null; <-- Not needed for now
}
export interface CalendarInfo {
  calendarId: string;
  calendarAccessInfo: CalendarAccessInfo;
  dateAdded: string;
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

interface SignInProps {
  onSignInComplete: () => void;
}

export default function SignIn({ onSignInComplete }: SignInProps): JSX.Element {
  const sessionId = useContext(SessionContext);

  DatabaseUtil.database
    .doc(`electronIdsToUserIds/${sessionId}`)
    .onSnapshot((doc: firebase.firestore.DocumentSnapshot<UserAuthInfo>) => {
      const userAuthInfo = doc.data() as UserAuthInfo | undefined;
      if (!isUserSignedIn() && userAuthInfo?.firebaseAuthToken != null) {
        console.log('Signing Electron Ability into Firebase');
        signInToFirebase(userAuthInfo, onSignInComplete);
      }
    });

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
