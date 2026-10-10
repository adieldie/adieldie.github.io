import {mkdir,copyFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/assets',{recursive:true});
for(const file of ['index.html','styles.css','app.js','sculpture.js','projects.js','project-utils.js','platformer.js','platformer.css','motion-scenes.js','motion-scenes.css','offline.js','sw.js','manifest.webmanifest','.nojekyll'])await copyFile(file,'dist/'+file);
await copyFile('assets/favicon.svg','dist/assets/favicon.svg');
await copyFile('assets/adiel-alves-linkedin.webp','dist/assets/adiel-alves-linkedin.webp');console.log('Static site built in dist/');
