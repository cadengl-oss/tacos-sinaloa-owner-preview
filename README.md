# Tacos Sinaloa Y Carniceria — Production v6.8.1

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

## Verification

- permanent HTTPS returns 200 through Cloudflare
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
