import firebase from './firebase/config';
import * as db from './db';
import assert from 'assert';
import { DateTime } from 'luxon';

interface AbilityUserInfo {
  uid: string;
  username: string | null;
  email: string;
  displayName: string | null;
  providerId: string;
  signUpDate: string;
}

interface CalendarAccount {
  calendarId: string;
  calendarAccessInfo: {
    access_token: string | null;
    // id_token: string | null;   <-- Not needed for now
    // login_hint: string | null; <-- Not needed for now
  };
  dateAdded: string;
}

interface UserAuthInfo {
  uid: string;
  idTokenResult: Pick<
    firebase.auth.IdTokenResult,
    'authTime' | 'issuedAtTime' | 'signInProvider' | 'expirationTime'
  > & {
    //  This is the token from auth.IdTokenResult, but renamed for clarity
    firebaseIdToken: string;
  };
}

export async function persistSessionIdToUserAuthInfo(
  sessionId: string,
  user: firebase.User
): Promise<void> {
  const { token, authTime, issuedAtTime, signInProvider, expirationTime } =
    await user.getIdTokenResult();

  await db.write<UserAuthInfo>('electronIdsToUserIds', sessionId, {
    uid: user.uid,
    idTokenResult: {
      firebaseIdToken: token,
      authTime,
      issuedAtTime,
      signInProvider,
      expirationTime,
    },
  });
}

export async function persistUserInfo(
  uid: string,
  firebaseUser: firebase.auth.UserCredential,
  googleUser: gapi.auth2.GoogleUser
): Promise<void> {
  const { user, additionalUserInfo } = firebaseUser;
  assert(
    user != null,
    'Cannot persist firebase user info with null firebase user'
  );
  const abilityUser: AbilityUserInfo = {
    uid: user.uid,
    username: additionalUserInfo?.username ?? null,
    email: user.email!,
    displayName: user.displayName,
    providerId: user.providerId,
    signUpDate: DateTime.now().toISO(),
  };

  const calendarId = googleUser.getBasicProfile().getEmail();
  const userCalendarAccount: CalendarAccount = {
    calendarId,
    calendarAccessInfo: {
      access_token: googleUser.getAuthResponse().access_token,
    },
    dateAdded: DateTime.now().toISO(),
  };

  await db.write('users', uid, abilityUser);
  await db.write(`users/${uid}/CalendarInfo`, calendarId, userCalendarAccount);
}

export async function getUidFromSessionId(
  sessionId: string
): Promise<string | null> {
  const out = await db.readOnce(`electronIdsToUserIds`, sessionId);

  if (out != 'Does not exist' && out.exists) {
    const data = out.data();

    if (data != null) {
      return data.uid;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function persistAdditionalCalendar(
  uid: string,
  googleUser: gapi.auth2.GoogleUser
) {
  const calendarId = googleUser.getBasicProfile().getEmail();
  const userCalendarAccount: CalendarAccount = {
    calendarId,
    calendarAccessInfo: {
      access_token: googleUser.getAuthResponse().access_token,
    },
    dateAdded: DateTime.now().toISO(),
  };

  await db.write(`users/${uid}/CalendarInfo`, calendarId, userCalendarAccount);
}

export function isSignedIn(): boolean {
  return firebase.auth().currentUser != null;
}

export function signOut(): void {
  firebase.auth().signOut();
}
