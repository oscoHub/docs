// Shots for Scheduling, Stores, Library, Insights, account, help and the
// tour. Same shape as shots.mjs.
import { readFileSync } from 'node:fs'

// The demo store's and Facebook Page's ids, written by seed-demo.php.
const STORE = readFileSync(new URL('./.store-uuid', import.meta.url), 'utf8').trim()
const CHANNEL = readFileSync(new URL('./.channel-id', import.meta.url), 'utf8').trim()
const INSTAGRAM = readFileSync(new URL('./.instagram-id', import.meta.url), 'utf8').trim()

// The API runs with the social stub, which reports no statistics for any
// platform. These are the ones Instagram reports (InstagramService).
const withInstagramMetrics = {
  patch: (j) => ({ ...j, data: { ...j.data, metrics: ['views', 'reach', 'reactions', 'comments', 'shares', 'saves', 'reposts'], has_engagement_rate: true } }),
}

// Home's "Use OSCOHub wherever you work" strip lists API and MCP, which
// aren't built. Hide it before a shot of Home.
async function hideWorkStrip(page) {
  const hide = page.getByRole('button', { name: 'Hide this' }).first()
  if (await hide.isVisible().catch(() => false)) {
    await hide.click()
    await page.waitForTimeout(600)
  }
}

const page_ = (name, path, run) => ({ name, path, run })

// Scheduling's tabs carry their count in the name ("Issues 1").
async function clickTab(page, name) {
  const tab = page.getByRole('tab', { name: new RegExp('^' + name) }).first()
  await tab.waitFor({ state: 'visible' })
  // The board ignores a tab change made before its first load ends, so
  // click until the tab's own list request goes out.
  for (let attempt = 0; attempt < 4; attempt++) {
    const listed = page
      .waitForResponse((r) => r.url().includes('/scheduled-posts?') && /is_recurring=1|status=/.test(r.url()), { timeout: 4000 })
      .then(() => true, () => false)
    await tab.click()
    if (await listed) break
  }
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(1000)
}

function postKit() {
  const caption = `House Espresso is back in stock ☕\n\nOur everyday espresso: chocolate, hazelnut, low acidity.\n\n$38.00 · Shop now: https://shop.atlascoffee.example/product/house-espresso`
  return {
    success: true,
    data: {
      product: {
        id: 3, name: 'House Espresso', permalink: 'https://shop.atlascoffee.example/product/house-espresso',
        price: '38.00', regular_price: '38.00', sale_price: null, on_sale: false,
        short_description: 'Our everyday espresso: chocolate, hazelnut, low acidity.', sku: 'ATL-102',
        stock_quantity: 20, sale_ends_at: null, categories: ['Blends'], status: 'publish', publish_at: null,
        currency: 'USD', store_name: 'Atlas Coffee Shop',
      },
      media: [{ url: 'http://localhost:4300/demo/product-house.png', width: 800, height: 800 }],
      captions: Object.fromEntries(['default', 'facebook', 'instagram', 'linkedin', 'threads', 'bluesky', 'telegram', 'youtube'].map((p) => [p, { content: caption, template_id: null, template_name: null }])),
      template_values: {},
      skipped: 0,
      quota_reached: false,
    },
  }
}

