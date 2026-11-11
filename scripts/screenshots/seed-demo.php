<?php

/*
 * Demo account for Help Center screenshots: "Atlas Coffee Roasters", a
 * fictional brand. Run it against a DISPOSABLE database only, never the
 * owner's `oscohub` database and never production. See README.md.
 *
 *   DB_DATABASE=oscohub_docs php -d variables_order=EGPCS artisan tinker \
 *     --execute='require "E:/osco/docs/scripts/screenshots/seed-demo.php";'
 *
 * Images point at http://localhost:4300/demo/, where the screenshot frontend
 * serves ./demo-assets. Channels have no tokens: the API runs with
 * E2E_STUB_SOCIAL=true, so nothing ever reaches a real platform.
 */

use App\Models\Channel;
use App\Models\Plan;
use App\Models\ScheduledPost;
use App\Models\Store;
use App\Models\StoreProduct;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

if (app()->environment('production') || DB::connection()->getDatabaseName() === 'oscohub') {
    throw new RuntimeException('seed-demo.php only runs on a disposable database.');
}

const DEMO_EMAIL = 'demo@atlascoffee.test';
const DEMO_PASSWORD = 'Demo-password-2026!';
$img = fn (string $name) => "http://localhost:4300/demo/{$name}";

// Start clean: the same data every run.
$old = User::where('email', DEMO_EMAIL)->first();
if ($old) {
    DB::table('scheduled_posts')->where('user_id', $old->id)->delete();
    DB::table('notifications')->where('user_id', $old->id)->delete();
    DB::table('designs')->where('user_id', $old->id)->delete();
    DB::table('post_templates')->where('user_id', $old->id)->delete();
    DB::table('post_ideas')->where('user_id', $old->id)->delete();
    DB::table('tags')->where('user_id', $old->id)->delete();
    Store::withTrashed()->where('user_id', $old->id)->get()->each->forceDelete();
    Channel::withTrashed()->where('user_id', $old->id)->get()->each->forceDelete();
    DB::table('subscriptions')->where('user_id', $old->id)->delete();
    DB::table('personal_access_tokens')->where('tokenable_id', $old->id)->delete();
    $old->forceDelete();
}

$user = User::forceCreate([
    'name' => 'Sam Rivera',
    'email' => DEMO_EMAIL,
    'password' => Hash::make(DEMO_PASSWORD),
    'password_set_at' => now(),
    'status' => 'Active',
    'email_verified_at' => now(),
    'onboarding_completed' => true,
    'timezone' => 'UTC',
]);
$user->assignRole('Enterprise');

Subscription::create([
    'user_id' => $user->id,
    'plan_id' => Plan::where('slug', 'enterprise')->value('id'),
    'status' => 'active',
    'payment_status' => 'paid',
    'start_date' => now()->subMonths(2),
    'end_date' => now()->addDays(20),
]);

// ---- Channels -------------------------------------------------------------
$channelDefs = [
    'facebook' => ['Atlas Coffee Roasters', 'avatar-atlas.png'],
    'instagram' => ['atlascoffee', 'avatar-atlas.png'],
    'linkedin' => ['Sam Rivera', 'avatar-user.png'],
    'threads' => ['atlascoffee', 'avatar-atlas-cream.png'],
    'youtube' => ['Atlas Coffee', 'avatar-atlas-blue.png'],
    'bluesky' => ['atlascoffee.bsky.social', 'avatar-atlas-green.png'],
    'telegram' => ['Atlas Coffee Club', 'avatar-atlas.png'],
];
$ch = [];
foreach ($channelDefs as $platform => [$name, $avatar]) {
    $ch[$platform] = Channel::forceCreate([
        'user_id' => $user->id,
        'platform' => $platform,
        'remote_id' => 'demo-'.$platform,
        'name' => $name,
        'avatar_url' => $img($avatar),
        'active' => true,
        'health_status' => 'healthy',
        'last_verified_at' => now()->subHours(3),
        'timezone' => 'UTC',
        'created_at' => now()->subWeeks(6),
    ]);
}

