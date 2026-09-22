# Tacos Sinaloa y Carnicería — Final Presentation v6.6

Presentation-ready charcoal + antique-gold website candidate.

## Final art direction
- charcoal field with antique-gold identity system
- custom Taco Mark with line-draw entrance
- Newsreader display typography + Instrument Sans utility typography
- single filled Directions CTA; Call and Yelp remain outlined
- restrained hero side-notes and diamond divider
- tighter section rhythm and calmer menu scale
- refined selector image crops and responsive image viewport

## Utility
- semantic Taquería / Carnicería selector
- one active editorial image at a time
- live OPEN/CLOSED status in America/Los_Angeles
- Dine-in / Takeout service note
- direct Call / Directions / Yelp actions
- Yelp reviews and customer-photo trust block
- English / Spanish UI

## Accessibility and motion
- keyboard tabs: Left / Right / Home / End
- proper aria-selected / tabpanel relationships
- live status role + aria-live
- language-aware tablist labeling
- reduced-motion disables logo/panel motion and leaves all content visible
- no scroll hijacking or infinite decorative animation

## Presentation / performance hardening
- local font preloads
- stable image dimensions + explicit responsive crop viewport
- async image decoding and lazy loading for selector photography
- 1200x630 social card with OG dimension and alt metadata
- status refreshes on focus and app visibility restore
- no missing local asset references

## Final verification
- hosted HTTP 200
- 390 / 768 / 1024 / 1440: no horizontal overflow
- zero browser page errors
- zero failed requests / 4xx / 5xx local asset requests
- both selector images verified after lazy load
- EN/ES and live status verified
- mobile sticky CTA hidden on hero, shown after hero
- reduced-motion verified

## Preserved branches
- green-v6.3
- charcoal-v6.4
- charcoal-v6.5.2
- charcoal-v6.6-final
