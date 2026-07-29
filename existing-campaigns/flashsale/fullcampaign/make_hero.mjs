// Composite the flash-sale lockup onto the clean product photograph.
// Rendered through Chromium so the real Playfair Display webfont is used —
// direct font downloads are blocked in this sandbox, but the browser can fetch them.
import { chromium } from 'playwright';
import fs from 'fs';

const PHOTO = '/mnt/user-data/uploads/jimmycoco/existing-campaigns/flashsale/6.jpg';
const b64 = fs.readFileSync(PHOTO).toString('base64');
const W = 1200, H = 1700;   // 600x850 display at 2x

const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Poppins:wght@500;600&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${W}px;height:${H}px;overflow:hidden}
  .stage{position:relative;width:${W}px;height:${H}px;
         background:url(data:image/jpeg;base64,${b64}) center/cover no-repeat;}
  .top{position:absolute;top:58px;left:0;right:0;text-align:center;}
  .off{font-family:'Playfair Display',serif;font-weight:800;color:#fff;
       font-size:132px;line-height:1;letter-spacing:-1px;
       text-shadow:0 2px 26px rgba(0,0,0,.30);}
  .off .pc{font-weight:900;}
  .sub{margin-top:26px;font-family:'Poppins',Arial,sans-serif;font-weight:600;
       color:#fff;font-size:40px;letter-spacing:7px;
       text-shadow:0 2px 18px rgba(0,0,0,.40);}
  .bottom{position:absolute;bottom:104px;left:0;right:0;text-align:center;}
  .flash{font-family:'Playfair Display',serif;font-weight:900;color:#fff;
         font-size:250px;line-height:.88;letter-spacing:-2px;
         text-shadow:0 4px 40px rgba(0,0,0,.28);}
</style></head><body>
<div class="stage">
  <div class="top">
    <div class="off">UP TO <span class="pc">25%</span> OFF</div>
    <div class="sub">SITEWIDE FLASH SALE</div>
  </div>
  <div class="bottom">
    <div class="flash">FLASH<br>SALE</div>
  </div>
</div></body></html>`;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
const ok = await page.evaluate(() => document.fonts.check("900 100px 'Playfair Display'"));
console.log('Playfair Display available:', ok);
await page.screenshot({ path: 'hero-raw.png' });
await browser.close();
