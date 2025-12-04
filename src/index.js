const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Logger utility
const log = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
};

/**
 * Scrape keyword data from kwrds.ai
 * @param {string} keyword - The keyword to search for
 * @returns {Promise<Object>} Scraped data with keyword, volume, CPC, etc.
 */
async function scrapeKeyword(keyword) {
  let browser;
  try {
    log.info(`Scraping keyword: "${keyword}"`);

    // Puppeteer configuration for Docker/Render
    const puppeteerConfig = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    };

    // Use executablePath if PUPPETEER_EXECUTABLE_PATH is set (for Docker)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerConfig.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      log.info(`Using Puppeteer executable path: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    }

    browser = await puppeteer.launch(puppeteerConfig);
    const page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate to kwrds.ai
    log.info('Navigating to kwrds.ai');
    await page.goto('https://www.kwrds.ai', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for search input
    try {
      await page.waitForSelector('input[placeholder="Enter a Keyword, brand or product"]', {
        timeout: 10000,
      });
    } catch (error) {
      throw new Error('Search input not found on page. The website may have changed.');
    }

    // Fill search input
    await page.type('input[placeholder="Enter a Keyword, brand or product"]', keyword, {
      delay: 50,
    });
    log.info(`Entered keyword: "${keyword}"`);

    // Press Enter
    await page.keyboard.press('Enter');
    log.info('Pressed Enter to search');

    // Wait for navigation
    try {
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
    } catch (error) {
      log.warn('Navigation timeout, proceeding with extraction...');
    }

    // Wait for results to appear
    try {
      await page.waitForSelector('#nice_0', { timeout: 10000 });
    } catch (error) {
      log.warn('Result container not found, attempting extraction anyway...');
    }

    // Wait for JavaScript to fully render
    log.info('Waiting for page content to render...');
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Extract page content
    const content = await page.content();
    const cheerio = require('cheerio');
    const $ = cheerio.load(content);

    // Extract first result
    const firstRow = $('.group.cursor-pointer').first();

    if (firstRow.length === 0) {
      throw new Error('No results found for the provided keyword');
    }

    const cells = firstRow.find('> div');

    if (cells.length < 6) {
      throw new Error('Unexpected page structure - could not extract all fields');
    }

    const keywordName = $(cells[0]).text().trim();
    const searchVolume = $(cells[1]).text().trim();
    const trend = $(cells[2]).find('span').first().text().trim();
    const cpc = $(cells[3]).text().trim();
    const type = $(cells[4]).text().trim();
    const difficulty = $(cells[5]).text().trim();

    if (!keywordName || !searchVolume) {
      throw new Error('Could not extract keyword data');
    }

    const result = {
      keyword: keywordName,
      searchVolume: searchVolume,
      trend: trend,
      cpc: parseFloat(cpc) || cpc,
      type: type,
      difficulty: difficulty,
      timestamp: new Date().toISOString(),
    };

    log.info(`Successfully scraped keyword: ${keywordName}`);
    return result;
  } catch (error) {
    log.error(`Scraping failed: ${error.message}`);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      log.info('Browser closed');
    }
  }
}

// Routes

/**
 * GET /api/scrape?keyword=firewood
 * Query parameter: keyword (required)
 */
app.get('/api/scrape', async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({
      success: false,
      error: 'Missing keyword parameter',
      example: '/api/scrape?keyword=firewood',
    });
  }

  if (typeof keyword !== 'string' || keyword.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Keyword must be a non-empty string',
    });
  }

  try {
    const result = await scrapeKeyword(keyword.trim());
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    log.error(`API Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during scraping',
    });
  }
});

/**
 * POST /api/scrape
 * Body: { "keyword": "firewood" }
 */
app.post('/api/scrape', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({
      success: false,
      error: 'Missing keyword in request body',
      example: { keyword: 'firewood' },
    });
  }

  if (typeof keyword !== 'string' || keyword.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Keyword must be a non-empty string',
    });
  }

  try {
    const result = await scrapeKeyword(keyword.trim());
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    log.error(`API Error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during scraping',
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /
 * API documentation
 */
app.get('/', (req, res) => {
  res.json({
    name: 'kwrds.ai Scraper API',
    version: '1.0.0',
    description: 'Production-ready keyword scraper API',
    endpoints: {
      GET: {
        path: '/api/scrape',
        params: { keyword: 'string (required)' },
        example: '/api/scrape?keyword=firewood',
      },
      POST: {
        path: '/api/scrape',
        body: { keyword: 'string (required)' },
        example: { keyword: 'firewood' },
      },
      health: '/health',
      docs: '/',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  log.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    availableEndpoints: ['/api/scrape', '/health', '/'],
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  log.info(`===========================================`);
  log.info(`🚀 API Server running on port ${PORT}`);
  log.info(`===========================================`);
  log.info(`📝 Endpoints:`);
  log.info(`   GET:  http://localhost:${PORT}/api/scrape?keyword=firewood`);
  log.info(`   POST: http://localhost:${PORT}/api/scrape`);
  log.info(`   Health: http://localhost:${PORT}/health`);
  log.info(`===========================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
