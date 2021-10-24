import firebase from '../config';

export function isUserSignedIn(): boolean {
  return firebase.auth().currentUser != null;
}
