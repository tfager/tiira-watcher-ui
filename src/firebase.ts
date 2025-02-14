import { initializeApp } from "firebase/app";
import {
  getAuth
} from "firebase/auth";

const envs = [ "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGE_SENDER_ID",
  "REACT_APP_FIREBASE_APP_ID" ]

for (const env of envs) {
  if (import.meta.env[env] == null) {
    throw new Error(env + " not defined")
  }
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.REACT_APP_FIREBASE_PROJECT,
  storageBucket: import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_MESSAGE_SENDER_ID,
  appId: import.meta.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth
};