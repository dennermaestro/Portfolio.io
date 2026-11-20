# Denner Santana — QA portfolio

Live at https://dennermaestro.github.io/Portfolio.io/

- `index.html` — the whole site in one file (CSS, JS and images inlined), bilingual EN/PT.
- `api-portfolio/` — the previous portfolio site with the CypressTestingAPI case study, kept at `/api-portfolio/`.
- `source/` — what `index.html` is built from:
  - `content.json` — all copy in EN and PT.
  - `build.py` — page structure. Rebuild with `python3 source/build.py source .` from the repository root.
  - `ill.py` — illustrations (hero keyword tokens, one per section, bug, robot cursor).
  - `styles.css`, `main.js`, `fx.js`, `motion.js` — styles and behaviour.
  - `logos/` — company logos, inlined into each company tab on build.

The site needs no build step to be served: GitHub Pages publishes `index.html` from the `main` branch as is.
