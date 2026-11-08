// Read-only source PDFs are rendered with Poppler; originals and resume remain byte-identical.
import {copyFile,mkdir,writeFile,readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const sources=[
 {source:'ADESQLCERTLIM.pdf',slug:'datacamp-associate-data-engineer-sql'},
 {source:'LIM_AI Fluency Certificate.pdf',slug:'anthropic-ai-fluency'},
 {source:'LIM_SAPCERT_GENERATIVE_AI.jpg',slug:'sap-generative-ai-developer'},
 {source:'Cert41733128407.pdf',slug:'pmi-project-management-ready'},
 {source:'PythonCERTLIIM.pdf',slug:'certiport-python'},
];
for(const dir of ['source-assets/credentials','public/credentials','public/documents','tmp/pdfs/credentials','verification/credentials'])await mkdir(dir,{recursive:true});
const manifest=[];
for(const item of sources){
 const original=`source-assets/credentials/${item.source}`;
 await copyFile(`/Users/rich/Downloads/${item.source}`,original);
 let input=original;
 if(item.source.endsWith('.pdf')){const stem=`tmp/pdfs/credentials/${item.slug}`;execFileSync('pdftoppm',['-f','1','-l','1','-scale-to','1800','-png','-singlefile',original,stem]);input=`${stem}.png`;}
 const full=`public/credentials/${item.slug}.webp`,preview=`public/credentials/${item.slug}-preview.webp`;
 const meta=await sharp(input).metadata();
 await sharp(input).webp({quality:94,effort:6}).toFile(full);
 const thumb=await sharp(input).resize({width:480,withoutEnlargement:true}).webp({quality:84,effort:6}).toFile(preview);
 const hash=createHash('sha256').update(await readFile(original)).digest('hex');
 manifest.push({...item,sha256:hash,full,width:meta.width,height:meta.height,preview,previewWidth:thumb.width,previewHeight:thumb.height});
}
const resumeSource='/Users/rich/Downloads/Rich Daniel A. Lim - Briefcase.pdf';
await copyFile(resumeSource,'source-assets/credentials/Rich Daniel A. Lim - Briefcase.pdf');
await copyFile(resumeSource,'public/documents/Rich-Daniel-Lim-Resume.pdf');
const resumeHash=createHash('sha256').update(await readFile(resumeSource)).digest('hex');
await writeFile('source-assets/credentials/manifest.json',JSON.stringify({certificates:manifest,resume:{filename:'Rich-Daniel-Lim-Resume.pdf',sha256:resumeHash,pages:2}},null,2)+'\n');
console.log(manifest.map(({slug,width,height})=>({slug,width,height})));console.log('Resume copied unchanged:',resumeHash);
