# Deployment Guide

## GitHub Setup

Your code is committed and ready to push. Follow these steps:

### 1. Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Set **Repository name** to `bongochoti` (or `story-reading-app`)
3. Choose **Public**
4. **Do not** add a README, .gitignore, or license (you already have these)
5. Click **Create repository**

### 2. Push your code

GitHub will show commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/bongochoti.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Firebase Hosting

```bash
npm run deploy
```

Or manually:

```bash
npm run build
firebase deploy
```

Your site will be live at **https://bongochoti.web.app**

### 4. Optional: GitHub Pages or Vercel

- **Vercel**: Connect your GitHub repo at [vercel.com](https://vercel.com) for automatic deployments on push
- **Firebase**: Already configured; run `firebase deploy` after building
