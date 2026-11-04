# Website analytics: what is recorded, read and sent (2026-11-05)

Pipeline: browser `trackEvent()` (lib/analytics.js) -> `POST /api/analytics/event` -> Supabase table `website_events`
(written with the server key; RLS is deny-by-default). labit-main reads it in `app/api/cto/latest/route.js`.

## Recorded per event (columns) + payload
session_id, page_path, referrer, user_agent, ip_hash, phone (only on request events), utm_source, gclid, fbclid, payload.
Payload now always carries: `device` (mobile|tablet|desktop), `returning`, `landing_path`, `first_ref_host`, `ref_host`,
`lang`, and (server-set) `is_bot`.

## Event names
page_view, view_package_details, toggle_compare, open_compare_modal, search_tests, search_packages, add_to_cart,
remove_from_cart, clear_cart, submit_request_click / _success / _fail, home_pkg_category_open (homepage package icon),
banner_click (banner_id), app_login_start (homepage app banner), **call_click, whatsapp_click, app_click**
(payload: placement, label) -- the last three are new and catch tel:, wa.me and app.sdrc.in / app.labit.online links.

## Read by labit-main today
Unique sessions/day (30d), top pages (7d), active now (15m), UTM source (7d). `event_name` is never read, so no funnel or
conversion figure exists; rows are pulled (limit 50,000) and counted in JS.

## Sent onward
Cart/home-visit requests go to labit-core (QUICKBOOKING_LEAD_URL) with items/name/phone/area/slot. They carry no session or
campaign; the join key to analytics is `phone` on the `submit_request_success` event.

## Wanted in labit-main (read side), all excluding `payload->>'is_bot' = 'true'`
1. Funnel (distinct sessions, 7d/30d): page_view -> view_package_details|search_* -> add_to_cart -> submit_request_click ->
   submit_request_success; plus any of call_click|whatsapp_click|app_click|app_login_start as "contact intent".
2. Conversions by source: utm_source, else ref_host, else 'direct'; conversion = success or contact intent.
3. Contact intent split: calls vs WhatsApp vs app, by placement.
4. Top packages/tests added to cart (from add_to_cart payload), top searches, banner click-through (banner_click vs page_view of /).
5. Audience: device split, new vs returning, top landing pages.
Aggregate with date-bounded queries selecting only needed columns (or a SQL view/RPC if DDL is allowed) instead of
pulling 50,000 rows per metric. Expose as GET /api/cto/website-stats (same auth as cto/latest).

## Not done / decisions
- Writes still go from the website straight to Supabase (the website host holds the server key). Moving ingestion behind a
  narrow labit-main endpoint would remove that key from the website and let labit-main filter bots centrally.
- Leads do not carry a session id; add `session_id` to the lead only if labit-core's lead endpoint can accept extra fields.
