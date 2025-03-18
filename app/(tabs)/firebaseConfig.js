import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDxJPAcTuO_BO2339OnoJHUYS49YzvsA4E',
  authDomain: 'omnisense-1d992.firebaseapp.com',
  projectId: 'omnisense-1d992',
  storageBucket: 'omnisense-1d992.appspot.com',
  messagingSenderId: '930179210850',
  appId: '1:930179210850:web:db53a9592081bb8f773b3b'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, addDoc, collection };