export const more = [
  // ---- Managing posts -------------------------------------------------
  page_('scheduling', 'scheduling'),
  page_('manage-list', 'scheduling', async (page, h) => {
    await page.getByText('List', { exact: true }).first().click()
    await h.wait(900)
  }),
  page_('manage-issues', 'scheduling', async (page, h) => {
    await clickTab(page, 'Issues')
    await page.getByRole('button', { name: 'Retry' }).first().waitFor()
    await h.wait(900)
    await h.mark(page.getByRole('button', { name: 'Retry' }).first(), 1)
  }),
  page_('manage-post-menu', 'scheduling', async (page, h) => {
    await clickTab(page, 'Pending')
    await h.wait(900)
    await page.getByRole('button', { name: 'More options' }).first().click()
    await h.wait(500)
  }),
  page_('manage-recurring', 'scheduling', async (page, h) => {
    await clickTab(page, 'Recurring')
    await h.wait(900)
  }),

  // ---- Stores ---------------------------------------------------------
  page_('store-connect-window', '?connect=stores', async (page, h) => {
    const d = h.dialog()
    await h.mark(d.getByRole('button', { name: /WooCommerce/ }).first(), 1)
    return d
  }),
  page_('store-connect-form', '?connect=stores', async (page, h) => {
    await h.dialog().getByRole('button', { name: /WooCommerce/ }).first().click()
    await h.wait(800)
    const d = h.dialog()
    await d.locator('input').first().fill('https://shop.atlascoffee.example')
    return d
  }),
  page_('store-overview', `stores/${STORE}`),
  page_('store-products', `stores/${STORE}`, async (page, h) => {
    await page.getByRole('button', { name: /^Products/ }).first().click()
    await h.wait(1000)
  }),
  page_('store-product-post', `stores/${STORE}`, async (page, h) => {
    await h.mark(page.getByRole('button', { name: 'Create a post about this product' }).first(), 1)
  }),
  {
    // The real endpoint copies product photos into storage, so it's stubbed
    // with what it returns for the first product on the page.
    ...page_('store-product-post-window', `stores/${STORE}`, async (page, h) => {
      await page.getByRole('button', { name: 'Create a post about this product' }).first().click()
      await h.wait(2000)
      await h.wait(500)
    }),
    stubs: { 'POST stores/*/products/*/post-kit': postKit() },
  },
  page_('store-templates', `stores/${STORE}`, async (page, h) => {
    await page.getByRole('button', { name: 'Templates', exact: true }).first().click()
    await h.wait(1000)
  }),

  // ---- Library --------------------------------------------------------
  page_('library-designs', 'designs', async (page, h) => {
    await h.mark(page.getByRole('button', { name: 'New design' }).first(), 1)
  }),
  page_('library-templates', 'templates', async (page, h) => {
    await h.mark(page.getByRole('button', { name: 'New template' }).first(), 1)
  }),
  page_('library-template-form', 'templates', async (page, h) => {
    await page.getByRole('button', { name: 'New template' }).first().click()
    await h.wait(800)
    return h.dialog()
  }),
  page_('library-ideas', 'ideas', async (page, h) => {
    await h.mark(page.getByRole('button', { name: 'New idea' }).first(), 1)
  }),
  page_('library-idea-form', 'ideas', async (page, h) => {
    await page.getByRole('button', { name: 'New idea' }).first().click()
    await h.wait(800)
    return h.dialog()
  }),

  // ---- Insights -------------------------------------------------------
  page_('insights-overview', 'insights'),
  page_('insights-overview-lower', 'insights', async (page, h) => {
    await page.mouse.move(800, 500)
    await page.mouse.wheel(0, 700)
    await h.wait(900)
  }),

  // ---- Account and plans ----------------------------------------------
  // The plan cards only: the Monthly/Yearly switch above them isn't real yet.
  page_('plans-upgrade', 'upgrade', async (page) =>
    // The smallest box holding both the Free and the Pro card.
    page.getByText('Free', { exact: true }).first().locator('xpath=ancestor::div[.//*[normalize-space(text())="Pro"]][1]'),
  ),
  page_('account-usage', 'scheduling', async (page, h) => {
    await page.getByRole('button', { name: /^Usage/ }).first().click()
    await h.wait(700)
  }),
  // Sections framed one by one: "Sessions & devices" on this page isn't real.
  page_('account-two-step', 'settings', async (page, h) => {
    const b = page.getByRole('button', { name: 'Turn on' }).first()
    await h.mark(b, 1)
    return page.getByText('Two-step login', { exact: false }).first().locator('xpath=ancestor::*[.//button[contains(., "Turn on")]][1]')
  }),
  page_('account-data', 'settings', async (page, h) => {
    const b = page.getByRole('button', { name: 'Delete my account' }).first()
    await b.scrollIntoViewIfNeeded()
    const prepare = page.getByRole('button', { name: 'Prepare my data' }).first()
    await h.mark(prepare, 1)
    await h.mark(b, 2)
    return [page.getByText('Your data', { exact: true }).first(), prepare, b]
  }),
  page_('account-menu', 'scheduling', async (page, h) => {
    await page.getByRole('button', { name: 'Account menu' }).first().click()
    await h.wait(600)
  }),

  // ---- Help -----------------------------------------------------------
  {
    // Only the request form: the contact cards beside it are placeholders.
    ...page_('help-contact-form', 'contact', async (page) => {
      const form = page.locator('textarea').first().locator('xpath=ancestor::form[1]')
      await form.scrollIntoViewIfNeeded()
      await page.waitForTimeout(400)
      return form
    }),
    height: 1100,
  },
  page_('help-community-ideas', 'community/ideas'),
  page_('help-roadmap', 'community/roadmap'),

  // ---- A channel's page -----------------------------------------------
  page_('channel-menu', `channels/${CHANNEL}`, async (page, h) => {
    await page.getByRole('button', { name: 'More options' }).first().click()
    await h.wait(600)
    await h.mark(page.getByRole('menuitem', { name: 'Check & update' }).first(), 1)
  }),
  page_('channel-timezone', `channels/${CHANNEL}`, async (page, h) => {
    await h.mark(page.getByRole('button', { name: 'Timezone' }).first(), 1)
  }),

  // ---- Signed out -----------------------------------------------------
  { name: 'auth-signup', path: 'signup', anon: true },
  { name: 'auth-signin', path: 'signin', anon: true },
  { name: 'auth-reset', path: 'reset-password', anon: true },

  // ---- Getting around -------------------------------------------------
  page_('tour-home', '', async (page) => {
    await hideWorkStrip(page)
  }),
  page_('tour-notifications', 'scheduling', async (page, h) => {
    await page.getByRole('button', { name: 'Notifications' }).first().click()
    await h.wait(800)
  }),
  page_('tour-search', '', async (page, h) => {
    await hideWorkStrip(page)
    await page.getByPlaceholder('Search pages, channels and stores').first().click()
    await page.keyboard.type('atlas')
    await h.wait(800)
  }),
]
