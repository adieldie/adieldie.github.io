# Adiel Alves · Portfolio

Responsive, Portuguese-language portfolio built for GitHub Pages. Plain HTML, CSS and JavaScript, with no runtime package dependencies. The Meta Pixel loads its official external script. Includes 25 projects, accessible project details, filters and search, reduced-motion handling and a lightweight procedural WebGL sculpture with a projected-mesh SVG fallback.

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
- The site uses Meta/Facebook Pixel ID `2015448059159712` for a single `PageView` per document load. It loads `https://connect.facebook.net/en_US/fbevents.js` and can use cookies and send page/device information to Meta. With JavaScript disabled, a hidden image reports the same event. No extra events, advanced matching, personal identifiers or server-side integration are configured.
- No consent mechanism was present when the Pixel was added; it loads on page visits. Any future consent control must gate both the script and the noscript fallback. The site has no forms or external fonts.

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

The Amostras area contains BYTE / EM MISSÃO, an original JavaScript platformer. It includes three sectors, obstacles, drones, checkpoints, lives, score, pause and restart. Missions are grounded in the catalog: lot validation/confirmation, dependent print diagnostics with an ordered queue, and partial synchronization with recovery of only pending changes. Post-level summaries explain the analogy and preserve the real project status. It starts only after the visitor chooses to play. Keyboard and touch controls are provided. There is no production API or stored player data. The site-wide Meta Pixel reports page visits; the game sends no gameplay events. All visuals are original procedural artwork.

## Offline support

The user explicitly saves the app using the offline button. A service worker precaches this release's local assets and reports readiness only after installation/activation and cache verification. Navigation tries the network first and falls back to the cached homepage; versioned local assets are served from the matching cache. Old portfolio cache versions are removed on activation. The online app checks for service-worker updates on later visits. GitHub/LinkedIn links and other external resources, including the Meta Pixel script and tracking requests, are never cached and need internet.

Installation is offered only when the browser supplies its install prompt. Safari users receive the standard Add to Home Screen instruction. Storage can be cleared or evicted by the browser; this is not a permanent download guarantee. Real offline/device testing must be reported separately from unit or online checks.

Public contact buttons use only the phone number explicitly approved by the owner. Clicking a link is left to the visitor; the site does not initiate calls or send messages automatically.

## Color preference and fixed navigation

The fixed header provides Sistema / Claro / Escuro. The default follows the system; only this local preference is stored. A pre-CSS bootstrap avoids a wrong-color first paint, and later system changes apply in automatic mode. Header height is measured for native anchor offsets. Illustrations and the playable canvas retain deliberate dark framing in light mode.

## Public demonstration links

Project detail panels separately describe sanitized public excerpts: their own technologies, experimental stage and exclusions. A public excerpt does not expose or certify the full original application. Related operational variants stay under one project; the project count remains 25. External GitHub links require a connection even when the portfolio itself is saved offline. New links must be verified public before deployment.

## Marketing e Criação

The existing portfolio includes a dedicated `#marketing` section, linked from the main navigation and home introduction. Its styles are isolated in `marketing.css`; the technology catalog, playable lab and theme system remain unchanged.

The section showcases selected published work, with local preview images, descriptive alt text and links to the original Instagram publications. Reels open on Instagram rather than starting a third-party player or autoplaying on this site. Offline storage includes the preview images; watching the original videos requires a connection. All budget links use the same approved personal WhatsApp contact already present in the portfolio and only open a visitor-controlled conversation.

Keep brand identity distinct from the account that published a piece. Do not infer a creator's role solely from a person's appearance or an account mention. The Copão Drink Reel explicitly credits @adieldie for presentation/acting and editing and @mara_teleeess for recording; preserve those credits. Other Reel descriptions stay within the public caption and format, without implying unverified production roles. Do not add sales, reach, conversions or other outcome claims without supporting evidence.

Confirmed Reel sources:
- https://www.instagram.com/reel/DdKNCZBxa9W/
- https://www.instagram.com/reel/DcPgQVksrak/
- https://www.instagram.com/reel/DcY3M9_x502/

Confirmed visual-work sources (Telebier Efapi branding, published by @telebierconcordia):
- https://www.instagram.com/telebierconcordia/p/DdujSQBkQut/
- https://www.instagram.com/telebierconcordia/p/DdC8GV1DYOU/

These visual pieces are described as creative direction and AI-assisted creation, rather than hand illustration. Publication is the demonstrated deliverable; no commercial outcome is asserted. The `#programacao` overview and `#marketing` links separate the two areas while the hero and biography introduce both.

## Editorial redesign

`editorial.css` defines the current black, warm-paper and orange direction. The personal introduction comes before the two area links. The portrait, creative work and project catalog are the existing public assets. The visual references guide hierarchy and composition only; no third-party biography, results, images or case studies are included.

New visitors start in dark mode; an explicit local light/system preference is respected. The layout uses ordinary document scrolling with no pinned hero or opacity-based text reveal. Technology artwork and the game keep their original modules and controls.

A review copy under `preview-redesign/` must be generated separately: add noindex, isolate the theme-storage key, omit the Meta Pixel, manifest and offline/service-worker initialization, and keep every asset relative to the preview directory. Do not replace the root page when publishing a review copy.

## Technology symbols

The skill ribbon uses the unaltered Python logo device supplied by the Python Software Foundation: https://www.python.org/community/logos/ (https://www.python.org/psf/trademarks/). It identifies the Python language used in the listed projects and does not imply sponsorship. Python and the Python logos are trademarks or registered trademarks of the Python Software Foundation. A small trademark symbol accompanies the device.

JavaScript uses Simple Icons' SVG (CC0 1.0), shown in JavaScript yellow: https://github.com/simple-icons/simple-icons/blob/develop/icons/javascript.svg . License: https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md . Trademark rights are separate from copyright licensing.

SQL, support, automation and integration symbols are original generic SVG icons, not language or vendor logos. All icons are stored locally, have accessible names, and retain an adjacent visible label. The visual skill cards use the same approved Telebier artwork and Reel preview assets shown in the marketing chapter.
