import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyABiJ04vycDfAsa9ZMmMumLYxrYSyOnnm4",
  authDomain: "twiter-dos-chinos-61bec.firebaseapp.com",
  projectId: "twiter-dos-chinos-61bec",
  storageBucket: "twiter-dos-chinos-61bec.appspot.com",
  messagingSenderId: "1000314959337",
  appId: "1:1000314959337:web:01bd8039103654f7124778"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;