import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';import {projects} from '../projects.js';
assert.equal(projects.length,25,'25 audited projects must be present');assert.equal(new Set(projects.map(p=>p.id)).size,25,'IDs must be unique');assert.equal(new Set(projects.map(p=>p.title)).size,25,'Titles must be unique');
for(const p of projects){for(const key of ['id','title','category','summary','status'])assert.ok(p[key],`${p.id} missing ${key}`);assert.ok(['Automação','Dados','Sistemas','Estudos'].includes(p.category));if(p.repositoryUrl)assert.match(p.repositoryUrl,/^https:\/\/github\.com\/adieldie\//);}
const html=await readFile('index.html','utf8');const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));for(const m of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(m[1]),'Invalid anchor '+m[1]);for(const m of html.matchAll(/(?:src|href)="((?!https?:|tel:|#)[^"]+)"/g))await stat(m[1].split('?')[0]);
for(const file of ['index.html','styles.css','app.js','sculpture.js','projects.js','platformer.js','motion-scenes.js','gallery.css']){const s=await readFile(file,'utf8');assert.ok(!/ghp_[A-Za-z0-9]+|github_pat_|sk-[A-Za-z0-9]{20}|\d{3}\.\d{3}\.\d{3}-\d{2}|\/workspace\/|agent_notes|dream_notes|127\.0\.0\.1/.test(s),`Private data in ${file}`);}
console.log('PASS: 25 unique projects, complete public fields, valid categories/links/anchors/assets, privacy pattern checks');

const {filterProjects,normalize}=await import('../project-utils.js');
assert.equal(normalize('  AUTOMAÇÃO  '),'automacao');
assert.equal(filterProjects(projects,'Todos','').length,25);
assert.ok(filterProjects(projects,'Todos','conferencia').length>0);
assert.deepEqual(filterProjects(projects,'Todos','conferência'),filterProjects(projects,'Todos','conferencia'));
assert.equal(filterProjects(projects,'Todos','xzy-impossible-995').length,0);
for(const category of ['Automação','Dados','Sistemas','Estudos']){
 const filtered=filterProjects(projects,category,'');assert.ok(filtered.length>0);assert.ok(filtered.every(p=>p.category===category));
 const combined=filterProjects(projects,category,'Python');assert.ok(combined.every(p=>p.category===category));
}
console.log('PASS: accent-insensitive search, whitespace trimming, all categories, combined filters, empty results');

