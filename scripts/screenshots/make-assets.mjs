// Generates the demo images used by the screenshot data: a fictional coffee
// brand, "Atlas Coffee Roasters". Nothing here is a real account or a real
// photo, so the Help Center's screenshots never show customer data.
//
//   node make-assets.mjs
//
// Writes PNGs into ./demo-assets. Uses the app's Playwright install.
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire('file:///E:/osco/app/frontEnd/package.json')
const { chromium } = require('@playwright/test')

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'demo-assets')
mkdirSync(out, { recursive: true })

const font = `font-family: 'Segoe UI', system-ui, sans-serif;`

// Brand mark: a simple mountain-and-sun logo on a coloured disc.
const logo = (bg, fg) => `
<div style="width:400px;height:400px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center">
  <svg width="240" height="240" viewBox="0 0 24 24" fill="none">
    <circle cx="16.5" cy="7" r="2.6" fill="${fg}" opacity=".85"/>
    <path d="M2 19 L9 7.5 L13 13.5 L15.5 10.5 L22 19 Z" fill="${fg}"/>
  </svg>
</div>`

// A coffee bag drawn in CSS, for product photos.
const bag = (bg, bagColor, label, sub) => `
<div style="width:800px;height:800px;background:${bg};display:flex;align-items:center;justify-content:center;${font}">
  <div style="width:360px;height:500px;background:${bagColor};border-radius:28px 28px 18px 18px;box-shadow:0 40px 80px rgba(0,0,0,.25);position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff">
    <div style="position:absolute;top:0;left:0;right:0;height:46px;background:rgba(0,0,0,.18);border-radius:28px 28px 0 0"></div>
    <svg width="90" height="90" viewBox="0 0 24 24"><circle cx="16.5" cy="7" r="2.6" fill="#fff" opacity=".85"/><path d="M2 19 L9 7.5 L13 13.5 L15.5 10.5 L22 19 Z" fill="#fff"/></svg>
    <div style="font-size:20px;letter-spacing:.3em;margin-top:18px;opacity:.85">ATLAS</div>
    <div style="font-size:40px;font-weight:600;margin-top:14px;text-align:center;padding:0 24px">${label}</div>
    <div style="font-size:18px;margin-top:12px;opacity:.8">${sub}</div>
  </div>
</div>`

// A social post visual: gradient, big headline.
const visual = (w, h, from, to, title, kicker) => `
<div style="width:${w}px;height:${h}px;background:linear-gradient(135deg,${from},${to});display:flex;flex-direction:column;justify-content:flex-end;padding:72px;box-sizing:border-box;color:#fff;${font}">
  <div style="font-size:30px;letter-spacing:.25em;opacity:.85">${kicker}</div>
  <div style="font-size:${Math.round(w / 11)}px;font-weight:600;line-height:1.05;margin-top:18px">${title}</div>
  <div style="display:flex;align-items:center;gap:14px;margin-top:40px;font-size:28px;opacity:.9">
    <svg width="44" height="44" viewBox="0 0 24 24"><circle cx="16.5" cy="7" r="2.6" fill="#fff" opacity=".85"/><path d="M2 19 L9 7.5 L13 13.5 L15.5 10.5 L22 19 Z" fill="#fff"/></svg>
    Atlas Coffee Roasters
  </div>
</div>`

const assets = {
  'avatar-atlas.png': [400, 400, logo('#3b2a20', '#f3c37a')],
  'avatar-atlas-blue.png': [400, 400, logo('#1f3a5f', '#ffffff')],
  'avatar-atlas-cream.png': [400, 400, logo('#f3e3c9', '#3b2a20')],
  'avatar-atlas-green.png': [400, 400, logo('#24493a', '#e8f1d6')],
  'avatar-user.png': [400, 400, `<div style="width:400px;height:400px;border-radius:50%;background:#465fff;color:#fff;display:flex;align-items:center;justify-content:center;font-size:170px;${font}">S</div>`],
  'store-logo.png': [400, 400, logo('#3b2a20', '#f3c37a')],
  'product-ethiopia.png': [800, 800, bag('#efe6da', '#b4552d', 'Ethiopia Yirgacheffe', 'Light roast · 250 g')],
  'product-colombia.png': [800, 800, bag('#e6ebe4', '#2f5d46', 'Colombia Huila', 'Medium roast · 250 g')],
  'product-house.png': [800, 800, bag('#ebe7f0', '#3b2a20', 'House Espresso', 'Dark roast · 1 kg')],
  'product-decaf.png': [800, 800, bag('#e5edf3', '#1f3a5f', 'Swiss Water Decaf', 'Medium roast · 250 g')],
  'product-kenya.png': [800, 800, bag('#f3ebe1', '#8a2d3b', 'Kenya AA', 'Light roast · 250 g')],
  'product-cold-brew.png': [800, 800, bag('#e9eef2', '#27313f', 'Cold Brew Blend', 'Coarse ground · 500 g')],
  'post-new-roast.png': [1080, 1080, visual(1080, 1080, '#b4552d', '#3b2a20', 'New roast, fresh this week', 'JUST LANDED')],
  'post-brew-guide.png': [1080, 1350, visual(1080, 1350, '#2f5d46', '#16241d', 'The 4-minute French press', 'BREW GUIDE')],
  'post-weekend.png': [1080, 1080, visual(1080, 1080, '#465fff', '#1f2a7a', 'Weekend tasting, 10 to 2', 'IN THE SHOP')],
  'post-latte-art.png': [1080, 1920, visual(1080, 1920, '#8a2d3b', '#2b0e14', 'Latte art, step by step', 'BARISTA TIPS')],
  'post-origin.png': [1920, 1080, visual(1920, 1080, '#c98a2b', '#5a3410', 'From farm to cup: Huila, Colombia', 'ORIGIN STORY')],
  'post-team.png': [1200, 627, visual(1200, 627, '#1f3a5f', '#0c1726', 'We are hiring a head roaster', 'JOIN THE TEAM')],
  'design-sale.png': [1080, 1080, visual(1080, 1080, '#d4483b', '#5c1610', '20% off all beans this Friday', 'FLASH SALE')],
  'design-quote.png': [1080, 1080, visual(1080, 1080, '#3b2a20', '#120b07', '"Good coffee is a slow thing."', 'MONDAY THOUGHT')],
  'design-story.png': [1080, 1920, visual(1080, 1920, '#24493a', '#0d1c16', 'Swipe up for the new menu', 'STORY')],
}

const browser = await chromium.launch()
const page = await browser.newPage()
for (const [name, [w, h, html]] of Object.entries(assets)) {
  await page.setViewportSize({ width: w, height: h })
  await page.setContent(`<html><body style="margin:0;background:transparent">${html}</body></html>`)
  await page.screenshot({ path: join(out, name), omitBackground: name.startsWith('avatar') || name === 'store-logo.png' })
}
await browser.close()
console.log(`wrote ${Object.keys(assets).length} images to ${out}`)
