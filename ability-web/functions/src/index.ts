import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const serviceAccount = require('../../secrets/ability-317805-firebase-adminsdk-1a9rp-0a872a61ca.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ability-317805-default-rtdb.firebaseio.com',
});

interface CreateAuthTokenParams {
  electronSessionId: string;
  firebaseIdToken: string;
}

export const createAuthToken = functions.https.onCall(
  async (data: CreateAuthTokenParams, context): Promise<void> => {
    const electronSessionId = data.electronSessionId;
    const firebaseIdToken = data.firebaseIdToken;

    const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);

    const uid = decodedToken.uid;
    console.log(uid);

    const firebaseAuthToken = await admin.auth().createCustomToken(uid);
    console.log('Authentication token', firebaseAuthToken);
    await admin
      .firestore()
      .doc(`electronIdsToUserIds/${electronSessionId}`)
      .set({ firebaseAuthToken }, { merge: true });
  }
);

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
