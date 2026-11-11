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
| The Dashboard's **Distribution Overview** and **Posts by Category** | Hard-coded or generated numbers in `PostStatusDistribution.vue` and `PostsActivityTimeline.vue`, the same for every account. Only the three usage cards at the top are real. |
| **Posting Schedule** in a channel's menu | Not checked yet. Confirm in the code before documenting it. |

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

Images live in `/images/` as a `-light.png` and `-dark.png` pair. Show them with the `Screenshot` snippet, which picks the one for the reader's theme:

```mdx
import { Screenshot } from '/snippets/screenshot.jsx';

<Screenshot name="connect-window" alt="What the image shows, for screen readers" caption="Optional caption" />
```

**Never take screenshots by hand.** Every image comes from `scripts/screenshots/`, which drives the live (`main`) build of the app, signed in as a fictional demo brand (Atlas Coffee Roasters), and captures both themes. To add one, add a shot to `shots.mjs` or `shots-more.mjs` and run it. To retake them all after a redesign, run `node shoot.mjs`. The [README](scripts/screenshots/README.md) has the setup.

A screenshot earns its place when it shows where to click. Mark the control a step names with the script's numbered outline (`h.mark(locator, n)`), and say the number in the text when there's more than one. Put the image after the sentence that describes it.

Never capture:

- Real accounts, real customer data, or anything from the owner's own database.
- Anything in the "Do not document" table above. That includes the Dashboard's lower charts, the Contact page's phone numbers and hours, sessions on Settings, and the plans page's yearly toggle.
- The dev build, which shows the Vue DevTools button. The script uses a production build.

## Before you finish

Run all three from this folder and fix what they report:

```bash
npx mint@latest validate
npx mint@latest broken-links --check-anchors
npx mint@latest dev --no-open
```
