# Labit Product Plan

Last updated: 2026-09-14

## Product Thesis

Labit is the patient and tenant orchestration layer for diagnostic care. It owns
the consumer journey end to end: discovery, booking, payment, home collection,
status tracking, report access, delivery, review, and repeat care.

Labit should not be an SDRC-only patient portal. SDRC is the first and deepest
provider implementation behind Labit, but the tenant pattern already exists in
the stack. Labit, SDRC, and future labs should be modeled as tenants/providers
inside the existing Labit platform shape, with adapters where a provider uses a
different core/LIMS.

The commercial wedge is not "replace every lab's LIMS." The wedge is the
patient/home-collection layer: acquisition, catalog, booking, payment, visit
tracking, report access, delivery, reviews, and reminders. That is closer to a
sellable product than any broader internal platform effort because the pieces
already exist and are being exercised in real operations.

Build Labit for SDRC first, but with product seams in place. SDRC should become
the first serious tenant/customer of the product, not a one-off demo or an
exception baked into the app. Use SDRC daily, harden the flow against real
booking/payment/report edge cases, then package that same patient journey for
other labs.

The right route is deliberately not a long abstract-platform build. Ship the
patient/home-collection wedge, keep adapter and capability boundaries clean, and
offer deeper core/ops integration as an upsell for labs that want more than the
front-door patient layer.

## System Roles

### Labit App

New patient-facing app and product surface.

- Brand: Labit
- UI: patient-friendly purple design system
- Runtime: independent repo, independent from `labit-ui` and existing
  `labit-patient`
- Responsibilities:
  - tenant-aware patient experience
  - catalog browsing
  - cart
  - booking
  - location and slot confirmation
  - payment handoff/status
  - visit timeline
  - report inbox
  - reminders
  - review/support

### Labit Core

Current `labit-main` becomes the Labit Core / tenant hub.

- Owns tenant-aware patient identity
- Owns home-visit booking and logistics
- Owns tenant-aware test menus where applicable
- Owns collection centres and logistics growth path
- Owns app-facing booking/payment/timeline orchestration
- Calls provider adapters for lab execution

This is the mature home-visit system and should remain the center of gravity
for booking, assignment, collection routing, and visit status.

### SDRC Core

Current `labit-core` should be treated as SDRC Core / provider core.

- LIMS and operational backend for a provider implementation
- Owns requisitions, billing, samples, results, reports, approvals
- Owns radiology, consignments, outsourcing, QC, machine integrations
- Already has a branch/lab scoping model that was seeded from `public.labs`
  and collection centres
- Should expose a provider contract instead of being called directly by the
  patient app

Important correction: SDRC Core is not purely single-branch or SDRC-only in
schema shape. It already carries multi-lab/branch concepts: historical
`public.labs(id)` references, the newer `labit_core.branch` master with
`kind IN ('lab', 'collection_centre')`, and seeded lab-style rows such as SDRC
and YAPHY. The product gap is therefore not "invent tenancy from scratch"; it is
to keep the tenant/branch relationship explicit, synchronized, and safe at the
Labit Core/provider boundary.

### Provider Cores

Each decent-sized lab can run its own core implementation or provider adapter.

Options:

- SDRC Core style self-hosted implementation
- lightweight Labit provider core
- existing LIMS/HIS wrapped by an adapter
- Shivam-style adapter, which should be kept operational

Small labs may run a lightweight core cheaply, for example on Vercel-style
hosting plus Supabase free/low-cost tiers, then scale up as usage grows.

### Workers And Utilities

- `labit-py`: report/report-delivery runtime where already used
- `py_utils`: shared worker patterns and utilities
- Workers must be tenant/provider configurable and switchable

## Architecture

Labit should use a canonical contract internally and translate at provider
boundaries.

```txt
Labit App
  -> Labit Core / tenant hub
      -> Provider Adapter
          -> SDRC Core
          -> Shivam Adapter
          -> Labit Light Core
          -> External LIMS Adapter
```

The app should not call SDRC Core directly. Labit Core chooses the provider
adapter based on tenant/provider configuration.

The current stack already shares tenant/lab concepts between `labit-main` and
`labit-core`, but those should still be treated as a contract boundary. Direct
cross-repo assumptions make future Shivam/external-LIMS integrations harder.

## Core Principle: Modular Independence

Every major piece must function without the others.

- Labit App can run without `labit-ui`.
- Labit App does not depend on existing `labit-patient`.
- Labit Core can route home-visit workflows through its mature tenant/home-visit
  tables.
- SDRC Core can continue as a provider core with deep LIMS features.
- Provider adapters can be added without changing the patient app.
- Workers can be enabled per tenant/provider.

Shared visual language is fine. Shared runtime dependencies between app repos
should be avoided unless deliberately packaged.

## Canonical Provider Contract

Every provider adapter should implement a versioned contract.

Minimum v1 capabilities:

- tenant/provider metadata
- catalog export/search
- package export/search
- price estimate
- create order/requisition
- acknowledge or reconcile payment
- get visit/order status
- get sample status
- get report status
- get report document
- cancel/reschedule when allowed
- delivery event writeback

Capabilities should be declared, not assumed. For example, one provider may
support direct payment confirmation while another only supports manual UPI
reconciliation.

Native Labit providers can implement this contract directly on top of the
existing Labit/Supabase schema. External providers get wrappers at each end:
Labit canonical shape on one side, their local Shivam/LIMS/API shape on the
other.

## Identity Model

