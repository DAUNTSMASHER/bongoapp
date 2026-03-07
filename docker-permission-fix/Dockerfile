FROM python:3.9-slim-buster

WORKDIR /app

# Build args for running as host user (avoids root-owned files on host)
ARG PUID=1000
ARG PGID=1000

# Create non-root user matching typical host UID/GID
RUN groupadd -g "${PGID}" appuser \
  && useradd -u "${PUID}" -g "${PGID}" -m -s /bin/bash appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure instance dir exists; appuser will own it when volume is mounted
RUN mkdir -p /app/instance && chown -R appuser:appuser /app/instance

# Run as non-root user
USER appuser

EXPOSE 5000

CMD ["flask", "run", "--host", "0.0.0.0"]
