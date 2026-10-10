import { runSample } from './sample-utils.js?v=20261010-7';
import { startSculpture } from './sculpture.js?v=20261010-7';
import { projects } from './projects.js?v=20261010-7';
import { filterProjects } from './project-utils.js?v=20261010-7';
const $ = id => document.getElementById(id);
const el = (tag, className, text) => { const node=document.createElement(tag); if(className)node.className=className; if(text!==undefined)node.textContent=text; return node; };
const dialog=$('project-dialog');
function detail(project) {
 const root=$('dialog-content');root.replaceChildren();
 root.append(el('p','eyebrow',project.category+' / PROJETO'));
 const title=el('h2','dialog-title',project.title);title.id='dialog-title';root.append(title);
 for(const [heading,content] of [['O contexto',project.narrative||project.summary],['A construção',project.implementation],['O que este projeto reúne',project.outcome]]){if(!content)continue;const section=el('section','dialog-section');section.append(el('h3','',heading),el('p','',Array.isArray(content)?content.join(' '):content));root.append(section);}
 root.append(el('p','dialog-status',project.status));
 const tags=el('div','dialog-tags');(project.techStack||project.tags||[]).forEach(t=>tags.append(el('span','',t)));root.append(tags);
 if(project.repositoryUrl){const link=el('a','button primary','Ver repositório público');link.href=project.repositoryUrl;link.target='_blank';link.rel='noopener noreferrer';link.style.marginTop='24px';root.append(link);}
 dialog.showModal();document.body.style.overflow='hidden';
}
$('dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow='';});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const art = [
 `<svg viewBox="0 0 340 230" aria-hidden="true"><g transform="translate(35 40) skewY(-10)" fill="#223a30" stroke="#6eaf8d"><rect x="0" y="40" width="115" height="125" rx="9"/><rect x="82" y="15" width="115" height="125" rx="9"/><rect x="162" y="0" width="115" height="125" rx="9"/></g><g stroke="#b2e8c8" fill="none" stroke-width="3"><path d="m85 137 13 13 25-30M167 93h39m-39 13h25M250 67h32m-32 14h22"/></g><circle cx="278" cy="142" r="21" fill="#a2e7c5"/><path d="m269 141 7 7 12-14" fill="none" stroke="#243c2d" stroke-width="3"/></svg>`,
 `<svg viewBox="0 0 340 230" aria-hidden="true"><g stroke="#81b598" stroke-width="1.2"><path d="M88 91 174 52 263 90v74l-89 39-86-39Z" fill="#213c2c"/><path d="m88 91 86 40 89-41m-89 41v72" fill="none"/><path d="M126 86V32l80 36v54Z" fill="#a2d6b2"/><path d="m139 54 53 24m-53-12 53 24" fill="none" stroke="#3a7051"/><path d="m114 141 60 27 56-25v38l-56 26-60-27Z" fill="#79ac8a"/></g><circle cx="238" cy="116" r="5" fill="#b8e7c8"/><g fill="none" stroke="#6e9f80" stroke-dasharray="4 5"><path d="M70 161H35v-68h29m220 31h25v57h-42"/></g><circle cx="35" cy="92" r="5" fill="#b2e8c8"/></svg>`,
 `<svg viewBox="0 0 340 230" aria-hidden="true"><g fill="#20372c" stroke="#63876f"><rect x="57" y="45" width="230" height="139" rx="12"/><path d="M57 76h230"/><circle cx="73" cy="61" r="3" fill="#a2e7c5"/><circle cx="86" cy="61" r="3"/><path d="M80 108h64m-64 15h45m-45 15h54m-54 15h31"/></g><g fill="none" stroke="#a2e7c5" stroke-width="3"><path d="m183 104-15 15 15 15m39-30 15 15-15 15m-22 8 10-45"/></g><g fill="#9ddab5"><rect x="170" y="158" width="70" height="3" rx="1"/></g></svg>`
];
const featured=projects.filter(p=>p.featured).slice(0,3);if(featured.length<3)projects.filter(p=>!featured.includes(p)).slice(0,3-featured.length).forEach(p=>featured.push(p));
featured.forEach((p,i)=>{
 const card=el('article','featured-card'+(i===0?' featured-lead':''));
 const image=el('div','card-art');image.innerHTML=art[i];
 image.append(el('span','art-index',String(i+1).padStart(2,'0')),el('span','art-caption','REPRESENTAÇÃO ILUSTRATIVA'));
 const body=el('div','card-body');
 const category=el('div','card-category',p.category.toUpperCase());
 const status=el('span','card-status',p.status);category.append(status);
 body.append(category,el('h3','',p.title),el('p','card-summary',p.summary));
 const tags=el('div','card-tags');(p.techStack||[]).slice(0,3).forEach(tag=>tags.append(el('span','',tag)));body.append(tags);
 if(i===0){const context=el('div','card-context');context.append(el('span','','O CONTEXTO'),el('p','',p.narrative));body.append(context);}
 const button=el('button','card-button','Conhecer projeto');button.type='button';button.append(el('span','css-arrow',''));button.setAttribute('aria-label','Conhecer projeto: '+p.title);button.addEventListener('click',()=>detail(p));body.append(button);
 card.append(image,body);$('featured').append(card);
});
let filter='Todos';

