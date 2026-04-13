# ✨ Thank You Tracker

A beautiful, modern web application to track and celebrate "thank you" moments with your special someone. Built with React, Firebase, and adorned with smooth animations and a soft, pastel aesthetic.

![Version](https://img.shields.io/badge/version-1.0.0-pink)
![License](https://img.shields.io/badge/license-MIT-blush)
![Status](https://img.shields.io/badge/status-ready-success)

## 🎨 Features

### For the Admin (You)
- ✅ **Add Thank You Entries**: Create moments with title, description, date, and point count
- ✅ **Edit & Delete**: Modify or remove entries anytime
- ✅ **Manual Count Adjustment**: Override the total count when needed
- ✅ **Email Notifications**: Both you and your friend get notified of new entries and updates
- ✅ **Special Highlights**: Mark important moments to stand out in the timeline
- ✅ **Admin Dashboard**: Beautiful, intuitive interface for managing everything

### For Your Friend (User)
- 📖 **Beautiful Timeline**: See all thank you moments in chronological order
- 📊 **Animated Counter**: Watch the total count with smooth animations
- 🔍 **Search & Filter**: Find specific moments easily
- 📱 **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- 🎉 **Month Grouping**: Entries organized by month for easy browsing

### For Both
- 💝 **Paid Thank Yous Page**: Track thank yous that have been repaid
- 📈 **Progress Visualization**: See progress with beautiful progress bars
- 🎁 **Celebration Effects**: Confetti animations when entries are added
- 📧 **Email Updates**: Get notified about new entries and changes
- 🎨 **Soft UI Design**: Pastel colors, glassmorphism, and smooth animations

## 🏗️ Tech Stack

**Frontend**
- ⚛️ React 18
- 🎬 Framer Motion (animations)
- 🧭 React Router (routing)
- 🎨 CSS-in-JS with design tokens

**Backend**
- 🔥 Firebase Firestore (database)
- 🔐 Firebase Authentication
- ☁️ Cloud Functions (serverless)

**Features**
- 💌 Email notifications via Nodemailer
- 🎉 Confetti celebrations
- 📊 Real-time data sync
- 🔍 Search & filtering
- 📱 Fully responsive

## 🚀 Quick Start

### 1. Clone & Setup
```bash
# Install dependencies
npm install

# Create .env.local (copy from .env.example)
cp .env.example .env.local
```

### 2. Configure Firebase
1. Create project at [firebase.google.com](https://firebase.google.com)
2. Add Firestore Database
3. Enable Email/Password Authentication
4. Copy config to `.env.local`

### 3. Setup Email
1. Enable 2FA on your Gmail account
2. Create App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Add to `functions/.env.local`

### 4. Run Locally
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

**For detailed setup, see [QUICK_START.md](./QUICK_START.md)**

## 📁 Project Structure

```
thank-you-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── Admin/          # Admin dashboard components
│   │   ├── Public/         # Public view components
│   │   └── *.jsx           # Shared components
│   ├── context/            # React Context (Auth)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── firebase/           # Firebase config
│   ├── utils/              # Helper functions
│   ├── styles/             # Global styles
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── functions/              # Cloud Functions
│   ├── sendEmailNotification.js
│   ├── index.js
│   └── package.json
├── index.html              # HTML template
├── firebase.json           # Firebase config
├── firestore.rules         # Firestore security rules
├── vite.config.js          # Vite config
└── package.json            # Dependencies
```

## 🎯 Core Routes

| Route | Purpose | Access |
|-------|---------|--------|
| `/` | Public home with counter & timeline | Anyone |
| `/login` | Admin login | Anyone (restricted to admin) |
| `/admin` | Admin dashboard | Admin only |
| `/paid` | Paid thank yous tracker | Admin only |

## 🔐 Security

- **Firestore Rules**: Only authenticated admin can write data
- **Public Reads**: Anyone can view the timeline (read-only)
- **Auth Verification**: Cloud Functions verify admin status before sending emails
- **Environment Variables**: Sensitive data stored in `.env` files (never in code)

## 🎨 Customization

### Change Colors
Edit `src/styles/globals.css` CSS variables:
```css
:root {
  --primary-blush: #FFB5D8;      /* Main color */
  --primary-lavender: #E8D4F8;   /* Secondary */
  --primary-mint: #D4F8E8;       /* Accent */
  /* ... more colors */
}
```

### Modify Animations
- Animations use Framer Motion
- Edit in component files or `src/styles/globals.css`
- Confetti settings in `src/components/ConfettiEffect.jsx`

### Add Features
1. **New components**: Add to `src/components/`
2. **New pages**: Add to `src/pages/` and route in `App.jsx`
3. **Database**: Extend Firestore collections in `firestore.rules`
4. **Email templates**: Edit in `functions/sendEmailNotification.js`

## 📊 Database Schema

### thankyou_entries
```javascript
{
  id: string,
  title: string,
  description: string,
  date: Timestamp,
  countAdded: number,
  isSpecial: boolean,
  createdAt: Timestamp,
  editedAt: Timestamp,
  adminEmail: string
}
```

### paid_entries
```javascript
{
  id: string,
  title: string,
  date: Timestamp,
  countDeducted: number,
  createdAt: Timestamp,
  adminEmail: string
}
```

### config
```javascript
{
  totalThankyouCount: number,
  lastUpdated: Timestamp
}
```

## 🚢 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🐛 Troubleshooting

### Common Issues

**Q: Emails not sending**
- Check Cloud Functions are deployed
- Verify Gmail credentials in `functions/.env.local`
- Check function logs: `firebase functions:log`

**Q: Real-time updates not working**
- Verify Firestore rules are deployed
- Check collection names match exactly
- Clear browser cache and refresh

**Q: Can't login as admin**
- Create user in Firebase Authentication
- Verify email matches `REACT_APP_ADMIN_EMAIL`

**Q: Animations not smooth**
- Reduce confetti particles
- Check GPU acceleration is enabled
- Use `transform` instead of `top/left` for CSS

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more troubleshooting.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 15-minute setup guide
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Architecture & detailed setup
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment & troubleshooting

## 🎁 Features Overview

### Admin Dashboard
- Add/edit/delete thank you entries
- Manually adjust total count
- View statistics (total entries, special moments)
- Beautiful timeline with edit/delete actions
- Email notifications on every action

### Public Timeline
- Browse all thank you moments
- Search and filter by keywords
- Month-based grouping
- Animated counter
- Responsive design for all devices

### Paid Page
- Track repaid thank yous
- Visual progress bar
- Summary statistics
- Elegant timeline of repayments
- Balance calculation

### Animations & Effects
- Smooth count animations
- Confetti celebration on new entries
- Float and bounce animations
- Hover effects on cards
- Page transitions

## 🌟 Design Philosophy

**Soft & Emotional**: The UI uses pastel colors and smooth animations to create a warm, inviting feeling.

**Modern**: Glassmorphism, rounded corners, and contemporary design patterns make it feel current.

**Responsive**: Works beautifully on mobile, tablet, and desktop screens.

**Accessible**: Semantic HTML, proper contrast ratios, and keyboard navigation support.

## 📄 License

MIT License - Feel free to use, modify, and share!

## 💝 Special Notes

This app is designed to be deeply personal and emotional. It celebrates the beautiful moments of gratitude between you and someone special. Every animation, color, and interaction is intentional to make the experience meaningful.

**Made with ❤️ for celebrating gratitude.**

---

## 🤝 Contributing

Have ideas? Want to improve something? Feel free to:
1. Fork the project
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

Stuck? Check the documentation or create an issue!

---

**Current Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✨ Production Ready

**Happy tracking! 💝✨**
