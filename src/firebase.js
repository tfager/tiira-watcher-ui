import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBIB2TlVnnUe3jSAOzVYGM2mY8Imb72FXI",
  authDomain: "tiira-watcher-dev.firebaseapp.com",
  projectId: "tiira-watcher-dev",
  storageBucket: "tiira-watcher-dev.appspot.com",
  messagingSenderId: "670338205806",
  appId: "1:670338205806:web:2bd841cccd46e85ab9be7f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const logInWithEmailAndPassword = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  signOut(auth);
};

export {
  auth,
  logInWithEmailAndPassword,
  logout
};