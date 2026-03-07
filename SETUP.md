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
- **Authentication** → Enable **Email/Password** and **Google** sign-in
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

## Step 5 (optional): Firebase CLI for deploy

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Use: Firestore rules, Hosting, Functions (if you add them later).

---

## Quick reference

| Task          | Command / Action                      |
|---------------|---------------------------------------|
| Run dev server| `npm run dev`                         |
| Build         | `npm run build`                       |
| Start prod    | `npm run start`                       |
| Lint          | `npm run lint`                        |
| Firebase config | `.env.local` (from Firebase Console) |

---

*Need help? Check the PRD: `mobile-story-reading-PRD.md`*
