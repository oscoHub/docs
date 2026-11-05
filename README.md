# OSCOHub Help Center

The customer knowledge base for [OSCOHub](https://app.oscohub.com), built on [Mintlify](https://mintlify.com).

## Run it locally

You need Node.js 20.17 or newer. From this folder, run:

```bash
npx mint@latest dev
```

The preview opens at `http://localhost:3000`.

## Check your changes

```bash
npx mint@latest validate
npx mint@latest broken-links --check-anchors
```

## Layout

| Path | What's in it |
|---|---|
| `docs.json` | Site settings, branding and navigation |
| `get-started/` | Quickstart, sign-up and a tour of the app |
| `channels/` | Connecting and managing each platform |
| `posts/` | Writing, scheduling and managing posts |
| `library/` | Designs, post templates and post ideas |
| `insights/` | Statistics |
| `stores/` | WooCommerce |
| `plans/` | Plans, billing and limits |
| `account/` | Sign-in, security, data and deletion |
| `help/` | Troubleshooting, support and feedback |
| `images/` | Screenshots, as light and dark pairs |
| `logo/` | The OSCOHub logos, copied from the app |

## Writing

[`AGENTS.md`](AGENTS.md) has the terminology, the style rules, and the list of things in the app that look real but aren't built yet. Read it before writing a page.

## Publishing

Once Mintlify's GitHub app is connected to this repository, pushes to the default branch deploy automatically.
