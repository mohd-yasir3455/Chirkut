# Thank You Tracker - Setup Guide

A beautiful, emotional web app to celebrate and track "thank you" moments with animation, email notifications, and a cute soft UI.

## 🎨 Design Philosophy

**Aesthetic**: Soft, playful, emotional, modern
- **Color Palette**: Pastel blush (#FFB5D8), cream (#FFF8F0), soft lavender (#E8D4F8), mint (#D4F8E8), peachy (#FFE8D6)
- **Typography**: Elegant serif headers + modern rounded sans-serif body
- **Effects**: Glassmorphism, smooth animations, confetti on celebrations
- **Feel**: Like a digital scrapbook of gratitude

## 🏗️ Project Structure

```
thank-you-tracker/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AddEntryForm.jsx
│   │   │   ├── EditEntryModal.jsx
│   │   │   ├── EntryList.jsx
│   │   │   └── ManualCountAdjuster.jsx
│   │   ├── Public/
│   │   │   ├── PublicView.jsx
│   │   │   ├── TimelineView.jsx
│   │   │   └── CounterAnimation.jsx
│   │   ├── PaidPage.jsx
│   │   ├── Navigation.jsx
│   │   ├── ConfettiEffect.jsx
│   │   └── LoadingState.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useFirestore.js
│   │   └── useAuth.js
│   ├── firebase/
│   │   ├── config.js
│   │   └── firestore.js
│   ├── styles/
│   │   └── globals.css
│   ├── pages/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   └── PaidThankYous.jsx
│   └── utils/
│       ├── animations.js
│       └── helpers.js
├── functions/
│   ├── sendEmailNotification.js
│   └── index.js
├── firestore.rules
├── .env.example
├── package.json
└── firebase.json
```

## 📋 Setup Steps

### 1. Firebase Project Setup
- Create a new Firebase project in [Firebase Console](https://console.firebase.google.com)
- Enable Firestore Database (US region recommended)
- Enable Authentication (Email/Password)
- Create a service account for Cloud Functions
- Enable Cloud Functions (Blaze plan required for email)

### 2. Install Dependencies
```bash
npm install
npm install firebase react-router-dom framer-motion react-confetti axios
npm install --save-dev tailwindcss
```

### 3. Environment Configuration
Create `.env.local`:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
REACT_APP_ADMIN_EMAIL=your_email@example.com
REACT_APP_FRIEND_EMAIL=friend_email@example.com
```

### 4. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### 6. Start Development
```bash
npm start
```

## 🔐 Firebase Collections Schema

### Collection: `thankyou_entries`
```javascript
{
  id: "unique_id",
  title: "What I'm thankful for",
  description: "Detailed description",
  date: Timestamp,
  countAdded: 5,
  createdAt: Timestamp,
  editedAt: Timestamp,
  isSpecial: boolean  // For highlighting important events
}
```

### Collection: `paid_entries`
```javascript
{
  id: "unique_id",
  title: "What was paid back",
  date: Timestamp,
  countDeducted: 3,
  createdAt: Timestamp,
  notes: "optional notes"
}
```

### Collection: `config`
```javascript
{
  totalThankyouCount: 150,
  lastUpdated: Timestamp
}
```

## 🔑 Authentication Flow

- **Admin Login**: Email/Password authentication
- **Public Access**: Read-only access without login (using Firestore rules)
- **Admin Check**: Verify email matches REACT_APP_ADMIN_EMAIL

## 📧 Email Notification

Cloud Function triggers on:
1. New entry added → Admin & friend receive notification
2. Count increased → Both receive update
3. Paid entry recorded → Both receive deduction notification

## 🚀 Key Features

✅ Real-time Firestore sync
✅ Smooth count animations
✅ Confetti celebration effects
✅ Email notifications via Cloud Functions
✅ Admin dashboard with full CRUD
✅ Beautiful glassmorphic UI
✅ Mobile responsive
✅ Timeline view with date grouping
✅ Paid thank yous tracking
✅ Search/filter functionality
✅ Special event highlighting

## 📱 Responsive Breakpoints

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## 🎯 Color Variables (CSS)

```css
--primary-blush: #FFB5D8;
--primary-cream: #FFF8F0;
--primary-lavender: #E8D4F8;
--primary-mint: #D4F8E8;
--primary-peach: #FFE8D6;
--accent-gold: #FFD700;
--text-primary: #2D2D2D;
--text-secondary: #6B6B6B;
```

## 🔒 Security Notes

- Firestore Rules restrict write access to admin only
- Cloud Functions validate admin status before sending emails
- Email addresses stored in environment variables
- No sensitive data exposed in frontend code

## 📦 Deployment

**Frontend**: Deploy to Firebase Hosting or Vercel
**Cloud Functions**: Deployed via Firebase CLI

```bash
firebase deploy
```

## 🐛 Troubleshooting

- **Emails not sending**: Check Cloud Functions logs and email credentials
- **Real-time updates not working**: Verify Firestore rules
- **Authentication issues**: Clear browser cache and check email in .env
- **Animations lagging**: Reduce particle count in confetti component

## 💡 Future Enhancements

- PDF export functionality
- Monthly/yearly analytics
- Share thank you entries with others
- Dark mode toggle
- Custom themes
- Recurring thank yous
- Rich text editor for entries
- Photo uploads for entries

---

**Need help?** Check Firebase Console for error logs and Cloud Functions execution details.