// ---- Posts ----------------------------------------------------------------
$post = function (array $a) use ($user) {
    return ScheduledPost::forceCreate(array_merge([
        'user_id' => $user->id,
        'content_type' => 'post',
        'media_type' => 'image',
        'media_urls' => [],
        'is_recurring' => false,
        'source' => 'manual',
        'requires_approval' => false,
        'retry_count' => 0,
        'post_group_id' => (string) Str::uuid(),
    ], $a));
};
$at = fn (int $days, int $hour, int $min = 0) => Carbon::today()->addDays($days)->setTime($hour, $min);

$published = [
    // channel, type, media, days ago, hour, text, views, reach, reactions, comments, shares
    ['instagram', 'post', ['post-new-roast.png'], -12, 9, "New roast, fresh this week. Our Ethiopia Yirgacheffe is back: jasmine, bergamot and a clean, tea-like finish.\n\n#specialtycoffee #freshroast", 4120, 3310, 312, 28, 14],
    ['facebook', 'post', ['post-new-roast.png'], -12, 9, "New roast, fresh this week. Our Ethiopia Yirgacheffe is back: jasmine, bergamot and a clean, tea-like finish. Order before Friday for weekend delivery.", 2380, 1960, 141, 17, 22],
    ['instagram', 'reel', ['post-latte-art.png'], -9, 18, "Latte art, step by step. Save this for your next morning at home.", 12800, 9400, 1104, 63, 210],
    ['linkedin', 'text', [], -8, 8, "We just hit a milestone: 10,000 bags roasted this year, all from farms we visit ourselves. Thank you to every partner and customer who made it possible.", 1890, 1420, 96, 12, 8],
    ['threads', 'text', [], -7, 12, "Hot take: a good grinder matters more than a fancy machine. Agree?", 960, 0, 74, 31, 5],
    ['youtube', 'short', ['post-latte-art.png'], -6, 17, "Latte art in 30 seconds", 5400, 0, 388, 22, 0],
    ['bluesky', 'text', [], -5, 10, "Cupping three new lots from Huila today. Notes so far: red apple, panela, a little cacao.", 410, 0, 38, 6, 9],
    ['facebook', 'post', ['post-brew-guide.png'], -4, 9, "The 4-minute French press: 30 g coffee, 500 ml water at 94 °C, stir at one minute, press at four. That's it.", 3150, 2700, 204, 25, 41],
    ['instagram', 'carousel', ['post-brew-guide.png', 'post-origin.png'], -3, 19, "Two ways to brew this week's Colombia Huila. Swipe for the recipe.", 6020, 4880, 520, 44, 37],
    ['telegram', 'text', [], -2, 8, "Club members: the Kenya AA micro-lot opens tomorrow at 9:00. 40 bags only.", 830, 0, 0, 0, 0],
];
$pubPosts = [];
foreach ($published as [$platform, $type, $media, $d, $h, $text, $views, $reach, $react, $comm, $shares]) {
    $p = $post([
        'channel_id' => $ch[$platform]->id,
        'content_type' => $type,
        'media_type' => $media ? ($type === 'reel' || $type === 'short' ? 'video' : 'image') : 'none',
        'media_urls' => array_map($img, $media),
        'content' => $text,
        'title' => $platform === 'youtube' ? 'Latte art in 30 seconds' : null,
        'metadata' => $platform === 'youtube' ? ['youtube_title' => 'Latte art in 30 seconds'] : [],
        'scheduled_at' => $at($d, $h),
        'published_at' => $at($d, $h, 1),
        'status' => 'published',
        'created_at' => $at($d - 2, 15),
    ]);
    $pubPosts[] = $p;
    DB::table('post_metrics')->insert([
        'scheduled_post_id' => $p->id,
        'channel_id' => $p->channel_id,
        'views' => $views,
        'reach' => $reach ?: null,
        'reactions' => $react,
        'comments' => $comm,
        'shares' => $shares,
        'saves' => $platform === 'instagram' ? intdiv($react, 6) : null,
        'fetch_state' => 'ok',
        'last_fetched_at' => now()->subHours(5),
        'next_fetch_at' => now()->addHours(19),
        'failed_attempts' => 0,
        'created_at' => now()->subDays(1),
        'updated_at' => now()->subHours(5),
    ]);
}

