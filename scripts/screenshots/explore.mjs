// Full-page captures of every customer screen, for planning shots. Writes to
// ./explore (gitignored), never to /images.
//   node explore.mjs [path ...]
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { launch, APP, token, open, settle, here } from './lib.mjs'

const out = join(here, 'explore')
mkdirSync(out, { recursive: true })
const paths = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['dashboard', 'scheduling', 'calendar', 'channels/social-platforms', 'channels/integrations', 'stores', 'designs', 'templates', 'ideas', 'insights', 'upgrade', 'profile', 'settings', 'contact', 'community/ideas', 'community/roadmap', 'messaging']

const browser = await launch()
const { page } = await open(browser, { auth: await token(), scale: 1 })
for (const p of paths) {
  await page.goto(`${APP}/${p}`)
  await settle(page, 1500)
  const name = p.replace(/[/:]/g, '_')
  await page.screenshot({ path: join(out, `${name}.png`), fullPage: false })
  console.log(p, '->', page.url())
}
await browser.close()
