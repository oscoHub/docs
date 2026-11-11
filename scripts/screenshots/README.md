# Help Center screenshots

Every image in `/images/` is made here, in light and dark, from the live
version of the app, signed in as a fictional brand: **Atlas Coffee Roasters**.
Never take a Help Center screenshot by hand.

This folder is in `.mintignore`, so none of it is published.

## What's here

| File | What it does |
|---|---|
| `shoot.mjs` | Takes the screenshots. `node shoot.mjs` for all of them, `node shoot.mjs connect-` for the ones whose name starts that way. |
| `shots.mjs`, `shots-more.mjs` | The list of shots: which page, what to click, what to mark, what to frame. |
| `seed-demo.php` | Creates the demo account and its channels, posts, statistics, store, products and library. |
| `make-assets.mjs` | Draws the demo images: logos, product bags and post visuals. No real photos. |
| `lib.mjs` | Sign-in, the browser, and the network block (below). |
| `probe.mjs`, `explore.mjs` | Planning aids: what's on a screen, and what a click opens. They write to `explore/`, which is ignored. |
| `preview-docs.mjs` | Captures the local Mintlify preview, to check the Help Center's own design. |

## Safety

- **The browser can only reach `localhost`** (plus the app's icon font on
  cdnjs). Every other host fails to resolve, so a connect button that would
  open Facebook or Google gets an error page, and no real platform is
  touched.
- **Every write is refused** unless a shot stubs it. A stray click can't
  change the demo data. A few shots stub one request, such as the product
  post kit, because the real one copies photos into storage.
- **The API runs with `E2E_STUB_SOCIAL=true`**, so nothing it does reaches a
  platform either.
- **`seed-demo.php` refuses the `oscohub` database.** Use a database of its
  own, as below.

## Set up

You need the app repository (`oscoHub/saas`) at `E:\osco\app`, MySQL running,
and Chrome installed.

1. **A worktree of the live branch**, so the pictures match what customers see:

   ```bash
   cd /e/osco/app && git fetch origin
   git worktree add --detach /e/osco/app-docs-main origin/main
   ```

   In it, run `composer install` in `backEnd/`. Don't link `vendor` from the
   main folder. Copy `backEnd/.env` over. Link
   `backEnd/public/storage` to `backEnd/storage/app/public` (a junction on
   Windows), or platform logos won't load. For `frontEnd/node_modules`, a
   junction to the main folder's is fine.

2. **A database of its own:**

   ```bash
   cd /e/osco/app-docs-main/backEnd
   export DB_DATABASE=oscohub_docs CACHE_STORE=database
   php -d variables_order=EGPCS artisan migrate:fresh --force
   php -d variables_order=EGPCS artisan db:seed --class=E2eSeeder --force
   php -d variables_order=EGPCS artisan tinker --execute='require "E:/osco/docs/scripts/screenshots/seed-demo.php";'
   ```

   `variables_order=EGPCS` makes PHP read the inline `DB_DATABASE`. Without
   it, Laravel uses `.env`'s database.

3. **The demo images:** `node make-assets.mjs`.

4. **The API**, on port 8010:

   ```bash
   cd /e/osco/app-docs-main/backEnd/public
   DB_DATABASE=oscohub_docs FRONTEND_URL=http://localhost:4300 CACHE_STORE=database \
   E2E_STUB_SOCIAL=true QUEUE_CONNECTION=sync \
   php -d variables_order=EGPCS -S localhost:8010 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php
   ```

5. **A production build of the frontend**, on port 4300. A production build
   is used because the dev server shows a Vue DevTools button.

   ```bash
   cd /e/osco/app-docs-main/frontEnd
   VITE_API_URL=http://localhost:8010/api/v1 VITE_TURNSTILE_SITE_KEY= npx vite build
   mkdir -p dist/demo && cp /e/osco/docs/scripts/screenshots/demo-assets/*.png dist/demo/
   npx vite preview --port 4300 --strictPort
   ```

6. **Take the screenshots:** `node shoot.mjs`. About 80 shots, two themes
   each, in roughly 20 minutes. Then look at them. A shot that passes can
   still be wrong.

## After a redesign

Pull the new `main` into the worktree (`git checkout --detach origin/main`),
rebuild the frontend, re-run `seed-demo.php`, and run `node shoot.mjs`. A shot
that fails names the click it couldn't make. Fix its selector in the shots
file. Files keep their names, so the pages need no change unless a step did.

## Known quirks

- Scheduling ignores a tab click made before its first load finishes, so
  `shoot.mjs` waits 2.5 seconds after each page load.
- The login route is rate-limited. The token is saved in `.token` and reused.
- `.store-uuid` and `.channel-id` are written by `seed-demo.php`, and the
  shots read them.
