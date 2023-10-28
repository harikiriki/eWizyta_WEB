import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';

const app = firebase.initializeApp({
  apiKey: "AIzaSyCBPF9F9E1CEHCDGskDJz83B2TjRVZO4B8",
  authDomain: "ewizyta-f06e9.firebaseapp.com",
  databaseURL: "https://ewizyta-f06e9-default-rtdb.firebaseio.com",
  projectId: "ewizyta-f06e9",
  storageBucket: "ewizyta-f06e9.appspot.com",
  messagingSenderId: "666100992893",
  appId: "1:666100992893:web:52c3a6876bdd4cd64e9a14",
  measurementId: "G-VDJ073F4R1"
});

export const auth = app.auth();
export const database = app.database();
export const storage = app.storage();

export default app;
