# Tacos Sinaloa Y Carniceria — Production v6.12

Permanent production deployment for the audited charcoal/gold Tacos Sinaloa site.

## Production URL

https://tacos.pilotsalesdistribution.com/

## Production topology

- Cloudflare authoritative DNS for pilotsalesdistribution.com
- Dedicated named tunnel: pse-tacos
- Tunnel ID: bbf56ecb-daf8-404a-8cff-8c2cecc2a8fa
- Public hostname: tacos.pilotsalesdistribution.com
- Nexus static origin: 127.0.0.1:4188
- Origin service: tacos-sinaloa.service
- Tunnel service: cloudflared-tacos.service
- Both services enabled under systemd
- No public inbound application port
- Grid tunnel remains separate and unchanged

## v6.8 gallery

- exact-address storefront image with explicit Prior signage / Letrero anterior disclosure
- prepared-food and carnicería supporting images
- bilingual captions
- audited Suite A address and public business information

## Production metadata

- canonical URL points to permanent hostname
- og:url uses permanent hostname
- Open Graph / Twitter social image uses an absolute permanent URL
- JSON-LD includes permanent url and social image URL

## Professional delivery layer — v6.9

- robots.txt and sitemap.xml
- conventional favicon.ico plus web app manifest
- origin-level security headers (CSP, HSTS, nosniff, frame protection, referrer policy, permissions policy)
- explicit cache policy for HTML, code, fonts and media
- reproducible hardened static origin in server.py
- visual system intentionally unchanged

## Managed service layer — v6.9.1

- public `/healthz` endpoint with explicit release identity and no-store caching
- Nexus systemd health check verifies origin, Cloudflare public route, robots, sitemap, favicon, and required security headers
- health check runs every 5 minutes and records the last success in `/var/lib/pse/tacos-sinaloa-health.json`
- failures are visible in the `tacos-sinaloa-healthcheck.service` journal
- owner content gate prevents unverified scraped menu prices, reviews, ordering URLs, parking, or holiday-hour claims from reaching production
- menu owner template is ready for current approved categories, descriptions, prices, and availability

## Content-driven menu — v6.10

- production menu highlights are sourced from `content/menu.json` with the existing HTML retained as a failure-safe fallback
- EN/ES menu labels render from the same content source
- menu JSON is explicitly no-cache so approved edits propagate promptly
- `tools/validate-menu.py` rejects duplicate/malformed items and blocks prices unless `_owner_approved` is explicitly true
- current production content remains the same four no-price highlights; no third-party prices were promoted

## Sourced social proof — v6.11

- compact recent-review module with three paraphrased public Google review themes
- every published review item carries reviewer, source date, source URL, and provenance URL
- no aggregate star rating is stored, avoiding stale score claims
- EN/ES review text is rendered from `content/reviews.json`
- review JSON is no-cache and covered by the production health check
- `tools/validate-reviews.py` rejects stale/future dates, missing provenance, insecure URLs, duplicate IDs, and frozen rating metadata

## Visit utility hierarchy — v6.12

- Directions is the primary Visit action when no verified direct-order URL exists
- phone number is visible directly in the Visit CTA
- daily 8 AM–8 PM hours are repeated in the Visit summary so the location block stands on its own
- all Visit controls meet a 44 px minimum target height
- mobile Visit actions stack cleanly without overflow
- CSS and JS asset URLs are release-versioned so HTML cannot pair with stale presentation code
- no iframe map or third-party map library was added

## Release safety harness — v6.13

Future menu, review, photo, copy, CSS and JS changes should pass the local release harness before production freeze. No new npm or Python packages are required.

- `tools/release-config.env` is the release-audit expectation file; bump release and asset tokens intentionally with each production release.
- `tools/release-check.sh` runs content validators, static checks, endpoint/header checks, live Chromium checks at 390/768/1440, bilingual behavior, tab behavior, JSON fallback behavior, minimum Visit tap targets, broken-image detection and visual regression.
- `tools/release-audit.cjs` creates deterministic full-page browser captures and `audit.json`.
- `tools/accept-visual-baseline.sh` accepts an intentional production visual baseline under `/home/president/Work/tacos-sinaloa-visual-baselines/`.
- `tools/visual-regression.sh` compares mobile/tablet/desktop captures with a default maximum changed-pixel ratio of 1%.
- Transient `audit-output/` artifacts are excluded from Git.

Normal certification command:

```bash
./tools/release-check.sh
```

A changed visual is not automatically accepted. Inspect it first; only then run the baseline acceptance script for the new production release.

## Owner content intake pipeline

Owner-controlled facts and media are deliberately separated from public production content. The unified intake workflow lives under `content/owner-intake/`.

- `content/owner-intake/submission.template.json` — single structured template for photos, menu, ordering, optional visit details, and approval metadata.
- `tools/validate-owner-submission.py` — review/publish gate. Prices, direct-order URLs, optional visit details, and supplied photos require explicit owner confirmation; strict publication also requires APPROVED state plus approval date, approver, and evidence reference.
- `tools/stage-owner-content.py` — creates a private publication-ready bundle outside the repository, optimizes approved photos to WebP, emits SHA-256 checksums, and strips private approval evidence from public-safe content.
- Real submissions, approval evidence, and owner originals are not committed to Git.
- `OWNER-CONTENT-CHECKLIST.md` remains the human-readable intake checklist and now points to the machine-enforced workflow.

The staging tool does not modify production or the repository. A staged bundle still requires a preview, the normal release harness, and an intentional production deployment.

## Verification

- permanent HTTPS returns 200 through Cloudflare
- robots.txt and sitemap.xml return HTTP 200
- conventional favicon and web manifest return HTTP 200
- CSP / HSTS / nosniff / frame / referrer / permissions headers verified through Cloudflare
- Cloudflare Insights remains permitted by a narrow CSP allowlist
- mobile performance remains ~2.0 s LCP with CLS 0 after hardening
- Open Graph image returns 200
- 390 / 768 / 1024 / 1440 production browser gauntlet passes
- zero browser errors / failed requests
- bilingual gallery disclosure verified
- reduced motion verified
- Grid remains protected by Cloudflare Access
- Pilot Sales apex remains HTTP 200
- temporary TryCloudflare and Forge port-18872 preview processes retired

## Preserved releases

- charcoal-v6.6.1-audited
- charcoal-v6.7-reduced
- charcoal-v6.8-gallery
- charcoal-v6.8.1-production
- charcoal-v6.9-production
- charcoal-v6.9.1-production
- charcoal-v6.10-production
- charcoal-v6.11-production
- charcoal-v6.12-production
- charcoal-v6.13-production
