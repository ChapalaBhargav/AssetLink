import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCgmvTU49on-qPJ0B9eKDrYljYT67nBPTs",
  authDomain: "newasset-d3f3a.firebaseapp.com",
  projectId: "newasset-d3f3a",
  storageBucket: "newasset-d3f3a.firebasestorage.app",
  messagingSenderId: "480011427565",
  appId: "1:480011427565:web:a25a61ec14b480a31236e4",
  measurementId: "G-7Y8KPJ99LM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  query,
  where,
  orderBy,
  addDoc,
};
