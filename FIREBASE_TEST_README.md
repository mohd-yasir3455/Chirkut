# Firebase Connection Test

This is a standalone test script to verify Firebase connectivity before integrating into the main React app.

## Setup Requirements

1. **Firebase Console Setup**:
   - Enable Email/Password authentication
   - Create user accounts for admin and friend emails
   - Ensure Firestore database exists

2. **Environment Variables**:
   - `.env.local` file should exist with Firebase config (already created)

3. **User Passwords**:
   - Update the `adminPassword` variable in `test_firebase.js` with the actual admin password from Firebase Console

## Running the Test

```bash
cd /home/yasir/Desktop/Project
node test_firebase.js
```

## What It Tests

- ✅ Firebase initialization
- ✅ Authentication (admin login)
- ✅ Firestore operations (CRUD on thankyou_entries)
- ✅ Config collection access
- ✅ Sign out

## Expected Output

You should see console logs for each step:
- Firebase initialization
- Successful admin sign-in
- Document creation, reading, updating, deletion
- Config operations
- Sign out

## Troubleshooting

- **Auth errors**: Check if Email/Password auth is enabled and user exists
- **Firestore errors**: Verify Firestore database exists and rules allow access
- **Environment errors**: Ensure `.env.local` has correct values

Once this test passes, we can integrate the Firebase logic into the main React app.