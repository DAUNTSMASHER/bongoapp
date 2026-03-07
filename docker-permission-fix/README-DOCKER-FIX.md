# Docker Permission Fix

This fix prevents the `instance` directory (and database file) from being owned by `root` after `docker-compose down`.

## What Changed

1. **Dockerfile**: Creates a non-root user (`appuser`) with configurable UID/GID. The container runs as this user instead of root.

2. **docker-compose.yml**: Uses `user: "${PUID}:${PGID}"` so the container runs as your host user. Build args pass your UID/GID into the image.

3. **Pre-create `instance` on host**: Create the directory **before** first run so Docker doesn't create it as root:
   ```bash
   mkdir -p instance
   ```

## Setup

### 1. Get your UID and GID

- **Linux/macOS**: `id -u` and `id -g`
- **Windows (WSL2 or Git Bash)**: Run the same commands in WSL or Git Bash

### 2. Add to your `.env` file

```
PUID=1000
PGID=1000
```

Replace `1000` with your actual UID and GID if different.

### 3. Create instance directory (important!)

Before first `docker-compose up`:

```bash
mkdir -p instance
```

This ensures the directory is owned by you, not root.

### 4. If you already have a root-owned `instance` directory

```bash
# Remove it (data will be lost)
sudo rm -rf instance

# Recreate as your user
mkdir -p instance

# Rebuild and start
docker-compose up --build
```

## Result

- Files in `instance/` stay owned by your user.
- No need for `sudo` to delete or edit the database.
- Data persists across `docker-compose down` / `up`.

## Alternative: Named Volume

If you don't need direct access to the database file on the host, use a named volume instead of a bind mount. This avoids permission issues entirely:

```yaml
volumes:
  - project_ideas_data:/app/instance

volumes:
  project_ideas_data:
```

Data lives in Docker's volume storage. Use `docker volume ls` and `docker volume inspect` to manage it.
