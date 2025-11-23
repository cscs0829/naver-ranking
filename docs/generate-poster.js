const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const htmlPath = path.join(__dirname, 'poster.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  
  // 4:3 비율 (1600x1200) 해상도로 스크린샷
  await page.setViewportSize({ width: 1600, height: 1200 });
  
  const outputPath = path.join(__dirname, 'poster.png');
  await page.screenshot({ 
    path: outputPath,
    fullPage: false,
    type: 'png'
  });
  
  await browser.close();
  console.log(`포스터 이미지가 생성되었습니다: ${outputPath}`);
})();

