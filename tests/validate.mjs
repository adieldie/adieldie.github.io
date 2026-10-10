import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';import {projects} from '../projects.js';
assert.equal(projects.length,25,'25 audited projects must be present');assert.equal(new Set(projects.map(p=>p.id)).size,25,'IDs must be unique');assert.equal(new Set(projects.map(p=>p.title)).size,25,'Titles must be unique');
for(const p of projects){for(const key of ['id','title','category','summary','status'])assert.ok(p[key],`${p.id} missing ${key}`);assert.ok(['Automação','Dados','Sistemas','Estudos'].includes(p.category));if(p.repositoryUrl)assert.match(p.repositoryUrl,/^https:\/\/github\.com\/adieldie\//);}
const html=await readFile('index.html','utf8');const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));for(const m of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(m[1]),'Invalid anchor '+m[1]);for(const m of html.matchAll(/(?:src|href)="((?!https?:|#)[^"]+)"/g))await stat(m[1].split('?')[0]);
for(const file of ['index.html','styles.css','app.js','sculpture.js','projects.js']){const s=await readFile(file,'utf8');assert.ok(!/ghp_[A-Za-z0-9]+|github_pat_|sk-[A-Za-z0-9]{20}|\d{3}\.\d{3}\.\d{3}-\d{2}|\/workspace\/|agent_notes|dream_notes|127\.0\.0\.1/.test(s),`Private data in ${file}`);}
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
assert.ok(html.includes('Contratar um projeto')&&html.includes('Conversar sobre uma vaga'),'Distinct contact actions');
const release=html.match(/styles\.css\?v=([^"]+)/)?.[1];assert.ok(release);
const app=await readFile('app.js','utf8');for(const match of app.matchAll(/from '[^']+\?v=([^']+)'/g))assert.equal(match[1],release,'Coordinated release version');
console.log('PASS: featured count, portrait semantics/dimensions, contact actions and coordinated asset versions');

const {runSample}=await import('../sample-utils.js');
assert.deepEqual(runSample('caderno',12,3,true),{ok:true,valid:true,title:'Pedido de exemplo processado',message:'3 × Caderno. A regra permitiu o processamento.',remaining:9,total:54,alert:false});
assert.equal(runSample('caneta',5,2,true).alert,true);
assert.equal(runSample('caneta',5,2,false).alert,false);
assert.equal(runSample('pasta',2,3,true).ok,false);
assert.equal(runSample('pasta',3,3,true).remaining,0);
for(const [p,s,q] of [['bad',1,1],['caderno',-1,2],['caderno',1,0],['caderno',1,1.5],['caderno',Infinity,1],['caderno',1,NaN],['caderno',1000,1]])assert.equal(runSample(p,s,q,true).valid,false);
assert.ok(html.includes('id="amostras"')&&html.includes('href="#amostras"'));
assert.equal((html.match(/class="automation-step"/g)||[]).length,3);
console.log('PASS: interactive sample success, stock rejection, low-stock toggle, zero stock and invalid inputs; story anchors/stages');
