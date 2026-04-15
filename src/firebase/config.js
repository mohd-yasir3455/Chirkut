import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA5Ar8JlFVDmDuTebH4wBN4xNsZjcjPdnU",
  authDomain: "chirkut-756fa.firebaseapp.com",
  databaseURL: "https://chirkut-756fa-default-rtdb.firebaseio.com",
  projectId: "chirkut-756fa",
  storageBucket: "chirkut-756fa.firebasestorage.app",
  messagingSenderId: "981689498740",
  appId: "1:981689498740:web:825666b552ff19e7dda521"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.log('Auth persistence error:', error);
});

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open - offline persistence disabled');
    } else if (err.code === 'uninitialized') {
      console.log('Database not initialized');
    }
  });
}

export { auth, db, app };
