import { initializeApp } from "firebase/app";
import {
  getAuth
} from "firebase/auth";

const apiKey = process.env.REACT_APP_FIREBASE_API_KEY
if (apiKey == null) {
  throw new Error("REACT_APP_FIREBASE_API_KEY not defined")
}
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "tiira-watcher-dev.firebaseapp.com",
  projectId: "tiira-watcher-dev",
  storageBucket: "tiira-watcher-dev.appspot.com",
  messagingSenderId: "670338205806",
  appId: "1:670338205806:web:2bd841cccd46e85ab9be7f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {
  auth
};