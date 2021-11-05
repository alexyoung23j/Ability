import firebase from './config';
import 'firebase/firestore';

export const database = firebase.firestore();

interface GetOptions {
  readonly source?: 'default' | 'server' | 'cache';
}

export const DOES_NOT_EXIST = 'Does not exist';

export async function readOnce(
  path: string,
  documentId: string,
  field?: string,
  options: GetOptions = {}
): Promise<
  | firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>
  | typeof DOES_NOT_EXIST
> {
  // TODO: What type does this return? Promise<V> not working
  const doc = database.collection(path).doc(documentId);

  return (await doc.get(options)) ?? DOES_NOT_EXIST;
}

export async function write<V>(
  path: string,
  documentId: string,
  payload: V
): Promise<void> {
  try {
    const doc = database.collection(path).doc(documentId);
    await doc.set(payload);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// TODO: verify we dont' need this
// export async function writeIfDoesNotExist<V>(
//   collectionPath: string,
//   documentId: string,
//   payload: V
// ): Promise<void> {
//   if ((await readOnce(collectionPath, documentId)) === DOES_NOT_EXIST) {
//     write<V>(collectionPath, documentId, payload);
//   }
// }