assert.equal(projects.filter(p=>p.featured).length,3,'Three featured projects');
assert.ok(html.includes('alt="Foto de Adiel Alves"'),'Portrait has descriptive alt');
assert.ok(html.includes('width="88" height="88"'),'Portrait has layout dimensions');
assert.ok(html.includes('Perfil profissional no LinkedIn')&&html.includes('Conversar no WhatsApp'),'Compact contact actions');
const release=html.match(/styles\.css\?v=([^"]+)/)?.[1];assert.ok(release);
const app=await readFile('app.js','utf8');for(const match of app.matchAll(/from '[^']+\?v=([^']+)'/g))assert.equal(match[1],release,'Coordinated release version');
console.log('PASS: featured count, portrait semantics/dimensions, contact actions and coordinated asset versions');

const manifest=JSON.parse(await readFile('manifest.webmanifest','utf8'));assert.equal(manifest.start_url,'./');
const sw=await readFile('sw.js','utf8');assert.ok(sw.includes("const VERSION='adiel-portfolio-"+release+"'"));
for(const match of sw.matchAll(/'([^']+\?v=([^']+))'/g)){assert.equal(match[2],release);await stat(match[1].split('?')[0]);}
assert.ok(html.includes('https://wa.me/5575991170685')&&html.includes('tel:+5575991170685'));
console.log('PASS: offline release alignment/assets, manifest and approved contact links');
assert.ok(html.includes('id="robot-platformer"')&&!html.includes('sample-form')&&!html.includes('id="automation-game"'),'Platformer replaces earlier samples');
assert.ok(app.includes('initScrollScenes()')&&!app.includes('function updateStory'),'Single continuous scroll controller');
assert.ok(!html.includes('class="site-viewport"'),'Natural page scrolling restored');
console.log('PASS: platformer integration, continuous scroll controller and native page flow');

for(const name of ['automacao','dados','sistemas','estudos']){const path='assets/gallery/'+name+'.webp';await stat(path);assert.ok(sw.includes(path));}
assert.ok(app.includes("project-tile")&&app.includes("image.loading='lazy'"));
console.log('PASS: gallery artwork cached, lazy images and compact project tiles');
const theme=await readFile('theme.js','utf8');
assert.ok(html.indexOf("localStorage.getItem('adiel-portfolio-theme')")<html.indexOf('styles.css'),'Theme bootstrap precedes CSS');
assert.ok(theme.includes("['system', 'light', 'dark']")&&theme.includes("portfolio:themechange"),'Three validated theme modes and change notification');
assert.ok(sw.includes('theme.js?v='+release)&&sw.includes('theme.css?v='+release)&&sw.includes('reference-polish.css?v='+release),'New styling modules included offline');
console.log('PASS: theme bootstrap, validated preference modes and offline theme assets');

const demos=projects.flatMap(p=>(p.publicDemos||[]).map(d=>({...d,projectId:p.id})));
assert.equal(demos.length,10,'Ten public excerpts, not ten new products');
assert.equal(new Set(demos.map(d=>d.repositoryUrl)).size,10,'One association per public excerpt');
for(const d of demos){assert.match(d.repositoryUrl,/^https:\/\/github\.com\/adieldie\/[a-z0-9-]+$/);for(const field of ['title','description','status','limitations'])assert.ok(d[field]);assert.ok(d.technologies.length);assert.match(d.status,/experimental|Experimental/);}
assert.equal(projects.find(p=>p.id==='operacao-entregas').publicDemos.length,3,'Family variants remain one portfolio project');
assert.match(demos.find(d=>d.repositoryUrl.endsWith('/audit-response-demo')).limitations,/não foram compilados nem executados/);
assert.match(demos.find(d=>d.repositoryUrl.endsWith('/operational-shift-variant')).limitations,/Não é um produto adicional/);
console.log('PASS: ten unique demo references with explicit scope, technologies and experimental limitations');

// Published creative work is additive: the technology catalog remains intact.
const marketing = html.match(/<section class="marketing-section[\s\S]*?<\/section>/)?.[0];
assert.ok(marketing,'Marketing section is present');
assert.match(marketing,/id="marketing"/);
assert.equal((html.match(/id="marketing"/g)||[]).length,1,'One direct marketing anchor');
assert.ok(html.includes('href="#marketing">Marketing</a>'),'Marketing navigation is exposed');
assert.ok(marketing.includes('Pedir um orçamento')&&marketing.includes('5575991170685'),'Budget CTA uses the existing approved contact');
for(const code of ['DdKNCZBxa9W','DcPgQVksrak','DcY3M9_x502'])assert.ok(marketing.includes('https://www.instagram.com/reel/'+code+'/'),'Exact owner-supplied Reel URL');
assert.match(marketing,/Gravação: @mara_teleeess/,'Original recording credit is retained');
assert.ok(!marketing.includes('<iframe')&&!marketing.includes('<video'),'No new third-party player or autoplay');
for(const m of marketing.matchAll(/<img[^>]+>/g)){
 assert.match(m[0],/loading="lazy"/);assert.match(m[0],/alt="[^"]+"/);assert.match(m[0],/width="\d+" height="\d+"/);
 const src=m[0].match(/src="([^"]+)"/)[1];await stat(src);assert.ok(sw.includes(src),'Marketing preview is cached offline');
}
assert.ok(!/\b\d+\s*(%|vendas|conversões|clientes|visualizações)\b/i.test(marketing),'No unsubstantiated performance metrics');
assert.ok(!/MARKETING_CASES|MARKETING_ARTS/.test(marketing),'No placeholder sections remain');
console.log('PASS: marketing anchor/CTA, exact Reel sources, credits, lazy local previews, offline coverage and no unproven metrics');

const opening=html.match(/<section id="inicio"[\s\S]*?<\/section>/)?.[0];
assert.ok(opening?.includes('dual-intro')&&opening.includes('Qual o seu interesse?'),'Compact dual opening is present');
assert.equal((opening.match(/class="interest-card /g)||[]).length,2,'Two clear area choices');
assert.ok(opening.includes('href="#marketing"')&&opening.includes('href="#programacao"'),'Both area choices use native anchors');
assert.ok(!opening.includes('id="sculpture"'),'Decorative 3D no longer delays the entry choices');
assert.ok(html.match(/<section class="programming-overview[\s\S]*?id="sculpture"[\s\S]*?<\/section>/),'3D work is retained with programming');
const motion=await readFile('motion-scenes.js','utf8');
assert.ok(!motion.includes('scroll-scenes-pinned')&&!motion.includes('preventDefault'),'Editorial layout uses native flow without scroll interception');
const marketingCss=await readFile('marketing.css','utf8');
assert.ok(marketingCss.includes('@media(prefers-reduced-motion:reduce)')&&marketingCss.includes('.interest-card,.interest-arrow{animation:none;transition:none;}'),'Entry animation respects reduced motion');
assert.ok(!marketing.includes('↗'),'Marketing arrows are font-independent vectors');
console.log('PASS: compact dual-area entry, native anchors, relocated illustration, no pinning and reduced-motion support');

assert.ok(opening.indexOf('id="hero-title"')<opening.indexOf('id="interest-title"'),'Personal introduction precedes interest selector');
assert.ok(opening.includes('Crio conteúdo visual para marcas, sistemas e automações.')&&opening.includes('Adiel Alves.</span>'),'Personal presentation is retained');

const editorial=await readFile('editorial.css','utf8');
assert.ok(html.includes('editorial.css?v='+release)&&sw.includes('editorial.css?v='+release),'Editorial design is versioned and cached');
assert.ok(opening.includes('portrait-stage')&&opening.includes('assets/adiel-alves-linkedin.webp'),'Editorial hero uses the existing real portrait');
assert.ok(!html.includes('Aswad')&&!html.includes('Helmi')&&!html.includes('Lorem ipsum'),'Reference author content is not copied');
assert.ok(editorial.includes('prefers-reduced-motion'),'Editorial motion respects preferences');
