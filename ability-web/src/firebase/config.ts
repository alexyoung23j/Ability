import firebase from 'firebase';
import 'firebase/auth';
import { config } from 'dotenv';
import 'firebase/firestore';

// TODO kedar: I think we can use .env.local instead of the .env file, and pass in the path as a param
config();

function initializeFirebaseApp() {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  firebase.functions().useEmulator("localhost", 5001);

}

initializeFirebaseApp();

export default firebase;
 