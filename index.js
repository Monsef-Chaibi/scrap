const express = require('express');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Function to scrape keyword data
async function scrapeKeyword(keyword) {
  let browser;
  try {
    console.log(`\n🔍 Scraping keyword: "${keyword}"...`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate to main page
    console.log(`📍 Navigating to kwrds.ai...`);
    await page.goto('https://www.kwrds.ai', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for the search input to be available
    await page.waitForSelector('input[placeholder="Enter a Keyword, brand or product"]', { timeout: 10000 });

    // Fill the input field with the keyword
    await page.type('input[placeholder="Enter a Keyword, brand or product"]', keyword, { delay: 100 });
    console.log(`📝 Entered keyword: "${keyword}"`);

    // Press Enter to search
    await page.keyboard.press('Enter');
    console.log('⏳ Searching...');

    // Wait for the results to load
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {
      console.log('⚠️ Navigation timeout, but proceeding...');
    });

    // Wait for the data container to load
    await page.waitForSelector('#nice_0', { timeout: 10000 }).catch(() => {
      console.log('⚠️ Waited for content (may not be visible)');
    });

    // Give it extra time for JavaScript to render
    console.log('⏳ Waiting for data to fully load...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Get page content
    const content = await page.content();
    const $ = cheerio.load(content);

    // Extract data from the div structure - find the first result row
    const results = [];

    // Look for any div with .group class (table rows)
    const firstRow = $('.group.cursor-pointer').first();
    
    if (firstRow.length > 0) {
      const cells = firstRow.find('> div');
      
      if (cells.length >= 6) {
        const keywordName = $(cells[0]).text().trim();
        const searchVolume = $(cells[1]).text().trim();
        const trend = $(cells[2]).find('span').first().text().trim();
        const cpc = $(cells[3]).text().trim();
        const type = $(cells[4]).text().trim();
        const difficulty = $(cells[5]).text().trim();

        if (keywordName && searchVolume) {
          results.push({
            keyword: keywordName,
            searchVolume: searchVolume,
            trend: trend,
            cpc: parseFloat(cpc) || cpc,
            type: type,
            difficulty: difficulty,
          });
        }
      }
    }

    await browser.close();

    if (results.length > 0) {
      console.log('✅ Data extracted successfully!');
      return results[0];
    } else {
      throw new Error('No data found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// API Endpoint: GET /api/scrape?keyword=firewood
app.get('/api/scrape', async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a keyword parameter',
      example: '/api/scrape?keyword=firewood'
    });
  }

  try {
    const result = await scrapeKeyword(keyword);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// API Endpoint: POST /api/scrape (with JSON body)
app.post('/api/scrape', async (req, res) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a keyword in the request body',
      example: { keyword: 'firewood' }
    });
  }

  try {
    const result = await scrapeKeyword(keyword);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 kwrds.ai Keyword Scraper API',
    endpoints: {
      GET: '/api/scrape?keyword=firewood',
      POST: '/api/scrape (with body: { "keyword": "firewood" })',
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
  console.log(`\n📝 Usage Examples:`);
  console.log(`   GET:  http://localhost:${PORT}/api/scrape?keyword=firewood`);
  console.log(`   POST: http://localhost:${PORT}/api/scrape`);
  console.log(`   Body: { "keyword": "firewood" }\n`);
});
