import { assert } from 'components/util/assert';
import firebase from '../config';

export function isUserSignedIn(): boolean {
  return firebase.auth().currentUser != null;
}

/**
 * Returns the current logged in user.
 *
 * If user is null, function will throw.
 */
export function getCurrentUser(): firebase.User {
  const { currentUser } = firebase.auth();
  assert(
    currentUser != null,
    'Tried to load current user without being logged in.'
  );
  return currentUser;
}

/**
 * Returns the current logged in user, null if not logged in.
 */
export function maybeGetCurrentUser(): firebase.User | null {
  return firebase.auth().currentUser;
}
