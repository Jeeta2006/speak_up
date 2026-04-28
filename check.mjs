import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  // Wait a moment for canvas to draw
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'C:/Users/nandi/OneDrive/Desktop/Spekup/speakup/screenshot.png' });
  
  await browser.close();
})();
