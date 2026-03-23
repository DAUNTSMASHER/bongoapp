/**
 * PM2 ecosystem config for self-hosted deployment.
 * Run: pm2 start ecosystem.config.js
 */

const path = require("path");

module.exports = {
  apps: [
    {
      name: "bongochoti",
      script: "npm",
      args: "start",
      cwd: path.resolve(__dirname),
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