function render(){const found=filterProjects(projects,filter,$('project-search').value);$('project-index').replaceChildren();$('result-count').textContent=found.length+' '+(found.length===1?'projeto encontrado':'projetos encontrados');for(const p of found){const row=el('button','project-row');row.type='button';row.append(el('span','row-number',String(projects.indexOf(p)+1).padStart(2,'0')),el('span','row-title',p.title),el('span','row-meta',p.category+' · '+p.status),el('span','row-arrow css-arrow',''));row.setAttribute('aria-label','Abrir detalhes: '+p.title);row.addEventListener('click',()=>detail(p));$('project-index').append(row);}if(!found.length)$('project-index').append(el('p','empty-results','Nenhum projeto com esses termos. Tente outra busca ou selecione “Todos”.'));}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});render();}));$('project-search').addEventListener('input',render);$('total-count').textContent=String(projects.length);$('year').textContent=String(new Date().getFullYear());render();
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.section-heading,.featured-card,.about-grid,.approach,.contact').forEach(node=>{node.classList.add('reveal');observer.observe(node);});}
startSculpture($('sculpture'),$('motion-toggle'));

// Scroll-linked story: native document scrolling, one scheduled update per frame.
const story = document.querySelector('.automation-story');
const steps = [...document.querySelectorAll('.automation-step')];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let storyFrame = 0;
function updateStory() {
 storyFrame = 0;
 const reduced = motionPreference.matches;
 const anchor = innerHeight * .56;
 let active = 0;
 steps.forEach((step, index) => {
  if (step.getBoundingClientRect().top <= anchor) active = index;
 });
 story.dataset.active = String(active);
 story.querySelector('.flow-step').textContent = '0' + (active + 1) + ' / 03';
 steps.forEach((step, index) => step.classList.toggle('is-current', index === active));
 const bounds = story.getBoundingClientRect();
 const progress = Math.max(0, Math.min(1, (innerHeight * .45 - bounds.top) / Math.max(1, bounds.height - innerHeight * .45)));
 story.style.setProperty('--flow-progress', reduced ? '1' : String(progress));
}
function queueStory() { if (!storyFrame) storyFrame = requestAnimationFrame(updateStory); }
addEventListener('scroll', queueStory, { passive: true });
addEventListener('resize', queueStory, { passive: true });
motionPreference.addEventListener('change', queueStory);
updateStory();

const sampleForm = $('sample-form');
function resetSample() {
 $('sample-output').replaceChildren(el('h3','','Pronto para experimentar?'),el('p','','Configure os valores ao lado e execute a automação.'));
 document.querySelectorAll('[data-pipeline]').forEach(node=>node.classList.remove('done','failed'));
}
sampleForm.addEventListener('reset',resetSample);
sampleForm.addEventListener('submit',event=>{
 event.preventDefault();
 const result=runSample($('sample-product').value,Number($('sample-stock').value),Number($('sample-quantity').value),$('sample-alert').checked);
 const output=$('sample-output'); output.replaceChildren();
 document.querySelectorAll('[data-pipeline]').forEach((node,index)=>{
  node.classList.toggle('done',result.ok || index===0 && result.valid);
  node.classList.toggle('failed',!result.ok && index===(result.valid?1:0));
 });
 output.append(el('h3','',result.title),el('p','',result.message));
 if(result.ok){const values=el('dl','sample-metrics');for(const [name,value] of [['Total do pedido',result.total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})],['Estoque final',String(result.remaining)+' unidades']]){const pair=el('div');pair.append(el('dt','',name),el('dd','',value));values.append(pair);}output.append(values);if(result.alert)output.append(el('p','sample-warning','Atenção: estoque abaixo de 5 unidades. Reposição sinalizada.'));}
 output.append(el('p','sample-log',result.ok?'Registro gerado: entrada validada → estoque conferido → resultado calculado.':'Operação interrompida. Nenhuma baixa de estoque foi realizada.'));
});
