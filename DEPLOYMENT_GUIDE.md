# Deployment & Troubleshooting Guide

## 📚 Table of Contents
1. [Firebase Setup](#firebase-setup)
2. [Local Development](#local-development)
3. [Deployment](#deployment)
4. [Email Configuration](#email-configuration)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "Thank You Tracker"
4. Enable Google Analytics (optional)
5. Create the project

### Step 2: Setup Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Select **Start in production mode**
4. Choose region: **us-central1** (or closest to you)
5. Create Database

### Step 3: Setup Authentication

1. Go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. Disable "Passwordless sign-in" (optional)

### Step 4: Setup Cloud Functions

1. Go to **Functions** in Firebase Console
2. Click **Get Started** (may require upgrading to Blaze plan)
3. Wait for setup to complete

### Step 5: Get Firebase Configuration

1. Go to **Project Settings** (⚙️ icon)
2. Under "Your apps", click web icon (</> )
3. Copy the Firebase config
4. Create `.env.local` in project root and paste values:

```
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx
REACT_APP_FIREBASE_MEASUREMENT_ID=xxx
REACT_APP_ADMIN_EMAIL=your-email@gmail.com
REACT_APP_FRIEND_EMAIL=friend-email@gmail.com
```

---

## Local Development

### Step 1: Install Dependencies

```bash
# Install main dependencies
npm install

# Install function dependencies
cd functions
npm install
cd ..
```

### Step 2: Initialize Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
# Select: Firestore, Functions, Hosting
# Choose your project
# Choose JavaScript for functions
# ESLint: No
# Install dependencies: Yes
```

### Step 3: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Step 4: Deploy Cloud Functions (optional for local testing)

```bash
firebase deploy --only functions
```

Or use emulator for local testing:
```bash
firebase emulators:start
```

### Step 5: Start Development Server

```bash
npm run dev
```

App will open at `http://localhost:3000`

---

## Email Configuration

### Using Gmail

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Select "Security"
   - Enable 2-Step Verification

2. **Create App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Generate password (it will be 16 characters)
   - Copy this password

3. **Configure Cloud Functions**:
   - Create a `.env.local` file in `functions/` directory:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=your-16-char-app-password
   ADMIN_EMAIL=your-email@gmail.com
   FRIEND_EMAIL=friend-email@gmail.com
   ```

### Using SendGrid (Alternative)

1. Create account at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Replace nodemailer with SendGrid in `sendEmailNotification.js`:

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// In email sending:
await sgMail.send({
  to: `${ADMIN_EMAIL}, ${FRIEND_EMAIL}`,
  from: ADMIN_EMAIL,
  subject: 'Thank You Notification',
  html: emailHTML,
});
```

---

## Deployment

### Deploy to Firebase Hosting

```bash
# Build the app
npm run build

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# For production (after testing)
netlify deploy --prod
```

---

## Troubleshooting

### Firebase Issues

#### "Permission denied" errors
**Solution**: Check Firestore rules
```bash
firebase deploy --only firestore:rules
```

Verify rules allow your operations:
- Admin email in rules matches REACT_APP_ADMIN_EMAIL
- Read/write permissions are correct

#### "Function not found" for email notifications
**Solution**: Deploy Cloud Functions
```bash
firebase deploy --only functions
```

Check function logs:
```bash
firebase functions:log
```

#### Real-time updates not working
**Solution**: 
1. Check Firestore is initialized
2. Verify collection names match exactly
3. Check browser console for errors
4. Try clearing browser cache

### Email Issues

#### Emails not sending
**Check List**:
- ✅ Cloud Functions deployed (`firebase deploy --only functions`)
- ✅ Gmail credentials are correct (test with `firebase emulators:start`)
- ✅ Gmail account has 2FA enabled
- ✅ App Password (not regular password) is used
- ✅ `GMAIL_USER` and `GMAIL_PASSWORD` in Cloud Functions environment

**Check Function Logs**:
```bash
firebase functions:log
```

#### "ENOTFOUND sendgrid.com" or nodemailer errors
**Solution**:
1. Check internet connection
2. Verify email provider API keys in environment variables
3. Ensure functions have network access
4. Check Firebase Cloud Functions Blaze plan is active

### Authentication Issues

#### "Unauthorized: Admin access only"
**Solution**:
- Verify `REACT_APP_ADMIN_EMAIL` matches Firebase Auth email exactly
- Check email has no leading/trailing spaces
- Confirm user is created in Firebase Authentication

#### Can't login
**Solution**:
1. Create user in Firebase Console:
   - Go to Authentication → Users
   - Click "Add user"
   - Use admin email and password
2. Try login with exact email/password
3. Check browser console for error messages

### Performance Issues

#### Slow page loads
**Solution**:
1. Check Network tab in DevTools
2. Optimize images
3. Enable code splitting (already done in vite.config.js)
4. Check Firestore queries are indexed

#### Animations lag
**Solution**:
- Reduce confetti particle count in ConfettiEffect.jsx
- Use `transform` instead of `top/left` for animations
- Check GPU acceleration is enabled

---

## FAQ

### Q: How do I reset the total count?
**A**: Go to Admin Dashboard → "Adjust Count" button and set the exact value you want.

### Q: Can I use this for multiple friends?
**A**: Currently designed for one friend. To extend:
1. Create separate Firestore collections per friend
2. Add friend selector in UI
3. Store friend email in entry data

### Q: How do I backup my data?
**A**: Use Firestore Export
1. Go to Firestore Database
2. Click the three dots menu
3. Select "Export collections"
4. Save to Google Cloud Storage

### Q: How do I delete an entry?
**A**: 
- Go to Admin Dashboard
- In timeline, click "🗑️ Delete" button next to entry
- Confirm deletion
- Count will be automatically adjusted

### Q: Can I change the colors?
**A**: Yes! Edit CSS variables in `src/styles/globals.css`:
```css
:root {
  --primary-blush: #FFB5D8; /* Change these colors */
  --primary-lavender: #E8D4F8;
  /* ... etc */
}
```

### Q: How do I share this with my friend?
**A**: 
1. Deploy the app to a public URL
2. Share the home page URL with your friend
3. They can view the tracker as a read-only visitor
4. Admin page requires login (you only)

### Q: What if I forget the admin password?
**A**: 
1. Go to Firebase Console → Authentication
2. Click the user with admin email
3. Click the three dots → Delete user
4. Recreate the user with a new password
5. Sign out and sign back in

### Q: Can I export the data as PDF?
**A**: Not built-in, but you can:
1. Use browser's Print to PDF (Ctrl+P)
2. Or install a library like `jspdf` and `html2canvas`
3. Add an export button in Admin Dashboard

### Q: How do I increase the confetti particles?
**A**: Edit `src/components/ConfettiEffect.jsx`:
```javascript
<Confetti
  numberOfPieces={150} // Increase this number
  // ...
/>
```

### Q: Can I add photos to entries?
**A**: Yes! Extend the schema:
1. Add Firebase Storage
2. Add file upload to AddEntryForm
3. Store image URL in Firestore entry
4. Display in TimelineView component

---

## Support

If you encounter issues:
1. Check the logs: `firebase functions:log`
2. Look in browser DevTools Console (F12)
3. Check Firestore Database → Data to verify collection structure
4. Verify all environment variables are set correctly

Good luck! 💝✨
