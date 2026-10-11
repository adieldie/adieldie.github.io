# Adiel Alves · Portfolio

Responsive, Portuguese-language portfolio built for GitHub Pages. Plain HTML, CSS and JavaScript, with no runtime package dependencies or external CDN. Includes 25 projects, accessible project details, filters and search, reduced-motion handling and a lightweight procedural WebGL sculpture with a projected-mesh SVG fallback.

## Preview and check

Node.js 22+ is sufficient for verification and building. No npm installation is required.

```
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. ES modules require an HTTP server rather than opening index.html directly from the filesystem.

## GitHub Pages

All asset paths are relative. The site works at the account root or a project subpath, without a build-time base URL.

1. Publish only the reviewed contents of this repository to the agreed GitHub repository. Do not copy source research or private project code.
2. Open repository Settings → Pages.
3. Set deployment source to **Deploy from a branch**.
4. Choose the branch containing these files and **/ (root)**, then save.
5. Wait for the Pages deployment, then verify the published page, project filters, details and mobile layout.

No Actions workflow or extra permissions are necessary for branch deployment. The root contains the deployment files. The optional `dist/` output contains the same public website without development tests or documentation. `.nojekyll` avoids Jekyll processing.

## Maintenance

- Edit the public project array in `projects.js`.
- Keep titles and IDs unique, category within Automação/Dados/Sistemas/Estudos, and honest status/outcome statements.
- The three featured projects use `featured: true`. The compact index uses four original editorial illustrations by category; they are not screenshots of production systems.
- Never publish private repositories, secrets, unapproved contact information, identity documents, real customer records, or client names.
- Contact URLs are in `index.html`. Repository links are individually included only when suitable for public attribution.
- The site contains no tracking, forms, cookies, external fonts, or analytics.

## Motion and 3D

The automation sculpture has 682 triangles, one draw call and no textures. Input records connect through a processing core to an output chart on a beveled base; it is an original conceptual illustration, not a real device. Device pixel ratio is capped at 1.5 and animation is limited to approximately 30 frames per second. Rendering stops when offscreen, paused or in a hidden tab. Reduced-motion preference starts the sculpture paused and disables scroll/reveal transitions. A user may explicitly activate motion. WebGL unavailability or context loss switches to a real geometry-based Canvas2D renderer, capped at 16 fps, DPR 1 and an 800 px buffer. It keeps pause/reduced-motion/offscreen handling. If both drawing APIs fail, a static depth-sorted SVG projection remains available. The neon material uses key/fill lighting, rim emission and depth shading; its glow is scoped to the artwork. The decorative canvas is hidden from assistive technology; all information is ordinary HTML.

## Recovery

The site has no server-side state or database. Roll back by reverting the GitHub commit and waiting for Pages to redeploy. Existing repositories or Pages deployments should be inspected before any initial push or settings change.

## Verification scope

`npm test` executes syntax checks, data integrity for all 25 projects, public-link format checks, local asset and anchor resolution, privacy-pattern screening, and pure-function search/filter tests (including accents, whitespace, combined category/search and no-result input). These are static/unit checks; they do not prove browser rendering, dialog focus, touch behavior or GPU performance.

Browser verification findings are recorded separately after a rendered preview is available. A narrow viewport is an emulation, not a physical iPhone test.

After any public CSS/JavaScript change, update the shared `?v=` release value on the stylesheet/script references in `index.html` and the module imports in `app.js`. This avoids mismatched cached assets across a GitHub Pages rollout. SVG controls include intrinsic dimensions as a defensive fallback.

## Scroll-driven scenes and playable lab

The page uses natural document scrolling, with pinned scene elements and reversible scroll-driven typography and cards. There is no wheel/touch interception or artificial scroll speed. Anchors and keyboard scrolling remain native. The three-stage automation story retains its sticky diagram on suitable desktop viewports; mobile, short screens and reduced motion use a simpler flow.

The Amostras area contains BYTE / EM MISSÃO, an original JavaScript platformer. It includes three sectors, obstacles, drones, checkpoints, lives, score, pause and restart. Missions are grounded in the catalog: lot validation/confirmation, dependent print diagnostics with an ordered queue, and partial synchronization with recovery of only pending changes. Post-level summaries explain the analogy and preserve the real project status. It starts only after the visitor chooses to play. Keyboard and touch controls are provided. There is no production API, analytics or stored player data. All visuals are original procedural artwork.

## Offline support

The user explicitly saves the app using the offline button. A service worker precaches this release's local assets and reports readiness only after installation/activation and cache verification. Navigation tries the network first and falls back to the cached homepage; versioned local assets are served from the matching cache. Old portfolio cache versions are removed on activation. The online app checks for service-worker updates on later visits. GitHub/LinkedIn links and other external resources are never cached and need internet.

Installation is offered only when the browser supplies its install prompt. Safari users receive the standard Add to Home Screen instruction. Storage can be cleared or evicted by the browser; this is not a permanent download guarantee. Real offline/device testing must be reported separately from unit or online checks.

Public contact buttons use only the phone number explicitly approved by the owner. Clicking a link is left to the visitor; the site does not initiate calls or send messages automatically.

## Color preference and fixed navigation

The fixed header provides Sistema / Claro / Escuro. The default follows the system; only this local preference is stored. A pre-CSS bootstrap avoids a wrong-color first paint, and later system changes apply in automatic mode. Header height is measured for native anchor offsets. Illustrations and the playable canvas retain deliberate dark framing in light mode.

## Public demonstration links

Project detail panels separately describe sanitized public excerpts: their own technologies, experimental stage and exclusions. A public excerpt does not expose or certify the full original application. Related operational variants stay under one project; the project count remains 25. External GitHub links require a connection even when the portfolio itself is saved offline. New links must be verified public before deployment.
