# Owner Content Gate — Tacos Sinaloa Y Carniceria

Production must not invent or scrape owner-controlled business facts into the visible site. The following items require owner confirmation before publication.

## Photography
Provide six current originals, ideally captured in the same lighting session:
1. Current storefront showing current signage
2. Counter/interior
3. Carniceria case
4. Taco hero
5. Birria / quesabirria hero
6. Atmosphere or action shot

The archival storefront image is retained only as a source asset and is no longer displayed in the customer-facing gallery. A current storefront image should not be published until current signage is owner-confirmed.

## Menu
Provide the current in-store menu or approve a photographed menu board. For every item to publish, confirm:
- category
- item name in English/Spanish as desired
- short description
- current price
- options / protein choices that materially affect price
- whether the item is daily, weekend-only, or subject to availability

Third-party menu aggregators may be used for cross-checking only, not as production truth.

## Conversion
Confirm whether there is an official direct-order URL. Do not promote an ordering provider unless the owner confirms it is current and controlled by this business.

## Social proof
Choose either:
- two or three owner-approved recent excerpts with source/date, or
- a reliable dynamic review integration.

Do not freeze an aggregate star rating in markup without a refresh mechanism.

## Visit information
Already verified in production:
- 17294 Valley Blvd, Ste A, Fontana, CA 92335
- (909) 823-6253
- 8:00 AM–8:00 PM daily

Still owner-confirm before publishing:
- parking instructions
- cross street
- holiday hours
- accepted payment methods

## Safe intake workflow
1. Start from `content/owner-intake/submission.template.json`.
2. Keep the working submission, approval evidence, and uploaded originals outside Git.
3. Run `tools/validate-owner-submission.py` in review mode while content is incomplete.
4. After explicit owner approval, set status to `APPROVED` and record approval date, approver, and evidence reference.
5. Run the validator with `--strict-publish` and the private photo assets directory.
6. Run `tools/stage-owner-content.py` to create a private optimized/public-safe bundle outside the repository.
7. Build and inspect a site preview from that bundle.
8. Run the standard `tools/release-check.sh` before any production cutover.

Actual approval evidence must never be copied into the public web root.
