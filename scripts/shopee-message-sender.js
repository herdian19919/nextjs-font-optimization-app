const puppeteer = require('puppeteer');

async function sendMessage({ username, password, buyers, message }) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Go to Shopee login page
    await page.goto('https://seller.shopee.co.id/');

    // Wait and click login button to open login form (adjust selector as needed)
    await page.waitForSelector('button[data-sqe="login-button"]', { timeout: 10000 });
    await page.click('button[data-sqe="login-button"]');

    // Wait for login form inputs
    await page.waitForSelector('input[name="loginKey"]', { timeout: 10000 });
    await page.type('input[name="loginKey"]', username, { delay: 100 });
    await page.type('input[name="password"]', password, { delay: 100 });

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log('Logged in successfully');

    for (const buyer of buyers) {
      try {
        // Navigate to buyer chat page URL (adjust URL pattern as needed)
        const chatUrl = `https://seller.shopee.co.id/new-webchat/conversations/${buyer}`;
        await page.goto(chatUrl, { waitUntil: 'networkidle0' });

        // Wait for message input box
        await page.waitForSelector('textarea', { timeout: 10000 });

        // Type message
        await page.type('textarea', message, { delay: 50 });

        // Click send button (adjust selector as needed)
        await page.click('button[type="submit"]');

        console.log(`Message sent to ${buyer}`);
      } catch (err) {
        console.error(`Failed to send message to ${buyer}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error during login or messaging:', err.message);
  } finally {
    await browser.close();
  }
}

// Read inputs from command line arguments or environment variables
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log('Usage: node shopee-message-sender.js <username> <password> <buyers(comma separated)> <message>');
  process.exit(1);
}

const [username, password, buyersStr, message] = args;
const buyers = buyersStr.split(',');

sendMessage({ username, password, buyers, message });
