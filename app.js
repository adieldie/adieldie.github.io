import { initTheme } from './theme.js?v=20261017-r3';
import { initPlatformer } from './platformer.js?v=20261017-r3';
import { initScrollScenes } from './motion-scenes.js?v=20261017-r3';
import { startSculpture } from './sculpture.js?v=20261017-r3';
import { projects } from './projects.js?v=20261017-r3';
import { filterProjects } from './project-utils.js?v=20261017-r3';
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
 if(project.publicDemos?.length){
  const intro=el('section','dialog-section');intro.append(el('h3','','Demonstrações públicas'),el('p','','Os links abaixo contêm recortes sanitizados com dados fictícios. O escopo e as tecnologias de cada demonstração são próprios; não representam acesso ao sistema completo nem prontidão para produção.'));root.append(intro);
  for(const demo of project.publicDemos){
   const section=el('section','dialog-section public-demo');section.append(el('h3','',demo.title),el('p','dialog-status',demo.status),el('p','',demo.description));
   const demoTags=el('div','dialog-tags');demo.technologies.forEach(t=>demoTags.append(el('span','',t)));section.append(demoTags,el('p','',demo.limitations));
   const link=el('a','button secondary','Ver demonstração no GitHub');link.href=demo.repositoryUrl;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Ver demonstração: '+demo.title);section.append(link);root.append(section);
  }
 }
 if(project.repositoryUrl){const link=el('a','button primary','Ver repositório público');link.href=project.repositoryUrl;link.target='_blank';link.rel='noopener noreferrer';link.style.marginTop='24px';root.append(link);}
 dialog.showModal();document.body.style.overflow='hidden';
}
$('dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{document.body.style.overflow='';});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const categoryArt = {'Automação':'automacao','Dados':'dados','Sistemas':'sistemas','Estudos':'estudos'};
function projectImage(project,className){const image=el('img',className);image.src='./assets/gallery/'+categoryArt[project.category]+'.webp';image.alt='';image.width=600;image.height=400;image.loading='lazy';image.decoding='async';return image;}
const featured=projects.filter(p=>p.featured).slice(0,3);if(featured.length<3)projects.filter(p=>!featured.includes(p)).slice(0,3-featured.length).forEach(p=>featured.push(p));
featured.forEach((p,i)=>{
 const card=el('article','featured-card'+(i===0?' featured-lead':''));
 const image=el('div','card-art');image.append(projectImage(p,'featured-image')); 
 image.append(el('span','art-index',String(i+1).padStart(2,'0')),el('span','art-caption','REPRESENTAÇÃO ILUSTRATIVA'));
 const body=el('div','card-body');
 const category=el('div','card-category',p.category.toUpperCase());
 const status=el('span','card-status',p.status);category.append(status);
 body.append(category,el('h3','',p.title),el('p','card-summary',p.summary));
 const tags=el('div','card-tags');(p.techStack||[]).slice(0,3).forEach(tag=>tags.append(el('span','',tag)));body.append(tags);
 const context=el('div','card-context');context.append(el('span','','O CONTEXTO'),el('p','',p.narrative||p.summary));body.append(context);
 const delivery=el('div','card-context');delivery.append(el('span','','ENTREGA & ESTÁGIO'),el('p','',Array.isArray(p.outcome)?p.outcome.join(' '):p.outcome));body.append(delivery);
 const button=el('button','card-button','Explorar este case');button.type='button';button.append(el('span','css-arrow',''));button.setAttribute('aria-label','Conhecer projeto: '+p.title);button.addEventListener('click',()=>detail(p));body.append(button);
 card.append(image,body);$('featured').append(card);
});
let filter='Todos';

function render(){
 const found=filterProjects(projects,filter,$('project-search').value);$('project-index').replaceChildren();
 $('result-count').textContent=found.length+' '+(found.length===1?'projeto encontrado':'projetos encontrados');
 for(const p of found){
  const card=el('button','project-tile');card.type='button';
  const visual=el('span','tile-visual');visual.append(projectImage(p,'tile-image'),el('span','tile-category',p.category));
  const body=el('span','tile-body');body.append(el('span','tile-title',p.title),el('span','tile-status',p.status+(p.publicDemos?.length?' · Código demonstrativo':'')));
  card.append(visual,body);card.setAttribute('aria-label','Abrir detalhes: '+p.title);card.addEventListener('click',()=>detail(p));$('project-index').append(card);
 }
 if(!found.length)$('project-index').append(el('p','empty-results','Nenhum projeto com esses termos. Tente outra busca ou selecione “Todos”.'));
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});render();}));$('project-search').addEventListener('input',render);$('total-count').textContent=String(projects.length);$('year').textContent=String(new Date().getFullYear());render();
initTheme();
startSculpture($('sculpture'),$('motion-toggle'));

initPlatformer($('robot-platformer'));
initScrollScenes();

import './offline.js?v=20261017-r3';

$('copy-phone').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText('+5575991170685');$('copy-phone-status').textContent='Número copiado: +55 (75) 99117-0685';}
 catch{$('copy-phone-status').textContent='Selecione e copie o número acima: +55 (75) 99117-0685';}
});
