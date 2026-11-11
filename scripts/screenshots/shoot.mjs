// Takes the Help Center's screenshots, in both themes, from the demo account.
//   node shoot.mjs            every shot
//   node shoot.mjs connect-   shots whose name starts with "connect-"
// Writes /images/<name>-light.png and -dark.png. See README.md for setup.
import { join } from 'node:path'
import { launch, APP, API, token, open, settle, IMAGES } from './lib.mjs'
import { shots as first } from './shots.mjs'
import { more } from './shots-more.mjs'

const shots = [...first, ...more]

const filter = process.argv[2] ?? ''
// A comma-separated list of prefixes picks several groups.
const prefixes = filter.split(',')
const only = shots.filter((s) => prefixes.some((p) => s.name.startsWith(p)))
if (!only.length) throw new Error(`no shot matches "${filter}"`)

const browser = await launch()
const auth = await token()
let failed = 0
for (const shot of only) {
  for (const theme of ['light', 'dark']) {
    const { context, page } = await open(browser, {
      theme,
      auth: shot.anon ? null : auth,
      width: shot.width ?? 1440,
      height: shot.height ?? 900,
    })
    try {
      // 'path' stubs GET; 'POST path' stubs that method only. A body of
      // { patch: fn } passes the real response through fn instead.
      for (const [key, body] of Object.entries(shot.stubs ?? {})) {
        const [method, pattern] = key.includes(' ') ? key.split(' ') : ['GET', key]
        await context.route(`${API}/${pattern}`, async (route) => {
          if (route.request().method() !== method) return route.fallback()
          if (body?.patch) {
            const real = await route.fetch()
            return route.fulfill({ response: real, json: body.patch(await real.json()) })
          }
          return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(typeof body === 'function' ? body(route.request()) : body) })
        })
      }
      await page.goto(`${APP}/${shot.path}`)
      await settle(page, 2500)
      const target = (await shot.run?.(page, helpers(page))) ?? null
      await settle(page, 500)
      const path = join(IMAGES, `${shot.name}-${theme}.png`)
      await capture(page, target, path, shot.pad ?? 24)
      console.log('ok  ', shot.name, theme)
    } catch (e) {
      failed++
      console.log('FAIL', shot.name, theme, String(e.message).split('\n')[0])
    } finally {
      await context.close()
    }
  }
}
await browser.close()
if (failed) process.exitCode = 1

// target: null = the whole window; a locator = that element plus padding;
// an array of locators = the box around all of them.
async function capture(page, target, path, pad) {
  await page.evaluate(() => document.activeElement?.blur?.())
  await page.mouse.move(0, page.viewportSize().height - 1)
  await page.waitForTimeout(250)
  if (!target) return page.screenshot({ path })
  const list = Array.isArray(target) ? target : [target]
  const boxes = []
  for (const l of list) {
    const b = await l.boundingBox()
    if (!b) throw new Error('target not visible')
    boxes.push(b)
  }
  const vw = page.viewportSize().width
  const vh = page.viewportSize().height
  const x0 = Math.max(0, Math.min(...boxes.map((b) => b.x)) - pad)
  const y0 = Math.max(0, Math.min(...boxes.map((b) => b.y)) - pad)
  const x1 = Math.min(vw, Math.max(...boxes.map((b) => b.x + b.width)) + pad)
  const y1 = Math.min(vh, Math.max(...boxes.map((b) => b.y + b.height)) + pad)
  return page.screenshot({ path, clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 } })
}

function helpers(page) {
  return {
    dialog: () => page.getByRole('dialog').last(),
    text: (t, exact = true) => page.getByText(t, { exact }).first(),
    button: (n, exact = false) => page.getByRole('button', { name: n, exact }).first(),
    // Outline an element and, if given, put a step number on it.
    mark: async (locator, n = null) => {
      const b = await locator.boundingBox()
      if (!b) throw new Error('mark: target not visible')
      await page.evaluate(
        ({ b, n }) => {
          const ring = document.createElement('div')
          ring.dataset.docsMark = ''
          Object.assign(ring.style, {
            position: 'fixed', left: `${b.x - 4}px`, top: `${b.y - 4}px`, width: `${b.width + 8}px`, height: `${b.height + 8}px`,
            border: '2px solid #465fff', borderRadius: '10px', boxShadow: '0 0 0 4px rgba(70,95,255,.22)',
            pointerEvents: 'none', zIndex: 2147483647,
          })
          document.body.appendChild(ring)
          if (n !== null) {
            const dot = document.createElement('div')
            dot.textContent = String(n)
            Object.assign(dot.style, {
              position: 'fixed', left: `${b.x - 14}px`, top: `${b.y - 14}px`, width: '22px', height: '22px',
              borderRadius: '50%', background: '#465fff', color: '#fff', font: '600 12px/22px Geist, system-ui, sans-serif',
              textAlign: 'center', boxShadow: '0 0 0 2px #fff', pointerEvents: 'none', zIndex: 2147483647,
            })
            document.body.appendChild(dot)
          }
        },
        { b, n },
      )
    },
    // Hover so tooltips and hover-only buttons show.
    hover: (locator) => locator.hover(),
    wait: (ms) => page.waitForTimeout(ms),
  }
}
