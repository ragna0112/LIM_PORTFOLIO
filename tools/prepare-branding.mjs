// Supplied artwork only: measured node geometry, traced wordmark contours, original silver crop.
import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
for(const dir of ['public/branding','verification/branding'])await mkdir(dir,{recursive:true});
const original='source-assets/branding/rlwork-silver-original.png';
const nodes=[
 [326.5,304,15],[390,374,24],[546.5,327,24.5],[611,270,14],
 [616,434,25.5],[357.5,507.5,41],[326,647,21],[294,728,14],
 [487,615,25],[566,724,15],[693,679,37],[753,761,14],
 [849,658,23],[960,624,14],[742,525,22.5],[774,394,23.5],[838,315,14.5],
];
const edges=[[0,1],[1,2],[2,3],[2,4],[4,5],[5,1],[5,6],[6,7],[5,8],[8,9],[8,10],[10,11],[10,12],[12,13],[10,14],[14,15],[15,16]];
const terminals=new Set([0,3,7,9,11,13,16]);
const symbol=(stroke=9,omitTerminals=false)=>`<g fill="none" stroke="white" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${edges.filter(([a,b])=>!omitTerminals||(!terminals.has(a)&&!terminals.has(b))).map(([a,b])=>`<path d="M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}"/>`).join('')}</g><g fill="white">${nodes.filter((_,i)=>!omitTerminals||!terminals.has(i)).map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
const svg=(width,height,body,viewBox=`0 0 ${width} ${height}`)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}">${body}</svg>\n`;
await writeFile('public/branding/rlwork-symbol-flat.svg',svg(700,526,symbol(),'276 252 700 526'));

// Trace the supplied RLwork wordmark instead of substituting a typeface.
const crop={left:390,top:840,width:490,height:116};
const {data,info}=await sharp(original).extract(crop).removeAlpha().raw().toBuffer({resolveWithObject:true});
const w=info.width,h=info.height;
let mask=new Uint8Array(w*h);
for(let i=0;i<w*h;i++)mask[i]=Math.max(data[i*3],data[i*3+1],data[i*3+2])>=56?1:0;
// Close one-pixel bevel gaps; real letter counters remain open.
const dilated=new Uint8Array(w*h),closed=new Uint8Array(w*h);
for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(mask[(y+dy)*w+x+dx])dilated[y*w+x]=1;}
for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){let yes=true;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(!dilated[(y+dy)*w+x+dx])yes=false;closed[y*w+x]=yes?1:0;}
mask=closed;
// Remove tiny isolated anti-alias/glow specks, never any letter component.
const visited=new Uint8Array(w*h);
for(let i=0;i<mask.length;i++)if(mask[i]&&!visited[i]){const group=[i];visited[i]=1;for(let q=0;q<group.length;q++){const p=group[q],x=p%w,y=Math.floor(p/w);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,n=yy*w+xx;if(xx>=0&&xx<w&&yy>=0&&yy<h&&mask[n]&&!visited[n]){visited[n]=1;group.push(n);}}}if(group.length<12)for(const p of group)mask[p]=0;}
const boundary=new Map();
const add=(x,y,xx,yy)=>{const key=`${x},${y}`;if(!boundary.has(key))boundary.set(key,[]);boundary.get(key).push([xx,yy]);};
const inside=(x,y)=>x>=0&&x<w&&y>=0&&y<h&&mask[y*w+x];
for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(inside(x,y)){
 if(!inside(x,y-1))add(x,y,x+1,y);if(!inside(x+1,y))add(x+1,y,x+1,y+1);if(!inside(x,y+1))add(x+1,y+1,x,y+1);if(!inside(x-1,y))add(x,y+1,x,y);
}
function rdp(points,epsilon){if(points.length<3)return points;const a=points[0],b=points.at(-1);let far=0,index=0;const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);for(let i=1;i<points.length-1;i++){const p=points[i],d=length?Math.abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/length:Math.hypot(p[0]-a[0],p[1]-a[1]);if(d>far){far=d;index=i;}}return far>epsilon?[...rdp(points.slice(0,index+1),epsilon).slice(0,-1),...rdp(points.slice(index),epsilon)]:[a,b];}
const contours=[];
while(boundary.size){const key=boundary.keys().next().value,start=key.split(',').map(Number);let p=start,previous=[start[0]-1,start[1]],loop=[];
 for(let guard=0;guard<10000;guard++){
  loop.push(p);const k=p.join(','),options=boundary.get(k);if(!options?.length)break;
  const ax=p[0]-previous[0],ay=p[1]-previous[1];options.sort((a,b)=>{const score=q=>{const bx=q[0]-p[0],by=q[1]-p[1],cross=ax*by-ay*bx,dot=ax*bx+ay*by;return cross>0?3:dot>0?2:cross<0?1:0;};return score(b)-score(a);});
  const next=options.shift();if(!options.length)boundary.delete(k);previous=p;p=next;if(p[0]===start[0]&&p[1]===start[1])break;
 }
 if(loop.length>5){let area=0;loop.forEach((p,i)=>{const q=loop[(i+1)%loop.length];area+=p[0]*q[1]-q[0]*p[1];});if(Math.abs(area)>12){let far=1;for(let i=2;i<loop.length;i++)if(Math.hypot(loop[i][0]-loop[0][0],loop[i][1]-loop[0][1])>Math.hypot(loop[far][0]-loop[0][0],loop[far][1]-loop[0][1]))far=i;contours.push([...rdp(loop.slice(0,far+1),.6).slice(0,-1),...rdp([...loop.slice(far),loop[0]],.6).slice(0,-1)]);}}
}
const all=contours.flat(),minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1]));
const wordWidth=maxX-minX,wordHeight=maxY-minY;
const path=contours.map(points=>points.map(([x,y],i)=>`${i?'L':'M'}${x-minX} ${y-minY}`).join('')+'Z').join('');
await writeFile('public/branding/rlwork-wordmark-flat.svg',svg(wordWidth,wordHeight,`<path fill="white" fill-rule="evenodd" d="${path}"/>`));
const scale=40/526,symbolWidth=700*scale,wordScale=26/wordHeight,wordX=4+symbolWidth+12,headerWidth=Math.ceil(wordX+wordWidth*wordScale+4);
const header=`<g transform="translate(4 4) scale(${scale}) translate(-276 -252)">${symbol()}</g><g transform="translate(${wordX} 11) scale(${wordScale})"><path fill="white" fill-rule="evenodd" d="${path}"/></g>`;
await writeFile('public/branding/rlwork-header-flat.svg',svg(headerWidth,48,header));
await sharp(Buffer.from(svg(headerWidth,48,`<rect width="100%" height="100%" fill="#090909"/>${header}`))).resize({width:headerWidth*3}).png().toFile('verification/branding/header-vector-preview.png');

