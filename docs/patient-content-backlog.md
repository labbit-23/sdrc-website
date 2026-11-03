# Patient-facing catalogue content backlog

## Common tests and package audiences

Deferred enhancement: add clinically reviewed, patient-friendly information for
the most-booked/common tests and explain who each health package may be suitable
for.

### Test content

- What the test measures
- Why it is commonly ordered
- Who may be advised to take it
- Preparation requirements
- Sample type and expected reporting time
- Limitations and a clinical-interpretation disclaimer

Store editorial content separately from operational catalogue fields, keyed by
the stable `global_test_id` rather than the displayed test name. Test name,
price, sample type, TAT, availability, and accreditation continue to come from
the `lab_tests` catalogue.

### Package content

- Short purpose statement
- `best_suited_for` audience list
- Health areas covered
- Important inclusions
- Home-collection availability
- Preparation requirements
- Guidance on when to contact SDRC or a clinician before choosing

Extend the shared package catalogue rather than embedding this content in page
components, so the website, patient app, WhatsApp bot, and staff tools can use
the same approved wording.

### Sources and governance

- Determine “most booked” from completed orders over a defined recent period,
  excluding cancelled, duplicated, control, and B2B-only orders. Retain manual
  flags only as editorial overrides.
- Source preparation instructions from SDRC laboratory SOPs.
- Have an SDRC pathologist/medical director approve test explanations, package
  audience guidance, age/sex/pregnancy considerations, and disclaimers.
- AI may assist with drafting and plain-language editing, but is not the source
  of medical truth.

### Suggested rollout

Start with the 15–20 genuinely most-booked individual tests and every package
currently marked `is_most_booked`, then extend the format to the rest of the
catalogue after clinical approval.
