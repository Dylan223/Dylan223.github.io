<div align="center">

# Dylan Drolet

### Data · Machine Learning · Game Engineering

**Orlando, FL · BS Information Technology, UCF (Fall 2026)**

[**Live Site →**](https://dylan223.github.io) · [Email](mailto:dyland82@hotmail.com) · [GitHub](https://github.com/Dylan223)

</div>

---

## About this repo

Source for my portfolio at [**dylan223.github.io**](https://dylan223.github.io). Hand-coded in vanilla HTML, CSS, and JavaScript. No frameworks, no build step, no `node_modules`.

## Featured: Player Analytics Platform

The headline project on the site. An end-to-end **machine-learning analytics platform** I built in Python for my Garry's Mod community, deployed live and recomputed from production gameplay data.

- **Data engineering** — pulls from three MySQL schemas across two physical servers, resolves players across mismatched Steam ID formats (legacy `STEAM_0` vs. 64-bit) into a single identity, and engineers a clean feature set for 43,980 players.
- **Unsupervised ML** — a K-means model groups players into five behavioural archetypes, silhouette-validated and PCA-projected to 2D.
- **Predictive ML** — a linear regression predicts in-game wealth from engagement features (R² 0.448), with standardized coefficients and multicollinearity flagged, so results are reported as correlation, not cause.
- **LLM integration** — Anthropic's Claude API turns the verified numbers into plain-English insight. It's a precompute-and-narrate design: Python computes every figure first and the model only narrates them, so it can't invent statistics. Same layer powers season recaps and a rate-limited assistant.

**Live dashboard:** [gentoi.online/analytics](https://gentoi.online/analytics)

## What's on the site

| Section | What it covers |
|---|---|
| **Featured · Player Analytics Platform** | Python ML + LLM analytics platform over a 44,000-player game community. K-means segmentation, wealth regression, and a precompute-and-narrate Claude integration. Live dashboard. |
| **Featured · SQL Backend** | Production MySQL database for a content creator's game. 80+ tables, scaled to 50,000+ players, millions of rows. |
| **Featured · gentoi.online** | Custom-built web gateway for my Garry's Mod community. Steam OpenID auth, package store (2,000+ purchases), ban registry, user database. |
| **Workshop Mods** | Garry's Mod NPCs and Nextbots with 300,000+ total subscriptions. Custom AI, possession, animation work in Lua/GLua. |
| **Experience** | Timeline going back to 2017. |
| **Ticket Contact** | Functional contact form styled like a support ticket system. Submissions go to my inbox via FormSubmit.co. |

## Tech

```
HTML5 · CSS3 · Vanilla JavaScript
Canvas API           particle field with drifting stars + meteor streaks
CSS 3D transforms    rotating orb indicators
CSS custom props     per-section accent theming (lime / red / warm)
Lightbox             click-to-expand dashboard screenshots (vanilla JS, Esc / backdrop close)
IntersectionObserver scroll reveals, lazy YouTube embed
FormSubmit.co        serverless contact form
GitHub Pages         hosting
```

> The analytics platform itself runs separately on its own stack — Python, pandas, scikit-learn, and the Anthropic API — feeding the live dashboard at [gentoi.online/analytics](https://gentoi.online/analytics). This repo is the portfolio site that showcases it.

## Run it locally

No build step. Either open `index.html` directly in a browser, or serve it:

```bash
# Python
python3 -m http.server 8000

# or Node
npx http-server -p 8000
```

Then visit `http://localhost:8000`.

## File structure

```
├── index.html                  Main page
├── styles.css                  All styling
├── script.js                   Particles, animations, ticket form
├── dylan.jpg                   Hero portrait
├── view1.jpg                   Analytics · K-means player segments
├── view2.jpg                   Analytics · economy & activity overview
├── view3.jpg                   Analytics · wealth regression
├── sqltables.jpg               MySQL Workbench screenshot
├── server-poster.jpg           gentoi.online preview fallback
├── loadingscreen.mp4           Cinematic banner video
├── loadingscreen-poster.jpg    Video poster frame
└── Dylan_Drolet_Resume.pdf     Resume
```

## Production work, by the numbers

| | |
|---|---|
| Players tracked across systems | 80,000+ |
| Players analyzed by the ML pipeline | 43,980 |
| ML models in production | 2 (clustering + regression) |
| Workshop subscriptions | 300,000+ |
| Store purchases processed | 2,000+ |
| Uptime across game servers | 99% |
| SQL tables in production | 80+ |
| Years shipping live code | 8 |

## Contact

| | |
|---|---|
| Email | dyland82@hotmail.com |
| Phone | +1 (570) 236-0216 |
| GitHub | [@Dylan223](https://github.com/Dylan223) |
| Steam Workshop | [Profile](https://steamcommunity.com/profiles/76561198057801491/myworkshopfiles/?appid=4000) |

Or open a ticket directly on the [live site](https://dylan223.github.io/#contact).

---

<div align="center">
<sub>© 2026 Dylan Drolet · Coded by me</sub>
</div>
