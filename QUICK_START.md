# 🚀 Quick Start Guide

Get the Thank You Tracker running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- A Gmail account (for email notifications)
- A code editor (VS Code recommended)

## Step 1: Get Your Files Ready

1. Copy all the provided files into a project folder:
```
thank-you-tracker/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── firebase/
│   ├── utils/
│   ├── styles/
│   ├── main.jsx
│   └── App.jsx
├── functions/
│   ├── sendEmailNotification.js
│   ├── index.js
│   └── package.json
├── index.html
├── package.json
├── vite.config.js
├── firebase.json
├── firestore.rules
├── .env.example
├── SETUP_GUIDE.md
├── DEPLOYMENT_GUIDE.md
└── README.md
```

2. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

## Step 2: Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it: `thank-you-tracker`
4. Click **"Create project"**
5. Wait for setup to complete

## Step 3: Setup Firestore

1. In Firebase Console, click **"Firestore Database"**
2. Click **"Create Database"**
3. Select **"Start in production mode"**
4. Choose region closest to you (e.g., **us-central1**)
5. Click **"Create"**

## Step 4: Setup Authentication

1. Click **"Authentication"** in left menu
2. Click **"Get Started"**
3. Click **"Email/Password"** provider
4. Toggle **"Enable"** to ON
5. Click **"Save"**

## Step 5: Get Firebase Config

1. Click the **⚙️ (Settings)** icon in top-left
2. Click **"Project settings"**
3. Under "Your apps", click the **Web icon** (</>)
4. Copy the `firebaseConfig` object

Open `.env.local` and fill in:
```env
REACT_APP_FIREBASE_API_KEY=paste_apiKey
REACT_APP_FIREBASE_AUTH_DOMAIN=paste_authDomain
REACT_APP_FIREBASE_PROJECT_ID=paste_projectId
REACT_APP_FIREBASE_STORAGE_BUCKET=paste_storageBucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=paste_messagingSenderId
REACT_APP_FIREBASE_APP_ID=paste_appId
REACT_APP_FIREBASE_MEASUREMENT_ID=paste_measurementId
REACT_APP_ADMIN_EMAIL=your-email@gmail.com
REACT_APP_FRIEND_EMAIL=friend-email@gmail.com
```

## Step 6: Setup Cloud Functions (Email)

### Enable Blaze Plan (Free tier limit)

1. Go to Firebase Console
2. Click **"Upgrade"** button to upgrade to Blaze plan
3. This allows Cloud Functions (free tier covers most usage)

### Configure Email

1. Go to Gmail account settings:
   - [myaccount.google.com](https://myaccount.google.com)
   - Click **"Security"** in left menu
   - Enable **"2-Step Verification"** if not already enabled

2. Create App Password:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select **"Mail"** and your device type
   - Click **"Generate"**
   - Copy the 16-character password shown

3. Create `functions/.env.local`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=paste_the_16_char_password
ADMIN_EMAIL=your-email@gmail.com
FRIEND_EMAIL=friend-email@gmail.com
APP_URL=http://localhost:3000
```

## Step 7: Install Dependencies & Start Dev Server

```bash
# Install dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start development server
npm run dev
```

The app should open at `http://localhost:3000` 🎉

## Step 8: Create Admin User

1. Open your app at `http://localhost:3000`
2. The public view is visible without login
3. To access admin:
   - Go to Firebase Console → **Authentication**
   - Click **"Add user"** (the + button)
   - Use email from `.env.local` `REACT_APP_ADMIN_EMAIL`
   - Set a password (remember it!)
   - Click **"Add user"**

4. On the app, click the login link and sign in with this email/password

## Step 9: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This restricts database access to admin only.

## Step 10: Deploy Cloud Functions (Optional for now)

```bash
# Deploy functions for email notifications
firebase deploy --only functions
```

## Step 11: Test Everything!

### In Admin Dashboard:
1. Click **"✨ Add Entry"**
2. Fill in a thank you moment
3. Click **"✨ Add Entry"**
4. You should see it appear in the timeline with an animation!
5. Check email for notification (may take 30 seconds)

### Check Public View:
1. Open an incognito/private window
2. Go to `http://localhost:3000`
3. See the beautiful counter and timeline
4. Try searching and filtering entries

### Try Paid Page:
1. In Admin Dashboard, click **"💝 Paid"** in top menu
2. Click **"➕ Add Paid Entry"**
3. Add an entry that was paid back
4. Watch the progress bar update!

## 🎉 You're Done!

Your Thank You Tracker is running locally!

## Next Steps

### To Deploy Online:

**Option 1: Firebase Hosting**
```bash
npm run build
firebase deploy
```

**Option 2: Vercel**
```bash
npm install -g vercel
npm run build
vercel --prod
```

**Option 3: Netlify**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

### To Customize:

1. **Colors**: Edit `src/styles/globals.css` (CSS variables at top)
2. **Messages**: Edit helper functions in `src/utils/helpers.js`
3. **Layout**: Edit component styles in each `.jsx` file
4. **Features**: Add new components in `src/components/`

## Troubleshooting

### "Port 3000 already in use"
```bash
npm run dev -- --port 3001
```

### "Firebase config not found"
- Check `.env.local` exists and has all values
- Check values are copied exactly from Firebase Console

### "Emails not sending"
- Check Cloud Functions are deployed: `firebase deploy --only functions`
- Check function logs: `firebase functions:log`
- Verify Gmail app password is correct

### "Can't login as admin"
- Make sure user exists in Firebase Authentication
- Check email matches `REACT_APP_ADMIN_EMAIL` exactly
- Try logging out completely and back in

## Need Help?

1. Check **DEPLOYMENT_GUIDE.md** for detailed troubleshooting
2. Check **SETUP_GUIDE.md** for architecture overview
3. Look in browser DevTools Console (F12) for errors
4. Check Firebase Console logs and error messages

---

**You're all set! Enjoy celebrating those gratitude moments! 💝✨**
