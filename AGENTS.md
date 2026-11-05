# OSCOHub Help Center: writing instructions

Customer documentation for OSCOHub, built on [Mintlify](https://mintlify.com). Pages are MDX files with YAML frontmatter, and configuration lives in `docs.json`.

If you can run shell commands, run `npx mint@latest instructions` before any Mintlify task. It prints current guidance for this CLI version.

## Accuracy comes first

The product code is the source of truth, in the `oscoHub/saas` repository. Never document something because the app's screen shows it, because some screens are design previews with placeholder content.

**Do not document these as working until the code changes:**

| Area | Why |
|---|---|
| API keys and MCP (`/settings/api-keys`, `/settings/mcp`) | Placeholder data in `developerPlaceholders.ts`. There's no public API or MCP server. |
| Contact page phone, WhatsApp, email, hours, office and "All systems operational" | Placeholder data in `contactPlaceholders.ts`. Only the request form is real. |
| Sessions and devices, including the three-device limit | Design only. The API doesn't track sessions. |
| Editing name, phone, photo or time zone on Profile, and linking sign-in methods | Design only. |
| Email notification switches on Profile, weekly summaries | Design only. Publishing problems are in-app notifications. |
| Telegram's **Settings** tab and reposting from Telegram | Design only, with hard-coded numbers. |
| Yearly billing | The pricing page shows it, but a subscription request sends no billing period. |
| AI assistant, Academy, desktop and mobile apps, More-menu rows without a link | Marked as coming soon, or placeholders. |
| Posts for several products at once, product videos | Marked as coming next. |
| TikTok, X, Pinterest, WhatsApp, Discord, YouCan, Shopify, CSV, PrestaShop, Wix, BigCommerce, Magento | `coming_soon`. Check `GET /api/v1/social-platforms/active` for what's live. |
| LinkedIn company pages | The app card mentions them, but the code only requests `w_member_social`. |
| Personal Instagram accounts | The app card mentions them, but both connection methods need a professional account. |

**Do not document at all:**

- The AI Content Factory. It's the owners' internal tool, not a customer feature.
- Staff and admin features: the admin section, roles, permissions, moderation queues and tasks.
- Anything about how OSCOHub is built or hosted that a customer doesn't need.

When a fact is uncertain, leave it out and raise it with the owners. Don't assume in order to fill a gap.

Plan prices and limits in `plans/compare-plans.mdx` come from `PlansSeeder.php`, but admins can change them in the app. Confirm them against production when you edit that page.

## Terminology

| Use | Don't use |
|---|---|
| OSCOHub | OSCO, Osco Hub, the platform (for the product) |
| channel | account, integration, page (except for a Facebook Page) |
| connect, disconnect, reconnect | link, integrate |
| post | content, publication |
| post window | composer, modal |
| store | shop, integration |
| plan | subscription, tier |
| platform (Facebook, Instagram and so on) | network, provider |
| recurring post, repeating post | series (except for the set of repeats) |
| post template, product post template | template, on its own, where the two could be confused |

Spell UI labels exactly as they appear in `frontEnd/src/locales/en.json`, and put them in bold.

## Style

- Write for customers, not developers. Assume no technical background.
- Use active voice and second person ("you").
- Keep sentences short, with one idea each.
- Use sentence case for headings.
- Start a how-to with what the reader needs, then `<Steps>`.
- Use a table to compare things, and `<AccordionGroup>` for error messages with a fix.
- Use callouts sparingly: `<Warning>` for loss or surprise, `<Note>` for a limitation, `<Tip>` for a shortcut.
- Quote error messages as the app shows them, so readers can search for them.
- Link to a page instead of repeating its content.

## Pages

- Every page has a `title` and a `description`, and no `#` heading in its body.
- Every page is listed in `navigation` in `docs.json`.
- Internal links are root-relative with no extension: `/posts/create-a-post`.
- Moving a page needs a `redirects` entry in `docs.json`.

## Screenshots

Images live in `/images/` as a `-light.png` and `-dark.png` pair, and show demo data only. Use both together:

```mdx
<Frame caption="What it shows">
  <img className="block dark:hidden" src="/images/name-light.png" alt="Description" />
  <img className="hidden dark:block" src="/images/name-dark.png" alt="Description" />
</Frame>
```

Only add a screenshot where it helps someone find their way, because each one has to be retaken when the design changes. Never capture placeholder screens, real customer data, or the dev build's DevTools button.

## Before you finish

Run all three from this folder and fix what they report:

```bash
npx mint@latest validate
npx mint@latest broken-links --check-anchors
npx mint@latest dev --no-open
```
