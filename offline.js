const save = document.getElementById('offline-save');
const status = document.getElementById('offline-status');
const installButton = document.getElementById('offline-install');
let installPrompt;
addEventListener('beforeinstallprompt', event => {event.preventDefault();installPrompt=event;installButton.hidden=false;});
installButton.addEventListener('click',async()=>{if(!installPrompt)return;await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installButton.hidden=true;});
addEventListener('appinstalled',()=>{installButton.hidden=true;status.textContent='Aplicativo instalado. Os links externos continuam precisando de internet.';});
if(!('serviceWorker' in navigator)) {save.disabled=true;status.textContent='Este navegador não oferece a cópia offline. Você pode continuar explorando o site normalmente.';}
else {
 navigator.serviceWorker.getRegistration().then(reg=>{if(reg)reg.update().catch(()=>{});});
 save.addEventListener('click',async()=>{
  save.disabled=true;status.textContent='Salvando os arquivos desta versão…';
  try {
   const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
   await reg.update().catch(error=>{if(!reg.active)throw error;});
   const worker=reg.installing||reg.waiting||reg.active;
   if(!worker)throw new Error('missing');
   await new Promise((resolve,reject)=>{
    if(worker.state==='activated'){resolve();return;}
    const timeout=setTimeout(()=>reject(new Error('activation timeout')),20000);
    const change=()=>{if(worker.state==='activated'||worker.state==='redundant'){clearTimeout(timeout);worker.removeEventListener('statechange',change);worker.state==='activated'?resolve():reject(new Error('redundant'));}};
    worker.addEventListener('statechange',change);change();
   });
   const channel=new MessageChannel();
   const cached=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('timeout')),15000);
    channel.port1.onmessage=event=>{clearTimeout(timeout);resolve(event.data?.ready===true&&event.data?.version==='adiel-portfolio-20261011-15');channel.port1.close();};
    worker.postMessage({type:'CHECK_OFFLINE'},[channel.port2]);
   });
   if(!cached)throw new Error('incomplete');
   status.textContent='Cópia pronta neste navegador: projetos e minijogo disponíveis offline. No iPhone, use Compartilhar → Adicionar à Tela de Início. Links externos precisam de internet.';
   save.textContent='Cópia offline pronta';
  }catch{status.textContent='Não foi possível concluir a cópia offline. Confira sua conexão e tente novamente.';save.disabled=false;}
 });
}