// Keep the original black matte to protect the silver bevels and fine connectors.
const silverCrop={left:252,top:230,width:750,height:740};
const silver=await sharp(original).extract(silverCrop).resize({width:640,withoutEnlargement:true}).webp({quality:93,effort:6}).toFile('public/branding/rlwork-footer-silver.webp');

async function icon(size){
 const tiny=size===16,padding=tiny?1.2:size===32?2:size===48?3:14;
 const indices=nodes.map((_,i)=>i).filter(i=>!tiny||!terminals.has(i));
 const left=Math.min(...indices.map(i=>nodes[i][0]-nodes[i][2])),right=Math.max(...indices.map(i=>nodes[i][0]+nodes[i][2])),top=Math.min(...indices.map(i=>nodes[i][1]-nodes[i][2])),bottom=Math.max(...indices.map(i=>nodes[i][1]+nodes[i][2]));
 const s=(size-padding*2)/Math.max(right-left,bottom-top),tx=(size-(right-left)*s)/2-left*s,ty=(size-(bottom-top)*s)/2-top*s;
 const stroke=tiny?1.0:size===32?1.15:size===48?1.35:2.6;
 const lines=edges.filter(([a,b])=>indices.includes(a)&&indices.includes(b)).map(([a,b])=>`<path d="M${nodes[a][0]*s+tx} ${nodes[a][1]*s+ty}L${nodes[b][0]*s+tx} ${nodes[b][1]*s+ty}"/>`).join('');
 const dots=indices.map(i=>{const [x,y,r]=nodes[i];const radius=Math.max(tiny?.48:size<49?.6:0,r*s);return `<circle cx="${x*s+tx}" cy="${y*s+ty}" r="${radius}"/>`;}).join('');
 const body=`<rect width="${size}" height="${size}" fill="black"/><g stroke="white" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">${lines}</g><g fill="white">${dots}</g>`;
 return sharp(Buffer.from(svg(size,size,body))).resize(size*4,size*4).png().toBuffer().then(buffer=>sharp(buffer).resize(size,size,{kernel:'lanczos3'}).ensureAlpha().png().toBuffer());
}
const icons=[];for(const size of [16,32,48,180]){const png=await icon(size);icons.push({size,png});if(size===16||size===32)await writeFile(`public/favicon-${size}x${size}.png`,png);if(size===180)await writeFile('public/apple-touch-icon.png',png);if(size===48)await writeFile('source-assets/branding/favicon-48x48.png',png);}
const icoHeader=Buffer.alloc(6+3*16);icoHeader.writeUInt16LE(1,2);icoHeader.writeUInt16LE(3,4);let offset=icoHeader.length;
icons.slice(0,3).forEach(({size,png},i)=>{const entry=6+i*16;icoHeader[entry]=icoHeader[entry+1]=size;icoHeader.writeUInt16LE(1,entry+4);icoHeader.writeUInt16LE(32,entry+6);icoHeader.writeUInt32LE(png.length,entry+8);icoHeader.writeUInt32LE(offset,entry+12);offset+=png.length;});
await writeFile('public/favicon.ico',Buffer.concat([icoHeader,...icons.slice(0,3).map(icon=>icon.png)]));
// Show actual native sizes plus nearest-neighbor enlargement for pixel inspection.
const layers=[];let x=20;for(const {size,png}of icons.slice(0,3)){layers.push({input:png,left:x,top:20});layers.push({input:await sharp(png).resize(size*6,size*6,{kernel:'nearest'}).png().toBuffer(),left:x,top:90});x+=size*6+30;}
await sharp({create:{width:750,height:410,channels:3,background:'#222'}}).composite(layers).png().toFile('verification/branding/favicon-pixel-review.png');
await writeFile('source-assets/branding/preparation.json',JSON.stringify({source:'rlwork-silver-original.png',sha256:createHash('sha256').update(await readFile(original)).digest('hex'),sourceSize:[1254,1254],flatSourceSupplied:false,nodes,edges,wordmark:{crop,threshold:56,contours:contours.length,bounds:{minX,maxX,minY,maxY},simplificationTolerance:.6},header:{width:headerWidth,height:48},silver:{crop:silverCrop,width:silver.width,height:silver.height,blackMatteRetained:true},favicon:{sizes:[16,32,48],opaqueBlack:true,tinyOmittedTerminalIndices:[...terminals],strokePixels:{16:1,32:1.15,48:1.35,180:2.6}},manifestPresent:false},null,2)+'\n');
console.log({headerWidth,wordWidth,wordHeight,contours:contours.length,silver:[silver.width,silver.height]});
