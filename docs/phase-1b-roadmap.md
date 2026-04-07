# Phase 1b Roadmap

## Goal
Prepare `sdrc-website` for:
- test-level search
- dynamic pricing from Shivam APIs
- cart and checkout

## Architecture direction
- Keep website app isolated from operational dashboard logic.
- Add thin API adapters in `lib/catalogApi.js`.
- Introduce dedicated routes:
  - `/tests` for searchable test list
  - `/cart` and `/checkout` for commerce flow (next step)
- Preserve package pages as discovery entry points.

## Next implementation steps
1. Add server routes:
- `GET /api/tests/search`
- `GET /api/tests/price`

2. Define normalized DTO:
- `test_code`
- `test_name`
- `department`
- `mrp`
- `offer_price`
- `tat_hours`
- `preparation`

3. Cart foundation:
- local cart state with persistent storage
- item-level quantity and add-on rules
- pricing summary + coupon placeholder

4. Checkout foundation:
- patient details
- slot selection
- payment intent handoff
- booking confirmation screen

## Notes
Current `/tests` route is scaffold-only and uses package-derived fallback data until live APIs are connected.
