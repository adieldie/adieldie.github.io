import {mkdir,copyFile,rm,cp} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});
for(const file of ['index.html','styles.css','marketing.css','editorial.css','app.js','sculpture.js','projects.js','project-utils.js','platformer.js','platformer.css','gallery.css','reference-polish.css','theme.js','theme.css','motion-scenes.js','motion-scenes.css','offline.js','sw.js','manifest.webmanifest','.nojekyll'])await copyFile(file,'dist/'+file);
await mkdir('dist/assets/gallery',{recursive:true});
for(const name of ['automacao','dados','sistemas','estudos'])await copyFile('assets/gallery/'+name+'.webp','dist/assets/gallery/'+name+'.webp');
await copyFile('assets/favicon.svg','dist/assets/favicon.svg');
await copyFile('assets/adiel-alves-linkedin.webp','dist/assets/adiel-alves-linkedin.webp');console.log('Static site built in dist/');

await cp('assets/marketing','dist/assets/marketing',{recursive:true});
