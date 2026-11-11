// Planning aid: run a few steps, then save a 1x screenshot and print the
// visible buttons, links, inputs and dialog text.
//   node probe.mjs <name> <path> [step ...]
// A step is `click:Text`, `role:button:Name`, `fill:Label=value`, `key:Escape`,
// `wait:ms`, or `anon` as the first step to stay signed out.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { launch, APP, token, open, settle, here } from './lib.mjs'

const [name, path, ...steps] = process.argv.slice(2)
const out = join(here, 'explore')
mkdirSync(out, { recursive: true })
const anon = steps[0] === 'anon'
if (anon) steps.shift()
const browser = await launch()
const { page } = await open(browser, { auth: anon ? null : await token(), scale: 1 })
await page.goto(`${APP}/${path}`)
await settle(page, 1200)
for (const s of steps) {
  const [kind, ...rest] = s.split(':')
  const arg = rest.join(':')
  if (kind === 'click') await page.getByText(arg, { exact: true }).first().click()
  else if (kind === 'role') { const [r, ...n] = arg.split(':'); await page.getByRole(r, { name: n.join(':') }).first().click() }
  else if (kind === 'css') await page.locator(arg).first().click()
  else if (kind === 'fill') { const [l, v] = arg.split('='); await page.getByLabel(l).first().fill(v) }
  else if (kind === 'key') await page.keyboard.press(arg)
  else if (kind === 'wait') await page.waitForTimeout(Number(arg))
  await settle(page, 700)
}
await page.screenshot({ path: join(out, `${name}.png`) })
const info = await page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
  const dlg = [...document.querySelectorAll('[role=dialog]')].filter(vis).map((d) => d.innerText.replace(/\s+/g, ' ').slice(0, 600))
  const btn = [...document.querySelectorAll("main button, main a, main [role=tab], [role=dialog] button, [role=menu] *")].filter(vis).map((b) => (b.getAttribute('aria-label') || b.innerText || b.title || '').trim().replace(/\s+/g, ' ').slice(0, 40)).filter(Boolean)
  const inp = [...document.querySelectorAll('input,textarea,select')].filter(vis).map((i) => `${i.type}:${i.name || i.id || i.placeholder}`)
  return { url: location.pathname + location.search, dialogs: dlg, buttons: [...new Set(btn)].filter((x) => !/^(Create|Home|Dashboard|Scheduling|Insights|My Designs|Post Templates|Post Ideas|More|Connections|Settings|Tasks|Notifications|Account menu|AI Assistant)$|Active$/.test(x)).join(' | '), inputs: inp.join(' | ') }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
