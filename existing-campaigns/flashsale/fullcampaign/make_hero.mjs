// Typographic overlays for the flash sale — the hero lockup and the urgency line
// on the model band.
//
// Both are set in Playfair Display. Direct font downloads are blocked in this sandbox,
// but headless Chromium can reach Google Fonts, so every overlay is composited in the
// browser and screenshotted. That is the only way to get the real typeface rather than
// a Georgia substitute.
//
// RUN ORDER: make_assets.py first (it produces the base crops), then this script.
import { chromium } from 'playwright';
import fs from 'fs';

const RAW = '/mnt/user-data/uploads/jimmycoco/existing-campaigns/flashsale';
const b64 = (p) => fs.readFileSync(p).toString('base64');

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Poppins:wght@500;600&display=swap" rel="stylesheet">`;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function shoot(html, w, h, out) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
  const ok = await page.evaluate(() => document.fonts.check("900 100px 'Playfair Display'"));
  if (!ok) throw new Error('Playfair Display did not load — refusing to render a fallback');
  await page.screenshot({ path: out });
  await page.close();
  console.log(`  ${out}  ${w}x${h}`);
}

// ---------------------------------------------------------------- hero lockup
const HW = 1200, HH = 1700;
await shoot(`<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${HW}px;height:${HH}px;overflow:hidden}
  .stage{position:relative;width:${HW}px;height:${HH}px;
         background:url(data:image/jpeg;base64,${b64(`${RAW}/6.jpg`)}) center/cover no-repeat;}
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
  <div class="bottom"><div class="flash">FLASH<br>SALE</div></div>
</div></body></html>`, HW, HH, 'images/hero.jpg');

// ------------------------------------------------- model band + urgency line
// Sits on the 3/4 line, where the photograph is darkest (mean luminance 92/255),
// so white type holds against it. Same Playfair 900 as FLASH SALE.
const BW = 1200, BH = 660;
await shoot(`<!DOCTYPE html><html><head><meta charset="utf-8">${FONTS}
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:${BW}px;height:${BH}px;overflow:hidden}
  .stage{position:relative;width:${BW}px;height:${BH}px;
         background:url(data:image/jpeg;base64,${b64('images/model-band-base.jpg')}) center/cover no-repeat;}
  .urgent{position:absolute;top:75%;left:0;right:0;transform:translateY(-50%);
          text-align:center;font-family:'Playfair Display',serif;font-weight:900;
          color:#fff;font-size:64px;line-height:1;letter-spacing:1px;
          text-shadow:0 3px 34px rgba(0,0,0,.42);}
</style></head><body>
<div class="stage"><div class="urgent">HURRY, OFFER ENDS SOON</div></div>
</body></html>`, BW, BH, 'images/model-band.jpg');

await browser.close();
console.log('\nOverlays rendered in Playfair Display.');