// Follower history for Insights.
foreach ($ch as $platform => $channel) {
    $base = ['facebook' => 5200, 'instagram' => 8400, 'linkedin' => 1300, 'threads' => 2100, 'youtube' => 950, 'bluesky' => 640, 'telegram' => 410][$platform];
    for ($i = 30; $i >= 0; $i--) {
        DB::table('channel_follower_counts')->insert([
            'channel_id' => $channel->id,
            'recorded_on' => Carbon::today()->subDays($i)->toDateString(),
            'followers' => $base + (30 - $i) * intdiv($base, 300) + ($i % 4) * 3,
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}

$upcoming = [
    ['instagram', 'post', ['post-weekend.png'], 1, 10, "Weekend tasting in the shop, 10 to 2. Three new coffees, free to try."],
    ['facebook', 'post', ['post-weekend.png'], 1, 10, "Weekend tasting in the shop, 10 to 2. Three new coffees, free to try. Bring a friend."],
    ['linkedin', 'post', ['post-team.png'], 2, 8, "We're hiring a head roaster in Casablanca. If you love light roasts and spreadsheets in equal measure, we'd like to meet you."],
    ['youtube', 'video', ['post-origin.png'], 3, 17, "From farm to cup: a week with our partners in Huila, Colombia."],
    ['threads', 'text', [], 4, 12, "What's your go-to brew method on a busy morning?"],
    ['instagram', 'story', ['design-story.png'], 5, 9, null],
    ['bluesky', 'text', [], 6, 11, "The Kenya AA is down to its last 12 bags. Thanks for the love on this one."],
    ['facebook', 'post', ['design-sale.png'], 8, 9, "Flash sale: 20% off all beans this Friday only."],
    ['instagram', 'post', ['design-quote.png'], 10, 8, "Good coffee is a slow thing. Happy Monday."],
    ['telegram', 'text', [], 12, 8, "Club members: next month's subscription box ships on the 1st. Reply with your grind size if it changed."],
];
foreach ($upcoming as [$platform, $type, $media, $d, $h, $text]) {
    $post([
        'channel_id' => $ch[$platform]->id,
        'content_type' => $type,
        'media_type' => $media ? ($type === 'video' ? 'video' : 'image') : 'none',
        'media_urls' => array_map($img, $media),
        'content' => $text,
        'title' => $platform === 'youtube' ? 'From farm to cup: Huila, Colombia' : null,
        'metadata' => $platform === 'youtube' ? ['youtube_title' => 'From farm to cup: Huila, Colombia', 'youtube_privacy' => 'public'] : [],
        'scheduled_at' => $at($d, $h),
        'status' => 'pending',
        'created_at' => now()->subDays(1),
    ]);
}

// A weekly recurring post.
$post([
    'channel_id' => $ch['facebook']->id,
    'content' => "Monday brew tip: weigh your coffee. 1 gram for every 16 ml of water is a great place to start.",
    'media_type' => 'none',
    'scheduled_at' => $at(7, 8),
    'status' => 'pending',
    'is_recurring' => true,
    'recurrence_rule' => ['frequency' => 'weekly', 'interval' => 1, 'count' => 8],
]);

// Drafts.
$post(['channel_id' => $ch['instagram']->id, 'content' => "Behind the scenes at the roastery (draft: add photos)", 'media_type' => 'none', 'scheduled_at' => $at(9, 12), 'status' => 'draft']);
$post(['channel_id' => $ch['linkedin']->id, 'content' => "Our sourcing report for 2026: what we paid, and why.", 'media_type' => 'none', 'scheduled_at' => $at(14, 9), 'status' => 'draft']);

// One failed post, so Issues has something to explain.
$failed = $post([
    'channel_id' => $ch['instagram']->id,
    'content' => "Our new cold brew blend is here.",
    'media_type' => 'image',
    'media_urls' => [$img('product-cold-brew.png')],
    'scheduled_at' => $at(-1, 9),
    'status' => 'failed',
    'error_message' => 'The image aspect ratio is not supported. Use a ratio between 4:5 and 1.91:1.',
    'metadata' => ['failure_reason' => 'platform_error'],
]);

// ---- Notifications --------------------------------------------------------
$notify = fn (array $a) => DB::table('notifications')->insert(array_merge([
    'user_id' => $user->id, 'is_read' => false, 'created_at' => now(), 'updated_at' => now(),
], $a));
$notify([
    'type' => 'post_failed',
    'title' => 'Post failed to publish on Instagram',
    'message' => "Your post could not be published to 'atlascoffee'. Reason: The image aspect ratio is not supported.",
    'post_id' => $failed->id, 'channel_id' => $ch['instagram']->id, 'platform' => 'instagram',
    'channel_name' => 'atlascoffee', 'content_type' => 'post', 'content_preview' => 'Our new cold brew blend is here.',
    'published_at' => $at(-1, 9), 'metadata' => json_encode(['reason' => 'platform_error']),
    'created_at' => $at(-1, 9), 'updated_at' => $at(-1, 9),
]);
foreach (array_slice($pubPosts, -3) as $p) {
    $notify([
        'type' => 'post_published',
        'title' => 'Post published on '.ucfirst($p->channel->platform),
        'message' => "Your post was published to '{$p->channel->name}'.",
        'post_id' => $p->id, 'channel_id' => $p->channel_id, 'platform' => $p->channel->platform,
        'channel_name' => $p->channel->name, 'content_type' => $p->content_type,
        'content_preview' => Str::limit($p->content ?? '', 120), 'published_at' => $p->published_at,
        'is_read' => true, 'created_at' => $p->published_at, 'updated_at' => $p->published_at,
    ]);
}

// ---- Library --------------------------------------------------------------
foreach ([['Flash sale', 'design-sale.png'], ['Monday quote', 'design-quote.png'], ['Menu story', 'design-story.png'], ['New roast', 'post-new-roast.png'], ['Brew guide', 'post-brew-guide.png'], ['Weekend tasting', 'post-weekend.png']] as $i => [$name, $file]) {
    DB::table('designs')->insert([
        'user_id' => $user->id, 'name' => $name, 'image_url' => $img($file), 'image_path' => 'demo/'.$file,
        'thumbnail_url' => $img($file), 'thumbnail_path' => 'demo/'.$file, 'source' => 'designs_page',
        'created_at' => now()->subDays(10 - $i), 'updated_at' => now()->subDays(10 - $i),
    ]);
}

foreach ([
    ['New roast announcement', 'coffee', "New roast, fresh this week: {{name}}.\n\nTasting notes: {{notes}}\nOrder before Friday for weekend delivery."],
    ['Brew tip', 'lightbulb', "Brew tip of the week: {{tip}}\n\nWhat's your favourite method? Tell us below."],
    ['Event invite', 'calendar', "Join us at the shop on {{date}}, {{time}}. {{details}}"],
] as [$name, $icon, $content]) {
    DB::table('post_templates')->insert([
        'user_id' => $user->id, 'name' => $name, 'icon' => $icon, 'content' => $content,
        'is_default' => false, 'created_at' => now()->subDays(20), 'updated_at' => now()->subDays(20),
    ]);
}

foreach ([
    ['Customer of the month', 'To Do', 'Feature a regular and their usual order.'],
    ['Roastery tour video', 'In Progress', 'Film the morning roast, 60 seconds, vertical.'],
    ['Water temperature myths', 'Unassigned', null],
    ['Holiday gift guide', 'To Do', 'Three bundles, three price points.'],
    ['Farm visit recap', 'Done', 'Photos are in the shared folder.'],
    ['Grinder comparison', 'Unassigned', null],
] as [$title, $status, $content]) {
    DB::table('post_ideas')->insert([
        'user_id' => $user->id, 'title' => $title, 'status' => $status, 'content' => $content,
        'created_at' => now()->subDays(5), 'updated_at' => now()->subDays(2),
    ]);
}

// ---- Store ----------------------------------------------------------------
$store = Store::forceCreate([
    'uuid' => (string) Str::uuid(),
    'user_id' => $user->id,
    'platform' => 'woocommerce',
    'name' => 'Atlas Coffee Shop',
    'store_url' => 'https://shop.atlascoffee.example',
    'external_id' => 'demo-store',
    'currency' => 'USD',
    'icon_url' => $img('store-logo.png'),
    'logo_url' => $img('store-logo.png'),
    'credentials' => ['consumer_key' => 'ck_demo', 'consumer_secret' => 'cs_demo'],
    'active' => true,
    'health_status' => 'healthy',
    'last_verified_at' => now()->subHours(2),
    'last_synced_at' => now()->subHours(2),
    'sync_status' => 'completed',
    'sync_imported' => 6,
    'remote_product_count' => 6,
    'default_cta' => 'Shop now',
    'created_at' => now()->subWeeks(4),
]);
$cats = [];
foreach (['Single origin', 'Blends', 'Decaf'] as $i => $c) {
    $cats[$c] = DB::table('store_categories')->insertGetId([
        'store_id' => $store->id, 'external_id' => 'cat-'.$i, 'name' => $c, 'slug' => Str::slug($c),
        'remote_count' => 2, 'last_synced_at' => now(), 'created_at' => now(), 'updated_at' => now(),
    ]);
}
$products = [
    ['Ethiopia Yirgacheffe', 'product-ethiopia.png', '18.50', null, 'instock', 42, 'Single origin', 'Floral and bright, with jasmine and bergamot.', 'publish', 1],
    ['Colombia Huila', 'product-colombia.png', '16.00', '13.60', 'instock', 75, 'Single origin', 'Red apple, panela and a cocoa finish.', 'publish', 1],
    ['House Espresso', 'product-house.png', '38.00', null, 'instock', 20, 'Blends', 'Our everyday espresso: chocolate, hazelnut, low acidity.', 'publish', 0],
    ['Swiss Water Decaf', 'product-decaf.png', '17.00', null, 'onbackorder', null, 'Decaf', 'All the flavour, none of the jitters.', 'publish', 0],
    ['Kenya AA', 'product-kenya.png', '21.00', null, 'outofstock', 0, 'Single origin', 'Blackcurrant and grapefruit. Back next season.', 'publish', 0],
    ['Cold Brew Blend', 'product-cold-brew.png', '24.00', null, 'instock', 33, 'Blends', 'Coarse ground for 12-hour cold brew.', 'draft', 0],
];
foreach ($products as $i => [$name, $file, $price, $sale, $stock, $qty, $cat, $desc, $status, $featured]) {
    $pid = DB::table('store_products')->insertGetId([
        'store_id' => $store->id, 'external_id' => (string) (1000 + $i), 'name' => $name,
        'description' => "<p>{$desc}</p>", 'short_description' => $desc, 'sku' => 'ATL-'.(100 + $i),
        'permalink' => 'https://shop.atlascoffee.example/product/'.Str::slug($name),
        'type' => 'simple', 'status' => $status, 'featured' => $featured,
        'price' => $sale ?? $price, 'regular_price' => $price, 'sale_price' => $sale,
        'stock_status' => $stock, 'stock_quantity' => $qty, 'variation_count' => 0,
        'total_sales' => [128, 96, 210, 40, 77, 0][$i], 'average_rating' => [4.8, 4.6, 4.9, 4.4, 4.7, 0][$i],
        'rating_count' => [32, 21, 58, 9, 14, 0][$i],
        'primary_image_url' => $img($file), 'image_count' => 1, 'posts_count' => 0,
        'external_created_at' => now()->subMonths(3), 'external_updated_at' => now()->subDays(3),
        'last_synced_at' => now()->subHours(2), 'created_at' => now()->subWeeks(4), 'updated_at' => now()->subHours(2),
    ]);
    DB::table('store_product_images')->insert([
        'store_product_id' => $pid, 'external_id' => 'img-'.$i, 'src' => $img($file), 'alt' => $name,
        'position' => 0, 'created_at' => now(), 'updated_at' => now(),
    ]);
    if (Schema::hasTable('store_category_product')) {
        DB::table('store_category_product')->insert(['store_product_id' => $pid, 'store_category_id' => $cats[$cat]]);
    }
}

// A product post, so the product shows as promoted.
$colombia = StoreProduct::where('store_id', $store->id)->where('name', 'Colombia Huila')->first();
$post([
    'channel_id' => $ch['instagram']->id,
    'store_product_id' => $colombia->id,
    'store_product_price' => '13.60',
    'content' => "Colombia Huila is 15% off this week. Red apple, panela and a cocoa finish.\n\nShop now: link in bio",
    'media_type' => 'image',
    'media_urls' => [$img('product-colombia.png')],
    'scheduled_at' => $at(2, 18),
    'status' => 'pending',
]);

echo "Demo account ready: {$user->email} (id {$user->id}), ".ScheduledPost::where('user_id', $user->id)->count()." posts\n";

// The screenshot scripts read the store's id from here.
file_put_contents(__DIR__.'/.store-uuid', $store->uuid);
file_put_contents(__DIR__.'/.channel-id', (string) $ch['facebook']->id);
file_put_contents(__DIR__.'/.instagram-id', (string) $ch['instagram']->id);
