# Automation Scripts

## Scheduled Sync (Cron)

To automatically sync photos from Lightroom every 30 minutes:

### 1. Edit your crontab
```bash
crontab -e
```

### 2. Add this line (adjust the path)
```
*/30 * * * * /path/to/photobook/scripts/sync.sh
```

### 3. View sync logs
```bash
tail -f /path/to/photobook/sync.log
```

## Webhook Trigger

Trigger a sync via HTTP request:

### Setup
1. Set the webhook secret in your `.env` file:
   ```
   SYNC_WEBHOOK_SECRET=your-secret-key-here
   ```

2. Restart your server

### Trigger sync
```bash
curl -X POST https://your-site.com/api/sync \
  -H "x-webhook-secret: your-secret-key-here"
```

### Response
```json
{
  "success": true,
  "albums": 2,
  "photos": 115,
  "message": "Successfully synced 2 albums with 115 photos"
}
```

## PM2 Setup (Production)

For production deployment with PM2:

```bash
# Install PM2
npm install -g pm2

# Start the Next.js server
pm2 start npm --name "photobook" -- start

# Set up cron job for sync
pm2 start scripts/sync.sh --name "photobook-sync" --cron "*/30 * * * *"

# Save PM2 config
pm2 save
pm2 startup
```

## Systemd Service (Alternative)

Create `/etc/systemd/system/photobook-sync.timer`:

```ini
[Unit]
Description=Photobook Sync Timer

[Timer]
OnCalendar=*:0/30
Persistent=true

[Install]
WantedBy=timers.target
```

Create `/etc/systemd/system/photobook-sync.service`:

```ini
[Unit]
Description=Photobook Sync Service

[Service]
Type=oneshot
WorkingDirectory=/path/to/photobook
ExecStart=/path/to/photobook/scripts/sync.sh
User=your-user
```

Enable:
```bash
sudo systemctl enable photobook-sync.timer
sudo systemctl start photobook-sync.timer
```
