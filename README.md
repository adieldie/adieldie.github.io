# Adiel Alves · Portfolio

Responsive, Portuguese-language portfolio built for GitHub Pages. Plain HTML, CSS and JavaScript, with no runtime package dependencies or external CDN. Includes 25 projects, accessible project details, filters and search, reduced-motion handling and a lightweight procedural WebGL sculpture with SVG fallback.

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
- The three featured projects use `featured: true`.
- Never publish private repositories, secrets, phone numbers, identity documents, real customer records, or client names.
- Contact URLs are in `index.html`. Repository links are individually included only when suitable for public attribution.
- The site contains no tracking, forms, cookies, external fonts, or analytics.

## Motion and 3D

The geometric sculpture has 7,200 triangles, one draw call and no textures. Device pixel ratio is capped at 1.5 and animation is limited to approximately 30 frames per second. Rendering stops when offscreen, paused or in a hidden tab. Reduced-motion preference starts the sculpture paused and disables scroll/reveal transitions. A user may explicitly activate motion. WebGL unavailability or context loss shows a static inline SVG. The decorative canvas is hidden from assistive technology; all information is ordinary HTML.

## Recovery

The site has no server-side state or database. Roll back by reverting the GitHub commit and waiting for Pages to redeploy. Existing repositories or Pages deployments should be inspected before any initial push or settings change.

## Verification scope

`npm test` executes syntax checks, data integrity for all 25 projects, public-link format checks, local asset and anchor resolution, privacy-pattern screening, and pure-function search/filter tests (including accents, whitespace, combined category/search and no-result input). These are static/unit checks; they do not prove browser rendering, dialog focus, touch behavior or GPU performance.

Browser verification findings are recorded separately after a rendered preview is available. A narrow viewport is an emulation, not a physical iPhone test.

After any public CSS/JavaScript change, update the shared `?v=` release value on the stylesheet/script references in `index.html` and the module imports in `app.js`. This avoids mismatched cached assets across a GitHub Pages rollout. SVG controls include intrinsic dimensions as a defensive fallback.

## Interactive automation sample and scroll story

The `#automacao` section uses CSS sticky positioning and passive scroll events. Three semantic text stages stay in normal document flow while a decorative diagram tracks progress. There is no wheel interception, scroll locking, external motion library or continuous animation loop. Reduced-motion users get an unpinned, static diagram and shorter text sections; short viewports also disable pinning.

The `#amostras` form is a local-only demonstration. `sample-utils.js` validates integer stock/quantity bounds, rejects insufficient stock, calculates example totals, and optionally flags low stock. It never calls a production API, persists data or creates real orders. Repeated runs recompute from the visible input, and Recomeçar resets the form and output. All catalog values are fictional examples.

Verification includes unit cases for success, rejection, exhausted stock, optional alerts and invalid input. Rendered and device checks must be reported separately; unit passes alone do not establish visual correctness.
