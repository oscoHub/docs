// Captures pages of the local Mintlify preview (npx mint dev --port 3333),
// to check the Help Center's own design in both themes. Writes ./explore.
//   node preview-docs.mjs [path ...]
import { join } from 'node:path'
import { chromium, here } from './lib.mjs'

const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['', 'channels/facebook']
const browser = await chromium.launch({ channel: 'chrome' })
for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: theme })
  const page = await context.newPage()
  for (const p of paths) {
    await page.goto(`http://localhost:3333/${p}`, { waitUntil: 'networkidle' }).catch(() => {})
    await page.waitForTimeout(1500)
    const name = `docs-${p.replace(/\//g, '_') || 'home'}-${theme}.png`
    await page.screenshot({ path: join(here, 'explore', name) })
    console.log(name)
  }
  await context.close()
}
await browser.close()
