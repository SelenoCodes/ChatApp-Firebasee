import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCC-Il0oXah44jILclF1krJLE0e05tQZMU",
  authDomain: "reactchat-64258.firebaseapp.com",
  projectId: "reactchat-64258",
  storageBucket: "reactchat-64258.appspot.com",
  messagingSenderId: "411798415508",
  appId: "1:411798415508:web:320c09a6512d59f3f32c81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)