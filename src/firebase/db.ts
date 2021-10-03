import firebase from './config';

export async function write<V>(key: string, value: V): Promise<void> {
  const database = firebase.database();
  try {
    await database.ref(key).set(value);
  } catch (e) {
    console.log(`Error writing to database: ${key}: ${value}`);
    throw e;
  }
}

export async function readOnce(key: string): Promise<any | 'Does not exist'> {
  const database = firebase.database();

  const snapshot = await database.ref(key).get();
  try {
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return 'Does not exist.';
    }
  } catch (e) {
    console.log(`Failed to fetch ${key}`);
    throw e;
  }
}

/**
 * Sets up subscription to a key in firebase.
 * Triggers callback on value change.
 *
 * Returns value at time of subscription.
 */
export function subscribe<V>(
  key: string,
  callback: (newValue: V) => void
  // TODO: think about unsubscribing
  // TODO: think about what happens when the key gets deleted from the db completely
): void {
  const ref = firebase.database().ref(key);

  ref.on('value', (snapshot: firebase.database.DataSnapshot) => {
    callback(snapshot.val());
  });
}
