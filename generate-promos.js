'use strict';

const puppeteer = require('puppeteer');
const path      = require('path');
const fs        = require('fs');

const MISC        = path.join(__dirname, 'misc');
const PROMO_HTML  = path.join(MISC, 'promo.html');
const SHOT_HTML   = path.join(MISC, 'screenshot.html');

function fileUrl(p) {
  return 'file:///' + p.replace(/\\/g, '/');
}

const promos = [
  { name: 'promo-small',   width: 440,  height: 280, url: `${fileUrl(PROMO_HTML)}?size=small`   },
  { name: 'promo-large',   width: 920,  height: 680, url: `${fileUrl(PROMO_HTML)}?size=large`   },
  { name: 'promo-marquee', width: 1400, height: 560, url: `${fileUrl(PROMO_HTML)}?size=marquee` },
  { name: 'icon-128',      width: 128,  height: 128, url: `${fileUrl(PROMO_HTML)}?size=icon`    },
  { name: 'screenshot',    width: 1280, height: 800, url: fileUrl(SHOT_HTML)                    },
];

async function main() {
  fs.mkdirSync(MISC, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });

  try {
    for (const { name, width, height, url } of promos) {
      const page = await browser.newPage();
      await page.setViewport({ width, height, deviceScaleFactor: 2 });
      await page.goto(url, { waitUntil: 'networkidle0' });

      const outPath = path.join(MISC, `${name}.png`);
      await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width, height } });
      console.log(`✓ misc/${name}.png`);

      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
