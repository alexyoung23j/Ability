import firebase from './firebase/config';
import 'firebase/firestore';

const db = firebase.firestore();

interface GetOptions {
  readonly source?: 'default' | 'server' | 'cache';
}

export async function readOnce(
  path: string,
  documentId: string,
  field?: string,
  options: GetOptions = {}
): Promise<
  | firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
  | 'Does not exist'
> {
  // TODO: What type does this return? Promise<V> not working
  const doc = db.collection(path).doc(documentId);

  return (await doc.get(options)) ?? 'Does not exist';
}

export async function write<V>(
  path: string,
  documentId: string,
  payload: V,
  options: { merge?: boolean } = { merge: true }
): Promise<void> {
  try {
    const doc = db.collection(path).doc(documentId);
    await doc.set(payload, options);
  } catch (e) {
    console.log(e);
    throw e;
  }
}
