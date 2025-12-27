# Photobook

A self-hosted photo gallery web application that syncs with Adobe Lightroom galleries. Built with Next.js, SQLite, and Prisma.

## Features

- **Lightroom Integration**: Sync photos from public galleries or private albums via Adobe API
- **Album Organization**: Organize photos into albums with customizable chapters
- **Photo Map**: View photos on an interactive map based on GPS metadata
- **Search**: Full-text search across photo titles and captions
- **Admin Panel**: Manage galleries, albums, covers, and sync settings
- **Dark Theme**: Multiple dark theme presets (forest green, ocean blue, sunset orange, etc.)
- **PWA Support**: Installable as a Progressive Web App with offline support
- **Docker Ready**: Easy deployment with Docker Compose
- **CI/CD**: Automated testing and deployment with GitHub Actions

## Quick Start

### Prerequisites

- Node.js 22+
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/photobook.git
   cd photobook
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration (see [Configuration](#configuration)).

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Configuration

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | Yes | Password for the admin panel |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your site's public URL |
| `ENCRYPTION_KEY` | Yes* | Key for encrypting Adobe tokens (generate with `openssl rand -hex 32`) |
| `SYNC_WEBHOOK_SECRET` | No | Secret for webhook-triggered syncs |
| `ADOBE_CLIENT_ID` | No | Adobe API client ID (for private albums) |
| `ADOBE_CLIENT_SECRET` | No | Adobe API client secret |

\* Required if using Adobe API integration

## Usage

### Adding Galleries

1. Log in to the admin panel at `/admin`
2. Go to "Albums" and add a new gallery
3. Paste the URL of a public Lightroom gallery
4. Run sync to import photos

### Syncing Photos

```bash
# Sync once
npm run sync

# Sync continuously (every 30 minutes)
npm run sync:watch

# Add a new gallery URL
npm run sync:add
```

### Adobe Lightroom API (Optional)

To sync private albums and get photo titles/captions from Lightroom:

1. Create credentials at [Adobe Developer Console](https://developer.adobe.com/console)
2. Add the Lightroom API to your project
3. Configure OAuth with callback URL: `{SITE_URL}/api/auth/adobe/callback`
4. Add `ADOBE_CLIENT_ID`, `ADOBE_CLIENT_SECRET`, and `ENCRYPTION_KEY` to your environment
5. Authenticate via the admin panel

## Docker Deployment

```bash
docker-compose up -d
```

The app will be available at `http://localhost:3000`.

Data is persisted in a Docker volume at `/app/data`.

## CI/CD with GitHub Actions

The project includes a GitHub Actions workflow that automatically builds and deploys on push to `main`.

### Setup

1. **Configure GitHub Secrets** in your repository settings:

   | Secret | Description |
   |--------|-------------|
   | `SSH_HOST` | Your server's hostname or IP |
   | `SSH_USER` | SSH username |
   | `SSH_KEY` | Private SSH key (paste the entire key) |
   | `SSH_PORT` | SSH port (optional, defaults to 22) |
   | `DEPLOY_PATH` | Path to project on server (e.g., `/home/user/photobook`) |

2. **On your server**, authenticate with GitHub Container Registry:
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
   ```

3. **Copy files to server**:
   ```bash
   scp docker-compose.yml .env your-server:~/photobook/
   ```

### How it works

1. Push to `main` or open a PR triggers the workflow
2. Tests run first (blocks deployment on failure)
3. Docker image is built and pushed to `ghcr.io`
4. GitHub Actions SSHs into your server
5. Runs `docker compose pull && docker compose up -d`

## Project Structure

```
photobook/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   └── lib/          # Utilities and helpers
├── sync/             # Lightroom sync service
├── prisma/           # Database schema
└── public/           # Static assets
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run sync` | Sync photos from Lightroom |
| `npm run sync:watch` | Continuous sync mode |

## License

CC BY-NC-SA 4.0 - See [LICENSE](LICENSE) for details.

You are free to use and modify this software for non-commercial purposes with attribution.
