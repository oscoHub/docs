// Shared helpers for the Help Center screenshot scripts. See README.md.
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire('file:///E:/osco/app/frontEnd/package.json')
export const { chromium } = require('@playwright/test')

export const APP = process.env.DOCS_APP_URL ?? 'http://localhost:4300'
export const API = process.env.DOCS_API_URL ?? 'http://localhost:8010/api/v1'
export const EMAIL = 'demo@atlascoffee.test'
export const PASSWORD = 'Demo-password-2026!'
export const here = dirname(fileURLToPath(import.meta.url))
export const IMAGES = join(here, '..', '..', 'images')

/**
 * Chrome that can only reach localhost: every other host fails to resolve,
 * including the targets of server-side redirects, which page routes miss.
 */
export function launch() {
  return chromium.launch({
    channel: 'chrome',
    args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE cdnjs.cloudflare.com'],
  })
}

// Reused across runs (the login route is rate-limited). Gitignored.
const TOKEN_FILE = join(here, '.token')

export async function token() {
  const { readFileSync, writeFileSync, existsSync } = await import('node:fs')
  if (existsSync(TOKEN_FILE)) {
    const saved = readFileSync(TOKEN_FILE, 'utf8').trim()
    const ok = await fetch(`${API}/user`, { headers: { Authorization: `Bearer ${saved}`, Accept: 'application/json' } })
    if (ok.status === 200) return saved
  }
  const fresh = await login()
  writeFileSync(TOKEN_FILE, fresh)
  return fresh
}

async function login() {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const body = await res.json()
  if (!body?.data?.token) throw new Error(`login failed: ${JSON.stringify(body).slice(0, 200)}`)
  return body.data.token
}

/**
 * A page signed in as the demo account, in the given theme. Every write
 * request is refused unless `allowWrites` is set, so a stray click can't
 * change the demo data between shots.
 */
export async function open(browser, { theme = 'light', auth = null, allowWrites = false, width = 1440, height = 900, scale = 2 } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    timezoneId: 'UTC',
    locale: 'en-US',
    colorScheme: theme,
  })
  await context.addInitScript(
    ([t, tok]) => {
      localStorage.setItem('theme', t)
      localStorage.setItem('user-locale', 'en')
      if (tok) localStorage.setItem('auth_token', tok)
    },
    [theme, auth],
  )
  // Nothing leaves this machine: a connect button that would open Facebook or
  // Google gets an empty page instead, and that page is never captured.
  // The one exception is the app's icon font, a stylesheet from cdnjs.
  await context.route(/^https?:\/\/(?!localhost[:/]|cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/)/, (route) => route.abort())
  if (!allowWrites) {
    await context.route(`${API}/**`, (route) => {
      const m = route.request().method()
      if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return route.continue()
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":{}}' })
    })
  }
  const page = await context.newPage()
  return { context, page }
}

export async function settle(page, ms = 900) {
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.evaluate(() => document.fonts?.ready)
  await page.waitForTimeout(ms)
}
