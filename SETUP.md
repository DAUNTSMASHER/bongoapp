# Setup Guide — Mobile Story Reading Website

Follow these steps **manually**. The rest is automated.

---

## Step 1: Prerequisites (check once)

- **Node.js 18+** — Run `node -v` in terminal. Install from [nodejs.org](https://nodejs.org) if needed.
- **npm** — Usually comes with Node.js. Run `npm -v` to verify.

---

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Create a project** (or use an existing one)
3. Name it (e.g. `story-reading-app`) and follow the wizard
4. Enable **Google Analytics** (optional, recommended)

### Enable services

- **Firestore Database** → Create database → Start in **test mode** for dev (you’ll tighten rules later)
- **Authentication** → Enable **Email/Password** sign-in
- Create the initial admin user: Authentication → Users → Add user → Email: `jobayertashdid920@gmail.com`, set a password
- **Hosting** → Not required for local dev

### Get web app config

1. Project settings (gear icon) → **General** → **Your apps**
2. Click **Add app** → **Web** (</>)
3. Register app, copy the `firebaseConfig` object
4. You’ll need: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`

---

## Step 3: Add environment variables

1. In the project root, copy `.env.example` to `.env.local`:
   ```
   copy .env.example .env.local
   ```
2. Open `.env.local` and paste your Firebase config values (replace the placeholders)

---

## Step 4: Install dependencies & run

From the project root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (prefer mobile view or device toolbar).

---

## Step 5: Deploy to Vercel (free tier)

The app uses **Vercel** for hosting so Admin video/story crawl works without Firebase Blaze plan.

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your repo
3. Add **Environment Variables** in Vercel:
   - All `NEXT_PUBLIC_FIREBASE_*` from `.env.local`
   - **`FIREBASE_SERVICE_ACCOUNT`** — Firebase Console → Project Settings → Service Accounts → **Generate new private key** → Copy the entire JSON and paste as the value (single line)
4. Deploy

The "ভিডিও ফেচ ও সংরক্ষণ" button works immediately after deploy.

### Alternative: Firebase CLI (Firestore rules only)

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Use: Firestore rules. Hosting is now on Vercel, not Firebase.

---

## Step 6: Admin authentication

- **Admin URL**: `/admin` — only accessible after sign-in
- **Initial admin**: Sign in with `jobayertashdid920@gmail.com` (create this user in Firebase Authentication first)
- Add more admins from the admin dashboard after signing in
- Deploy Firestore rules: `firebase deploy --only firestore` (for Firestore security)

---

## Step 7 (optional): Bangla font

Stories use **Kalpurush** for Bengali text. The font is in `public/fonts/kalpurush.ttf`. To replace it, put your preferred Bangla font in that folder and update `@font-face` in `app/globals.css`.

---

## Quick reference

| Task          | Command / Action                      |
|---------------|---------------------------------------|
| Run dev server| `npm run dev`                         |
| Build         | `npm run build`                       |
| Deploy        | Push to GitHub (Vercel auto-deploys) or `vercel` |
| Lint          | `npm run lint`                        |
| Firebase config | `.env.local` (from Firebase Console) |

---

*Need help? Check the PRD: `mobile-story-reading-PRD.md`*
