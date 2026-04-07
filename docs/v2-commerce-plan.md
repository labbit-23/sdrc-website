# SDRC Website V2: Test Discovery, Cart, Booking, Payments

## Goal
Turn the public website into a transactional diagnostics portal where patients can:
- discover tests/packages
- understand purpose and preparation
- add tests/packages to cart
- book slot/home-collection
- pay online
- track/report status

## Architecture (recommended)
- Keep this as the dedicated public Next.js app (`sdrc-website`).
- Integrate with Labbit APIs over HTTP; do not tightly couple UI and internal dashboard logic.
- Add a BFF layer in this app (`/app/api/*`) to normalize upstream API responses, cache, and shield credentials.

## Domain model
- Test:
  - `test_code`, `name`, `category`, `price_mrp`, `price_offer`, `tat_hours`
  - `sample_type`, `fasting_required`, `home_collection_allowed`
  - `indications` (what it is for), `interpretation_summary`, `preparation`, `contraindications`
- Package:
  - `package_code`, `name`, `price`, `included_test_codes[]`, `summary`, `prep_notes[]`
- Cart line:
  - `type` (`test`|`package`), `code`, `name`, `unit_price`, `qty`
- Booking:
  - patient details, slot, address, collection type, cart snapshot, totals, payment status

## API contract to request from backend (Shivam)
1. `GET /catalog/tests?query=&category=&page=&limit=`
- returns test list with `name`, `code`, `price`, `indications_short`, `tat_hours`

2. `GET /catalog/tests/{code}`
- returns full detail including interpretation/preparation blocks

3. `GET /catalog/packages?query=&page=&limit=`
- returns package summary and price

4. `GET /catalog/packages/{code}`
- returns full package including included tests and notes

5. `POST /checkout/quote`
- input: cart lines + location
- output: pricing breakdown (subtotal, collection fee, discount, tax, total)

6. `POST /bookings`
- input: patient + slot + address + cart + quote id
- output: booking id, payable amount

7. `POST /payments/create-order`
- input: booking id, amount
- output: gateway order/token

8. `POST /payments/webhook`
- backend-only callback for payment confirmation

9. `GET /bookings/{id}`
- status tracking and final invoice/report links

## Frontend v2 implementation phases
### Phase 2.1 (Search + PDP)
- Build searchable test listing page and test detail page.
- Add interpretation/preparation sections with physician disclaimer.
- Add package detail page aligned with same data model.

### Phase 2.2 (Cart + Quote)
- Add persistent cart (localStorage + server quote sync).
- Coupon placeholder and location-based quote calculation.
- Cart drawer + checkout summary.

### Phase 2.3 (Booking)
- Add patient profile form, address, slot, home collection selector.
- Create booking draft and booking confirmation page.

### Phase 2.4 (Payments)
- Integrate payment gateway via backend order creation.
- Success/failure handling, retries, and idempotency.

### Phase 2.5 (Trust + Content)
- Test education content (purpose, when ordered, normal context).
- SEO pages for top tests and top packages.
- FAQs and structured schema markup.

## Data/content ownership
- Medical interpretation content should be backend-managed CMS fields, versioned and approved.
- Frontend should render trusted rich text blocks with sanitization.

## Non-functional requirements
- Cache catalog responses (ISR / revalidate + edge cache headers).
- Rate limiting on search endpoints.
- PII encryption at rest on booking payloads.
- Audit trail for booking and payment state transitions.

## Immediate next sprint (practical)
1. Freeze API schema for `tests`, `test detail`, `quote`, `booking`.
2. Implement BFF routes in `sdrc-website/app/api` using mocked JSON fallback.
3. Build:
- `/tests` searchable list
- `/tests/[code]` detail with interpretation/preparation
- cart store + cart drawer
4. Wire package cards to add-to-cart.

## Suggested response payload for your request (test name, cost, interpretation)
```json
{
  "test_code": "TSH",
  "name": "Thyroid Stimulating Hormone (TSH)",
  "price": 450,
  "tat_hours": 12,
  "interpretation_summary": "Used to evaluate thyroid function; abnormal values may suggest hypo/hyperthyroidism and should be correlated clinically.",
  "preparation": ["No fasting required unless combined with fasting panel"],
  "sample_type": "Serum"
}
```
