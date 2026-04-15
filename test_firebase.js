// test_firebase.js - Simple Firebase connection test script
// Run with: node test_firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Load environment variables (assuming .env.local is in the same directory)
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');

// Test authentication
async function testAuth() {
  console.log('\n🔐 Testing Authentication...');

  try {
    // Sign in as admin
    console.log('Signing in as admin...');
    const adminEmail = process.env.VITE_ADMIN_EMAIL;
    const adminPassword = '112233445566778899'; // Replace with actual password

    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('✅ Admin signed in successfully:', userCredential.user.email);

    return userCredential.user;
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return null;
  }
}

// Test Firestore operations
async function testFirestore(user) {
  if (!user) {
    console.log('Skipping Firestore tests due to auth failure');
    return;
  }

  console.log('\n📊 Testing Firestore Operations...');

  try {
    // Add a test document
    console.log('Adding test document...');
    const docRef = await addDoc(collection(db, 'thankyou_entries'), {
      message: 'Test thank you message from script',
      from: 'Test Script',
      date: new Date(),
      isPaid: false,
      createdAt: new Date(),
    });
    console.log('✅ Document added with ID:', docRef.id);

    // Get all documents
    console.log('Fetching all documents...');
    const querySnapshot = await getDocs(collection(db, 'thankyou_entries'));
    console.log('✅ Found', querySnapshot.size, 'documents');

    querySnapshot.forEach((doc) => {
      console.log('Document:', doc.id, '=>', doc.data());
    });

    // Update the document
    console.log('Updating document...');
    await updateDoc(doc(db, 'thankyou_entries', docRef.id), {
      message: 'Updated test message',
      editedAt: new Date(),
    });
    console.log('✅ Document updated');

    // Delete the document (optional - comment out if you want to keep test data)
    console.log('Deleting test document...');
    await deleteDoc(doc(db, 'thankyou_entries', docRef.id));
    console.log('✅ Document deleted');

  } catch (error) {
    console.error('❌ Firestore error:', error.message);
  }
}

// Test config collection
async function testConfig() {
  console.log('\n⚙️ Testing Config Collection...');

  try {
    // Try to get config
    const querySnapshot = await getDocs(collection(db, 'config'));
    if (querySnapshot.empty) {
      console.log('No config documents found. Creating default config...');
      await addDoc(collection(db, 'config'), {
        totalThankyouCount: 0,
        createdAt: new Date(),
      });
      console.log('✅ Default config created');
    } else {
      querySnapshot.forEach((doc) => {
        console.log('Config:', doc.id, '=>', doc.data());
      });
    }
  } catch (error) {
    console.error('❌ Config error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Firebase Connection Tests...\n');

  const user = await testAuth();
  await testFirestore(user);
  await testConfig();

  // Sign out
  try {
    await signOut(auth);
    console.log('\n👋 Signed out successfully');
  } catch (error) {
    console.error('❌ Sign out error:', error.message);
  }

  console.log('\n🎉 Firebase tests completed!');
}

// Run the tests
runTests().catch(console.error);