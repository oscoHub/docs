// A grid of screenshots in one image, for reviewing many at once.
//   node contact-sheet.mjs <out-name> <theme> <shot> [shot ...]
// Writes explore/<out-name>.png.
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { chromium, here, IMAGES } from './lib.mjs'

const [out, theme, ...names] = process.argv.slice(2)
const cells = names.map((n) => `<figure><img src="data:image/png;base64,${readFileSync(join(IMAGES, `${n}-${theme}.png`)).toString('base64')}"><figcaption>${n}</figcaption></figure>`).join('')
const html = `<html><body style="margin:0;background:#888;font:14px system-ui">
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px">${cells}</div>
<style>figure{margin:0;background:#fff;padding:4px}img{width:100%;display:block}figcaption{padding:2px 4px}</style></body></html>`
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 800 } })
await p.setContent(html)
await p.waitForLoadState('load')
await p.screenshot({ path: join(here, 'explore', `${out}.png`), fullPage: true })
await b.close()
