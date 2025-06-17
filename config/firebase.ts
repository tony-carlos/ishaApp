import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBwkf7JNnzP2PZIsmj_mEGG3fnlSIV2xV0",
  authDomain: "ishercare.firebaseapp.com",
  projectId: "ishercare",
  storageBucket: "ishercare.firebasestorage.app",
  messagingSenderId: "187723990727",
  appId: "1:187723990727:web:0b3a2f4f04b0bb38d020e2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);