# Proposal template

Copy this folder to create the next bar or restaurant proposal. The pages are rendered from `config.json` by the shared files in `proposals/_shared/`. Hostinger serves the HTML, CSS and JavaScript as they are. There is no build step.

## Create the next one

1. Copy the whole `_template` folder:

   ```bash
   cp -R proposals/_template proposals/the-new-place
   ```

2. Edit `proposals/the-new-place/config.json` only. Do not fork the shared CSS or JavaScript unless the layout itself has to change.

3. Put photographs and the intro film in `proposals/the-new-place/assets/`. Paths in the config are relative to that proposal folder, for example `assets/hero.jpg`. The website page prefixes `../` for you.

4. Replace every fact. The sample names, scores and links are placeholders. Use only figures you have checked on the live listings, and name the owner correctly.

5. Preview from the site root, not by opening the file directly (the page fetches `config.json`):

   ```bash
   python3 -m http.server 8765
   ```

   Then open `http://127.0.0.1:8765/proposals/the-new-place/`.

## What the config controls

| Area | Fields |
| --- | --- |
| Who it is for | `client`, `agency`, `meta` |
| Intro film | `video.src`, `video.poster`, `video.welcome` |
| Score snapshot | `snapshot` |
| Website preview | `website`, plus the whole `site` object |
| Social mock | `facebook` |
| Google audit | `google` |
| 90-day plan | `plan` |
| Close | `close` |

`site` is the guest-facing page at `site/`. It is a real page: menu, events, map, review links, English/Thai toggle, and a table or event request. The request opens the guest’s own email app, or WhatsApp when `site.contact.whatsapp` is the digits of one confirmed number. Leave WhatsApp empty rather than guessing. The form does not check availability and does not store the enquiry.

## Paid proposals

This template is the paid shape.

- `pricing.enabled: true` shows an Investment section in the sticky nav.
- Put the real fee in `pricing.items`. Say, in `pricing.excludes`, that ad spend, domain, photography and booking software are separate.
- `pricing.disclaimer` should say nothing is billed until the owner accepts a written scope.

The 79 Beach Bar audit is the complimentary exception. Its config sets `pricing.enabled` to `false` and the close asks for recommendations, not a fee. Do not copy that commercial model forward unless Dan agrees it in writing.

## Privacy

Every page under `proposals/` must keep:

```html
<meta name="robots" content="noindex,nofollow">
```

`robots.txt` disallows `/proposals/`. Do not add proposal URLs to `sitemap.xml`.

The shells in this folder already noindex themselves. The guest site does too, while it lives here. When an owner approves a public launch, move that site off `/proposals/`, switch its robots meta to `index,follow`, confirm the phone number, and only then add it to the sitemap. Until that day it is a proposal, not the restaurant’s website.

## Photography and claims

Use the venue’s own pictures, or pictures you have rights to. Do not invent review counts, follower totals, menu prices, opening hours or a booking confirmation. Say clearly when a night or a price still needs the owner’s yes. Results are not guaranteed. The plan section in every config should keep a sentence that says so.
