// What to capture. Each shot: name (file name), path (app route), optional
// anon, width/height, stubs ({ 'api/path': json } for GETs the demo data
// can't produce), pad, and run(page, h), which drives the page and returns
// the element(s) to frame, or nothing for the whole window.
const img = (n) => `http://localhost:4300/demo/${n}`

const demoPages = (names) => ({
  pages: names.map(([id, name, pic]) => ({ id, name, picture: { data: { url: img(pic) } }, category: 'Coffee shop' })),
  connected_page_ids: [],
  provider: 'facebook',
  count: names.length,
  platform_allowed: true,
  quota: { limit: null, used: 6, remaining: null },
})

const connectCard = (platform) => ({
  name: `connect-card-${platform.toLowerCase()}`,
  path: '?connect=social',
  run: async (page, h) => {
    const d = h.dialog()
    await h.mark(d.getByRole('button', { name: new RegExp(`^${platform}`) }).first(), 1)
    return d
  },
})


const ASSETS = 'E:/osco/docs/scripts/screenshots/demo-assets/'
const CAPTION = `New roast, fresh this week. Our Ethiopia Yirgacheffe is back: jasmine, bergamot and a clean, tea-like finish.

Order before Friday for weekend delivery.`

// Open the post window and pick channels by their picker labels.
async function composer(page, h, channels = []) {
  await page.getByRole('button', { name: 'New Post' }).first().click()
  await h.wait(700)
  if (channels.length) {
    await page.getByRole('button', { name: 'Choose channels' }).first().click()
    await h.wait(400)
    for (const c of channels) await page.getByRole('button', { name: c }).first().click()
    await page.keyboard.press('Escape')
    await h.wait(500)
  }
  return h.dialog()
}
async function write(page, text = CAPTION) {
  await page.getByPlaceholder('What would you like to share?').first().fill(text)
}
async function addImage(page, h, file = 'post-new-roast.png') {
  await page.locator('[role=dialog] input[type=file][accept*=image]').first().setInputFiles(ASSETS + file)
  await h.wait(1200)
}
const FB = 'Atlas Coffee Roasters Facebook'
const IG = 'atlascoffee Instagram'
const LI = 'Sam Rivera LinkedIn'