Labit patient identity belongs primarily in Labit Core/current `labit-main`.
Provider cores keep their own local patient identity where required.

Provider identity is mapped:

```txt
labit_patient_id
tenant_id
provider_id
provider_patient_id / MRN
verified_link_status
consent_scope
```

A patient may have relationships with multiple providers. Provider cores keep
their own local patient identifiers and clinical records.

The existing Labit/Main database already contains much of this patient/visit/
tenant foundation. The remaining task is to make the mapping explicit for the
new app and for provider cores, not to duplicate identity into the patient app.

## Visit, Order, And Requisition Separation

Do not collapse home visits and lab requisitions into one object.

- A home visit may exist before a lab requisition.
- A requisition may exist without a home visit.
- A booking may be paid before collection.
- A provider may create the requisition before or after collection depending on
  its workflow.

Labit Core owns the patient-facing timeline across these systems.

## Payment Model

Payment authority must be tenant/provider configurable.

Supported modes:

- Labit collects payment and informs provider
- provider collects payment and Labit displays status
- generated UPI QR/link with manual reconciliation
- payment gateway/provider webhook with automatic confirmation

Current UPI QR generation is not enough for full automation because it does not
confirm payment by itself. Autonomous payment requires webhook or reconciliation
integration.

## Current Integration Gaps

The broad tenant model is established. The remaining integration gaps for the
first serious Labit pass are narrower:

- booking address/location needs to be first-class in the app-facing flow
- payment confirmation needs automation, not only QR/link generation
- home-visit assignment needs proximity/timeline/workload ranking
- requisition creation policy needs a product decision: fully automatic for
  eligible orders, human-reviewed for selected cases, or hybrid
- tenant-scope enforcement still needs product hardening in Labit Core where
  older docs flag partial RLS/API guard coverage

## Canonical Patient Journey

Target full loop:

```txt
Menu
  -> catalog/services
  -> cart
  -> booking
  -> address/location
  -> slot
  -> estimate
  -> payment
  -> confirmed home visit
  -> assignment
  -> collection
  -> provider requisition
  -> processing
  -> report ready
  -> report delivery
  -> review/reminder
```

Canonical events:

- booking_created
- estimate_ready
- payment_pending
- payment_confirmed
- visit_confirmed
- visit_assigned
- collector_en_route
- sample_collected
- sample_received
- processing
- report_ready
- report_delivered
- review_submitted

Adapters translate provider-specific status vocabularies into these events.

## Deployment Ladder

### Small Labs

- lightweight provider core
- Supabase free/low-cost database
- cheap serverless or small VPS hosting
- Labit-managed app/frontend updates
- optional paid capacity/top-ups

### Larger Labs

- self-hosted provider core
- dedicated database
- local/network integrations
- custom reports/templates
- machine/interface workers
- managed update/support path

### SDRC

- flagship deep implementation
- SDRC Core
- full diagnostics workflow
- radiology, outsourcing, consignments, reports, delivery, QC

## Build Plan

### Phase 0: Product And Contract Foundation

Estimate: 3-5 days fast pace, 1 week easy pace.

- scaffold new `labit-app`
- purple semantic token system
- shadcn/Tailwind v4 component base
- define Labit Core adapter clients
- document provider contract v1
- tenant config shape

### Phase 1: Catalog, Cart, Booking Intent

Estimate: 1-1.5 weeks fast pace, 2 weeks easy pace.

- catalog/services UI
- cart
- booking wizard
- address/location capture
- slot preference
- create home-visit booking through Labit Core/current `labit-main`

### Phase 2: Home Visit Execution

Estimate: 1.5-2 weeks fast pace, 3 weeks easy pace.

- capacity-aware slots if absent
- assignment visibility
- ETA/status events
- reschedule/cancel policy
- patient timeline fed from Labit Core

### Phase 3: Payment

Estimate: 1-2 weeks fast pace, 2-3 weeks easy pace.

- quote/payment screen
- payment intent model
- UPI/gateway adapter
- payment pending/confirmed states
- reconciliation/exception handling

### Phase 4: Provider Requisition Bridge

Estimate: 1-2 weeks fast pace, 2-3 weeks easy pace.

- create/link provider requisition
- map Labit visit/order to provider reqno/order id
- sync billing/payment acknowledgement where needed
- expose sample/lab timeline

### Phase 5: Reports, Delivery, Review

Estimate: 1 week fast pace, 2 weeks easy pace.

- report inbox
- report-ready notifications
- report document fetch
- delivery status/readback
- review/rating/support flow

### Phase 6: Hardening And Launch

Estimate: 1.5-2 weeks fast pace, 3 weeks easy pace.

- end-to-end tests
- tenant isolation tests
- mobile visual QA
- monitoring
- deployment pipeline
- privacy/DPDP review
- operational runbooks

## Timeline

Given the last 1-2 months of development speed, the codebase can move quickly,
but integration has repeatedly required live corrections, schema coordination,
and deployment verification.

Realistic estimates:

- MVP: 4-6 weeks
- serious autonomous loop: 8-10 weeks
- easy-ish pace with fewer regressions: 12-14 weeks
- with payment-provider delays or external LIMS onboarding: up to 16 weeks

## Immediate Next Artifact

Before coding the full app, create the Provider Contract v1 and Labit Core
booking adapter spec:

- request/response shapes
- tenant/provider identifiers
- idempotency keys
- event vocabulary
- error vocabulary
- capability flags
- payment authority rules
- provider identity mapping

This keeps Labit modular while still letting SDRC move first.
