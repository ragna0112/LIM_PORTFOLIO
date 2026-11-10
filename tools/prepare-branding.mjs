// Derive every public mark directly from the supplied silver artwork.
import sharp from 'sharp';
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const original='source-assets/branding/rlwork-silver-original.png';
await mkdir('verification/branding',{recursive:true});
const symbol={left:276,top:252,width:700,height:526};
const wordmark={left:390,top:840,width:490,height:116};
const stacked={left:276,top:252,width:700,height:718};
const symbolImage=await sharp(original).extract(symbol).resize({height:132}).png().toBuffer();
const wordImage=await sharp(original).extract(wordmark).resize({height:84}).png().toBuffer();
await sharp({create:{width:566,height:144,channels:3,background:'black'}}).composite([{input:symbolImage,left:6,top:6},{input:wordImage,left:205,top:30}]).webp({quality:95}).toFile('public/branding/rlwork-header-silver.webp');
await sharp(original).extract(stacked).resize({width:640}).webp({quality:95}).toFile('public/branding/rlwork-footer-silver.webp');
const icons=[];
for(const size of [16,32,48,180]){
 const padding=size<=48?1:12;
 let image=sharp(original).extract(symbol).resize(size-padding*2,size-padding*2,{fit:'contain',background:'black'});
 if(size<=48)image=image.modulate({brightness:1.3}).sharpen({sigma:.6});
 const buffer=await image.extend({top:padding,bottom:padding,left:padding,right:padding,background:'black'}).ensureAlpha().png().toBuffer();
 icons.push({size,png:buffer});
 const path=size===180?'public/apple-touch-icon.png':size===48?'source-assets/branding/favicon-48x48.png':`public/favicon-${size}x${size}.png`;
 await writeFile(path,buffer);
}
const header=Buffer.alloc(54);header.writeUInt16LE(1,2);header.writeUInt16LE(3,4);let offset=54;
icons.slice(0,3).forEach(({size,png},i)=>{const p=6+i*16;header[p]=header[p+1]=size;header.writeUInt16LE(1,p+4);header.writeUInt16LE(32,p+6);header.writeUInt32LE(png.length,p+8);header.writeUInt32LE(offset,p+12);offset+=png.length;});
await writeFile('public/favicon.ico',Buffer.concat([header,...icons.slice(0,3).map(i=>i.png)]));
const layers=[];let x=16;for(const {size,png}of icons.slice(0,3)){layers.push({input:png,left:x,top:16},{input:await sharp(png).resize(size*6,size*6,{kernel:'nearest'}).png().toBuffer(),left:x,top:80});x+=size*6+30;}
await sharp({create:{width:750,height:400,channels:3,background:'#222'}}).composite(layers).png().toFile('verification/branding/favicon-pixel-review.png');
for(const name of ['rlwork-header-flat.svg','rlwork-symbol-flat.svg','rlwork-wordmark-flat.svg'])await rm('public/branding/'+name,{force:true});
await writeFile('source-assets/branding/preparation.json',JSON.stringify({source:original,sha256:createHash('sha256').update(await readFile(original)).digest('hex'),symbol,wordmark,stacked,header:{width:566,height:144},favicon:{sizes:[16,32,48,180],opaqueBlack:true,sourceGeometryPreserved:true},manifestPresent:false},null,2)+'\n');
