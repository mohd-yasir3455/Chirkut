# Thank You Tracker

A Vite + React + Firebase app for tracking thank you moments, managing an admin-only dashboard, and monitoring paid-back entries.

## Stack

- React 18
- Vite 5
- Firebase Auth + Firestore
- Framer Motion

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app expects Firebase and access-control values in `.env.local`. Required keys are listed in `.env.example`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

## Deploy

```bash
npm run build
firebase deploy --only hosting,firestore
```

## Notes

- Firestore rules are in `firestore.rules`.
- Firebase Hosting serves the Vite `dist/` output.
- Admin access is controlled by `VITE_ADMIN_EMAIL` and `VITE_ALLOWED_EMAILS`.
