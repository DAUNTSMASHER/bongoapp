# Video Hosting Options

## Option A: Vercel Blob (Recommended for Vercel deploy)

Upload videos to Vercel Blob so they work on Vercel without large files in the repo:

```bash
# 1. Ensure BLOB_READ_WRITE_TOKEN is in .env.local
# 2. Run the upload script
npm run upload-local-videos-to-blob

# 3. Commit the updated lib/localVideoBlobUrls.ts and deploy
git add lib/localVideoBlobUrls.ts
git commit -m "Add Blob URLs for local videos"
npm run deploy
```

The script reads `public/Videos/*.mp4`, uploads to Blob, and updates `lib/localVideoBlobUrls.ts`.

---

## Option B: Self-Host on Ubuntu (PM2)

# Self-Host bongochoti on Ubuntu (PM2)

Deploy bongochoti on your own server to serve local videos without Vercel limits. Videos in `public/Videos/` will play correctly.

## System Requirements

| | Minimum | Recommended |
|---|---|---|
| **OS** | Ubuntu 20.04 LTS+ | Ubuntu 22.04 LTS |
| **RAM** | 2GB | 4GB+ |
| **Disk** | 5GB free | 20GB+ (for videos) |
| **CPU** | 1 core | 2+ cores |

---

## Step 1: Update System & Install Prerequisites

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

node --version   # v18.x.x
npm --version    # 9.x.x+
```

---

## Step 2: Install PM2

```bash
sudo npm install -g pm2
pm2 --version
```

---

## Step 3: Clone & Setup Project

```bash
git clone https://github.com/YOUR_USERNAME/story-reading-app.git
cd story-reading-app

npm install

# Create logs directory
mkdir -p logs
chmod 755 logs
```

---

## Step 4: Add Your Videos

Upload your videos to `public/Videos/` on the server:

```bash
# Create Videos folder if missing
mkdir -p public/Videos

# Upload via SCP (from your local machine)
# scp public/Videos/*.mp4 user@your-server:/path/to/story-reading-app/public/Videos/

# Or use rsync
# rsync -avz public/Videos/ user@your-server:/path/to/story-reading-app/public/Videos/
```

**Update the video list** in `lib/localVideos.ts` – add each new filename to `LOCAL_VIDEO_FILES`:

```ts
const LOCAL_VIDEO_FILES = [
  "22.mp4",
  "74.mp4",
  "103.mp4",
  // ... add new filenames here
];
```

---

## Step 5: Environment Configuration

```bash
cp .env.example .env.local
nano .env.local
```

Required variables (from your existing setup):

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... other Firebase vars

# App URL (your server IP or domain)
NEXT_PUBLIC_APP_URL="http://your-server-ip:3000"

# Firebase Admin (for server-side)
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
# or
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

# Optional: Blob for video migration
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

---

## Step 6: Build

```bash
npm run build
ls -la .next/
```

---

## Step 7: PM2 Configuration

Edit `ecosystem.config.js` and set the correct `cwd`:

```js
cwd: '/home/your-user/story-reading-app',  // Full path to project
```

Or keep `process.cwd()` if you run PM2 from the project directory.

---

## Step 8: Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # Follow instructions for auto-start on boot
```

---

## Step 9: Verify

```bash
pm2 status
pm2 logs bongochoti
curl http://localhost:3000
curl http://localhost:3000/api/videos/local
```

- **Site:** `http://your-server-ip:3000`
- **Videos:** `http://your-server-ip:3000/videos/`
- **Admin:** `http://your-server-ip:3000/admin/`

---

## Production: Nginx + SSL

### Install Nginx

```bash
sudo apt install nginx -y
```

### Site config

```bash
sudo nano /etc/nginx/sites-available/bongochoti
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable & test

```bash
sudo ln -s /etc/nginx/sites-available/bongochoti /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot renew --dry-run
```

---

## PM2 Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Show app status |
| `pm2 logs bongochoti` | View logs |
| `pm2 restart bongochoti` | Restart app |
| `pm2 monit` | Real-time monitor |

---

## Adding More Videos

1. Copy new `.mp4` files to `public/Videos/`
2. Run `npm run list-local-videos` to print the filenames, or add them manually to `LOCAL_VIDEO_FILES` in `lib/localVideos.ts`
3. Rebuild and restart:

```bash
npm run build
pm2 restart bongochoti
```

---

## Troubleshooting

### Port 3000 in use

```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Videos not loading

- Confirm files exist: `ls -la public/Videos/`
- Confirm filenames in `lib/localVideos.ts` match exactly
- Check logs: `pm2 logs bongochoti`

### Out of memory

```bash
pm2 restart bongochoti --max-memory-restart 2G
```
