import { useCallback, useEffect, useState } from 'react';
import { useInitializedGoogleAuthClient } from './GoogleAuthSetup';
import Loading from './ui/Loading';
import firebase from './firebase/config';
import assert from 'assert';
import * as AuthDAO from './AuthDAO';
import { useParams } from 'react-router-dom';
import { RouteParams } from './App';

const SIGN_IN_CONFIG: gapi.auth2.SigninOptions = {
  scope: 'https://www.googleapis.com/auth/calendar',
  prompt: 'select_account',
  ux_mode: 'popup',
};

export interface SignInUrlParams {
  // electron session id
  code: string;
}

async function runAsyncWithAnonymousUser(asyncCallback: () => Promise<void>) {
  await firebase.auth().signInAnonymously();
  await asyncCallback();
  await firebase.auth().currentUser?.delete();
}

async function signInWithGapi(
  authInstance: gapi.auth2.GoogleAuth
): Promise<gapi.auth2.GoogleUser> {
  return await authInstance.signIn(SIGN_IN_CONFIG);
}

/**
 * Provided a google user from sign-in with GAPI, returns a firebase UserCredential.
 *
 * Note that this functions performs a sign-in and a sign-out of this firebase user, so it should only be called if no one is signed in currently.
 */
async function getFirebaseUserCredentialUsingGoogleUser(
  googleUser: gapi.auth2.GoogleUser
): Promise<firebase.auth.UserCredential> {
  // TODO: Assert that no one is signed when this function gets called
  const firebaseUser = signInWithFirebaseUsingGoogleUser(googleUser);
  await firebase.auth().signOut();

  return firebaseUser;
}

/**
 * Provided a google user from sign-in with GAPI, this function signs you into firebase and returns a firebase UserCredential.
 */
async function signInWithFirebaseUsingGoogleUser(
  googleUser: gapi.auth2.GoogleUser
): Promise<firebase.auth.UserCredential> {
  const credential = firebase.auth.GoogleAuthProvider.credential(
    googleUser.getAuthResponse().id_token
  );

  return await firebase.auth().signInWithCredential(credential);
}

async function triggerUserAuthentication(
  authInstance: gapi.auth2.GoogleAuth,
  sessionId: string,
  routeParams: RouteParams
) {
  // Need to perform Gapi sign in for all the routes
  const googleUser = await signInWithGapi(authInstance);

  switch (routeParams) {
    case (RouteParams.NEW_USER_SIGN_IN, RouteParams.RETURN_USER_SIGN_IN):
      // Firebase sign in needed here
      const firebaseUserCredential =
        await getFirebaseUserCredentialUsingGoogleUser(googleUser);
      const { user } = firebaseUserCredential;

      assert(
        user != null,
        'Found null firebase user after GAPI and Firebase sign-in.'
      );

      runAsyncWithAnonymousUser(async () => {
        // Write sessionId --> User Auth Info
        await AuthDAO.persistSessionIdToUserAuthInfo(sessionId, user);

        // TODO: Note that this can be skipped for existing users.
        // Write User Id --> User + Calendar Info
        await AuthDAO.persistUserInfo(
          firebaseUserCredential.user!.uid,
          firebaseUserCredential,
          googleUser
        );

        // Write sessionId --> firebase auth token
        try {
          const { token } = await user.getIdTokenResult();
          const createAuthToken = firebase
            .functions()
            .httpsCallable('createAuthToken');
          createAuthToken({
            electronSessionId: sessionId,
            firebaseIdToken: token,
          });
        } catch (e) {
          // fuk
        }
      });

      // ------------------------------ Trigger auth cloud function ------------------------------------------------------------

      break;
    case RouteParams.ADD_CALENDAR:
      const firebaseUid = await AuthDAO.getUidFromSessionId(sessionId);

      assert(firebaseUid != null, 'No uid associated with this electron id.');

      runAsyncWithAnonymousUser(async () => {
        // TODO: Note that this can be skipped for existing users.
        await AuthDAO.persistAdditionalCalendar(firebaseUid, googleUser);
      });

      break;
    default:
  }
}

interface AuthenticateAccountProps {
  routeParams: RouteParams;
}

export function AuthenticateAccount(
  props: AuthenticateAccountProps
): JSX.Element {
  const { routeParams } = props;

  const { code: sessionId } = useParams<SignInUrlParams>();
  const { authInstance } = useInitializedGoogleAuthClient();
  const [hasUserBeenAuthenticated, setHasUserBeenAuthenticated] =
    useState<boolean>(false);

  const effect = useCallback(
    async (authInstance: gapi.auth2.GoogleAuth | null, sessionId: string) => {
      if (authInstance != null && !AuthDAO.isSignedIn()) {
        await triggerUserAuthentication(authInstance, sessionId, routeParams);
        setHasUserBeenAuthenticated(true);
      }
    },
    [setHasUserBeenAuthenticated]
  );

  // Trigger Sign-in automatically
  useEffect(() => {
    effect(authInstance, sessionId);
  }, [authInstance, sessionId]);

  // Generic Loading Screen (used for all routes)
  if (!authInstance) {
    return <Loading />;
  }

  // Route Specific Renders

  switch (routeParams) {
    case RouteParams.NEW_USER_SIGN_IN:
      // TODO: Build proper new user UI + onboarding flow
      return (
        <div>
          <button onClick={() => AuthDAO.signOut()}> Sign Out </button>
          {(hasUserBeenAuthenticated && "You're authentic!!") ||
            'Logging you in...'}
        </div>
      );

    case RouteParams.ADD_CALENDAR:
      // TODO: Build proper add calendar UI
      return (
        <div>
          <button onClick={() => AuthDAO.signOut()}> Sign Out </button>
          {(hasUserBeenAuthenticated && 'Added Calendar!!') ||
            'Connecting to your calendar..'}
        </div>
      );

    case RouteParams.RETURN_USER_SIGN_IN:
      // TODO: Buld proper ui for return sign in (no onboarding flow probably)
      return (
        <div>
          <button onClick={() => AuthDAO.signOut()}> Sign Out (again)</button>
          {(hasUserBeenAuthenticated && "You're authentic (again 😊)!!") ||
            'Logging you in (again 🙄)...'}
        </div>
      );

    default:
      return <div></div>;
  }
}