export const shots = [
  // ---- Channels -------------------------------------------------------
  {
    name: 'connect-open',
    path: 'scheduling',
    pad: 0,
    run: async (page, h) => {
      await h.mark(page.getByRole('button', { name: 'Connect a channel' }), 1)
      await h.mark(page.getByRole('button', { name: 'Connect messaging' }), 2)
      await h.mark(page.getByRole('button', { name: 'Connect a store' }), 3)
      return page.locator('aside').first()
    },
  },
  {
    name: 'connect-window',
    path: '?connect=social',
    run: async (page, h) => h.dialog(),
  },
  connectCard('Facebook'),
  connectCard('Instagram'),
  connectCard('LinkedIn'),
  connectCard('Threads'),
  connectCard('YouTube'),
  connectCard('Bluesky'),
  {
    name: 'connect-instagram-method',
    path: '?connect=social',
    run: async (page, h) => {
      await h.dialog().getByRole('button', { name: /^Instagram/ }).first().click()
      await h.wait(600)
      return h.dialog()
    },
  },
  {
    name: 'connect-bluesky-form',
    path: '?connect=social',
    run: async (page, h) => {
      await h.dialog().getByRole('button', { name: /^Bluesky/ }).first().click()
      await h.wait(600)
      const d = h.dialog()
      await d.locator('input').nth(0).fill('atlascoffee.bsky.social')
      await d.locator('input').nth(1).fill('abcd-efgh-ijkl-mnop')
      await h.mark(d.getByText('Generate app password in Bluesky').first())
      return d
    },
  },
  {
    name: 'connect-messaging-window',
    path: '?connect=messaging',
    run: async (page, h) => {
      const d = h.dialog()
      await h.mark(d.getByRole('button', { name: /^Telegram/ }).first(), 1)
      return d
    },
  },
  {
    name: 'connect-telegram-form',
    path: '?connect=messaging',
    run: async (page, h) => {
      await h.dialog().getByRole('button', { name: /^Telegram/ }).first().click()
      await h.wait(800)
      return h.dialog()
    },
  },
  {
    name: 'connect-choose-pages',
    path: 'channels/integrations?code=demo&state=facebook',
    stubs: {
      'user/facebook/available-pages*': demoPages([
        ['101', 'Atlas Coffee Roasters', 'avatar-atlas.png'],
        ['102', 'Atlas Coffee Casablanca', 'avatar-atlas-blue.png'],
        ['103', 'Atlas Wholesale', 'avatar-atlas-green.png'],
      ]),
    },
    run: async (page, h) => {
      await h.wait(1200)
      const d = h.dialog()
      await d.getByText('Atlas Coffee Roasters', { exact: true }).click()
      await h.mark(d.getByRole('button', { name: 'Connect', exact: true }), 2)
      return d
    },
  },
  {
    name: 'connect-telegram-details',
    path: '?connect=messaging',
    run: async (page, h) => {
      await h.dialog().getByRole('button', { name: /^Telegram/ }).first().click()
      await h.wait(700)
      await h.dialog().getByRole('button', { name: /Next/ }).first().click()
      await h.wait(500)
      await h.dialog().getByRole('button', { name: /Next/ }).first().click()
      await h.wait(500)
      return h.dialog()
    },
  },
  // ---- Posts ----------------------------------------------------------
  {
    name: 'post-create-menu',
    path: 'scheduling',
    pad: 16,
    run: async (page, h) => {
      await page.getByRole('button', { name: 'Create', exact: true }).first().click()
      await h.wait(500)
      const item = page.getByRole('button', { name: 'Create Post' }).first()
      await h.mark(item, 1)
      return [page.getByRole('button', { name: 'Create', exact: true }).first(), item, page.getByRole('button', { name: 'New Template' }).first()]
    },
  },
  {
    name: 'post-choose-channels',
    path: 'scheduling',
    run: async (page, h) => {
      await page.getByRole('button', { name: 'New Post' }).first().click()
      await h.wait(700)
      await page.getByRole('button', { name: 'Choose channels' }).first().click()
      await h.wait(400)
      await page.getByRole('button', { name: FB }).first().click()
      await page.getByRole('button', { name: IG }).first().click()
      await h.mark(page.getByRole('button', { name: 'Add another channel' }).first(), 1)
      return null
    },
  },
  {
    name: 'post-window',
    path: 'scheduling',
    run: async (page, h) => {
      await composer(page, h, [FB, IG])
      await write(page)
      await addImage(page, h)
      return null
    },
  },
  {
    name: 'post-tailor',
    path: 'scheduling',
    run: async (page, h) => {
      await composer(page, h, [FB, IG])
      await write(page)
      await addImage(page, h)
      const ig = page.getByText('Mirroring', { exact: true }).first()
      await ig.scrollIntoViewIfNeeded()
      await h.wait(400)
      await h.mark(ig, 1)
      return null
    },
  },
  {
    name: 'post-types',
    path: 'scheduling',
    run: async (page, h) => {
      await composer(page, h, [IG])
      await write(page, 'Latte art, step by step.')
      const reel = page.getByRole('button', { name: 'Reel', exact: true }).first()
      await h.mark(reel.locator('xpath=..'), 1)
      return null
    },
  },
  {
    name: 'post-date-picker',
    path: 'scheduling',
    run: async (page, h) => {
      await composer(page, h, [FB])
      await write(page)
      await page.locator('[role=dialog] input[type=text]').filter({ hasNotText: 'x' }).last().click()
      await h.wait(700)
      return null
    },
  },
  {
    name: 'post-settings-recurring',
    path: 'scheduling',
    run: async (page, h) => {
      await composer(page, h, [FB])
      await write(page)
      await page.getByRole('button', { name: 'Post settings' }).first().click()
      await h.wait(700)
      const toggle = page.getByText('Recurring post', { exact: false }).first()
      await toggle.click()
      await h.wait(700)
      await h.mark(toggle, 1)
      return null
    },
  },
  {
    name: 'post-schedule',
    path: 'scheduling',
    run: async (page, h) => {
      await composer(page, h, [FB])
      await write(page)
      await addImage(page, h)
      await page.getByRole('button', { name: 'Change publish mode' }).first().click()
      await h.wait(500)
      return null
    },
  },
]
