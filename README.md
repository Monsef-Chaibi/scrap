# kwrds.ai Keyword Scraper API

A production-ready keyword scraper API built with Node.js, Express, and Puppeteer. Easily deployable on Render.com or any Docker-compatible platform.

## Features

- ✅ Scrapes keyword data from kwrds.ai
- ✅ Returns JSON with keyword metrics (volume, CPC, trend, difficulty, etc.)
- ✅ Production-ready Docker setup for Render.com
- ✅ Error handling and logging
- ✅ Health check endpoint
- ✅ Both GET and POST API endpoints

## Project Structure

```
.
├── src/
│   └── index.js              # Main Express server & scraping logic
├── package.json              # Dependencies
├── Dockerfile                # Docker configuration for Render
├── .dockerignore             # Docker ignore file
├── .gitignore                # Git ignore file
└── README.md                 # This file
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for local Docker testing)
- GitHub account (for version control)
- Render.com account (for deployment)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally

```bash
npm start
```

The server will start on `http://localhost:3000`

### 3. Test the API

**GET Request:**
```bash
curl "http://localhost:3000/api/scrape?keyword=firewood"
```

**POST Request:**
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"keyword": "firewood"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "keyword": "firewood wood",
    "searchVolume": "201,000",
    "trend": "-18.27%",
    "cpc": 1.32,
    "type": "General",
    "difficulty": "HIGH",
    "timestamp": "2024-12-04T17:30:00.000Z"
  }
}
```

### 4. Health Check

```bash
curl http://localhost:3000/health
```

## Deployment on Render.com

### Step 1: Push to GitHub

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: kwrds scraper API"
   ```

2. **Create a GitHub Repository**:
   - Go to https://github.com/new
   - Create a repository (e.g., `kwrds-scraper-api`)
   - Do NOT initialize with README (we already have one)

3. **Add Remote and Push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/kwrds-scraper-api.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy on Render.com

1. **Sign Up/Login to Render**:
   - Go to https://render.com
   - Click "Sign up" or "Sign in"
   - Use GitHub to authenticate (recommended)

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect to your GitHub repository (`kwrds-scraper-api`)
   - Select the repository

3. **Configure Deployment**:
   - **Name**: `kwrds-scraper-api` (or your preferred name)
   - **Environment**: `Docker`
   - **Region**: Select your closest region
   - **Branch**: `main`

4. **Advanced Settings**:
   - **Health Check Path**: `/health`
   - **Health Check Protocol**: HTTP
   - No environment variables needed (Render sets PORT automatically)

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for the build to complete (2-5 minutes)
   - Your API will be available at: `https://your-service-name.onrender.com`

### Step 3: Test Deployed API

Once deployment is complete:

```bash
curl "https://your-service-name.onrender.com/api/scrape?keyword=firewood"
```

## Environment Variables

The application requires minimal configuration:

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `PORT` | `3000` | Server port | No (Render sets this) |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` | Path to Chromium binary | No (Docker sets this) |
| `NODE_ENV` | `production` | Node environment | No |

**For local development**, no environment variables are needed. The application will use system Puppeteer.

## API Endpoints

### GET /api/scrape

**Query Parameters:**
- `keyword` (required): The keyword to search for

**Example:**
```bash
curl "http://localhost:3000/api/scrape?keyword=firewood"
```

### POST /api/scrape

**Request Body:**
```json
{
  "keyword": "firewood"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"keyword": "firewood"}'
```

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-04T17:30:00.000Z",
  "uptime": 123.45
}
```

### GET /

Returns API documentation with all available endpoints.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "keyword": "firewood wood",
    "searchVolume": "201,000",
    "trend": "-18.27%",
    "cpc": 1.32,
    "type": "General",
    "difficulty": "HIGH",
    "timestamp": "2024-12-04T17:30:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Missing keyword parameter",
  "example": "/api/scrape?keyword=firewood"
}
```

## Troubleshooting

### Build Fails on Render

1. Check logs: Click "Logs" in Render dashboard
2. Ensure `Dockerfile` and `package.json` are in the root directory
3. Verify `src/index.js` exists

### API Returns 500 Error

1. Check the website structure hasn't changed on kwrds.ai
2. Verify keyword is not empty or special characters
3. Check Render logs for detailed error messages

### Timeout Errors

- The free tier on Render may have slower performance
- Wait 10-15 seconds for response (includes browser startup)
- Upgrade to paid tier for better performance

## Development Tips

### Add Console Logs

The app includes a logging utility. Use it:

```javascript
log.info('Information message');
log.error('Error message');
log.warn('Warning message');
```

### Modify Scraping Logic

Edit `src/index.js` in the `scrapeKeyword()` function to change:
- Target website selectors
- Data extraction logic
- Puppeteer configuration

## Performance Notes

- **Free Tier Render**: 3-5 minute cold start (first request after inactivity)
- **Scraping Time**: ~15-20 seconds per request (includes Chromium startup)
- **Timeout**: Set to 30 seconds; increase if needed

## Limits on Render Free Tier

- 750 hours/month
- 0.5 GB memory
- No persistent storage
- Services go to sleep after 15 minutes of inactivity

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Render.com documentation
3. Check Puppeteer documentation at https://pptr.dev

---

**Happy scraping! 🚀**
