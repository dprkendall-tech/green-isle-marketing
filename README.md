# Green Isle Marketing

Static agency website and portfolio for Green Isle Marketing, Douglas, Isle of Man.

## Contents

- `index.html`: agency homepage
- `work/79-beach-bar/`: portfolio case study
- `proposals/79-beach-bar/`: one complimentary growth audit for Don at 79 Beach Bar (intro film, score, website, Facebook mock, Google audit, 90-day plan). The guest page is `proposals/79-beach-bar/site/`.
- `proposals/_template/`: copy this folder for the next bar or restaurant. Edit `config.json`. Paid proposals turn on `pricing.enabled`. See `proposals/_template/README.md`.
- `proposals/_shared/`: the renderer. Do not fork it per client unless the layout itself must change.
- `demos/solar/`: interactive Sunward solar demonstration
- `privacy.html`: enquiry privacy information

## Hosting

No build step, Node.js server, database or API keys are required. Deploy the repository contents with `index.html` at the web root.

For Hostinger, connect this repository through Advanced > Git and select `main`. First use a separate empty test directory and keep it out of search. Back up the current website and database before preparing the production root; existing WordPress routing must be checked before replacing the homepage. No hosting or DNS configuration is changed by this repository itself.

The homepage is prepared for `https://greenislemarketing.com/` with a canonical URL, metadata, business structured data and sitemap. Proposal, demo and case-study pages are noindexed, and proposal URLs are left out of `sitemap.xml`. `robots.txt` disallows `/proposals/`. A staging deployment should additionally receive a hosting-level noindex header or access restriction.

This repository does not contain Hostinger credentials or a deploy workflow. The notes below describe how a Git deployment is meant to be connected. They are not proof that the live site is already deploying from `main`.

## Enquiries and demos

The agency form prepares an email for the visitor to send to `dan@greenislemarketing.com`; it is not a server-side submission service. Mailbox delivery has not been tested.

The 79 proposal uses email/Facebook table requests, not live inventory or automatic confirmation. It is a complimentary proposal pending owner approval. No performance results are claimed.

The solar calculator uses illustrative inputs in the browser. It does not connect to Google Solar or submit customer enquiries.

## Maintenance

Create a branch for changes, check links and responsive layouts, then merge reviewed changes to `main`. If Hostinger auto-deployment is enabled, a merge updates the connected deployment. Version history can be used to revert a change.

## Asset notes

Restaurant photos are sourced from public venue listings for proposal use; final publication rights require clearance. Sources are recorded in the restaurant owner notes. The solar home image is an AI-generated concept and is labelled on the demo. The locally hosted solar fonts are from URW Base35; the included `demos/solar/assets/FONT-LICENCE.txt` records their licence.

No credentials or customer records are included.
