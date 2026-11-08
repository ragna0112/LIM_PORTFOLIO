/** Local, non-generative processing. The NEF is read only; output contains no EXIF. */
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const source = process.argv[2] || '/Users/rich/Downloads/picture rich.NEF';
export const crop = { left: 760, top: 520, width: 2200, height: 3600 }; // Oriented 4000 × 6000 source.
const temp = mkdtempSync(join(tmpdir(), 'rich-portrait-'));
mkdirSync('public/images', { recursive: true });
try {
  // macOS ImageIO / Camera RAW decoding, not a renamed or extracted JPEG preview.
  execFileSync('sips', ['-s', 'format', 'png', source, '--out', join(temp, 'decoded.png')]);
  const { data, info } = await sharp(join(temp, 'decoded.png')).rotate().extract(crop).resize({ width: 660 }).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const lumas = new Float32Array(info.width * info.height);
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const p = (y * info.width + x) * 4;
    const r = data[p], g = data[p+1], b = data[p+2];
    // Green chroma key with feathering. Face, glasses, hair and clothing remain source pixels.
    const excess = g - Math.max(r, b);
    let alpha = 1 - Math.max(0, Math.min(1, (excess - 5) / 24));
    if (g > r * 1.18 && g > b * 1.25) alpha = 0;
    const bottomFade = Math.max(0, Math.min(1, (1 - y / info.height) / .13));
    alpha *= bottomFade;
    const luminance = .2126*r + .7152*g + .0722*b;
    lumas[y*info.width+x] = luminance;
    data[p] = data[p+1] = data[p+2] = Math.round(luminance);
    data[p+3] = Math.round(alpha*255);
  }
  await sharp(data,{raw:info}).webp({quality:91,alphaQuality:100}).toFile('public/images/rich-mask.webp');
  // Same source pixels, rendered as monochrome dots for reduced motion / no Canvas.
  let dots = '';
  for(let y=0;y<info.height;y+=3) for(let x=0;x<info.width;x+=3){
    const i=y*info.width+x, alpha=data[i*4+3]/255;
    if(alpha<.05) continue;
    const l=lumas[i]/255;
    const edge=Math.abs(lumas[i]-lumas[Math.min(i+2,lumas.length-1)])/255;
    const face=y/info.height<.4;
    const opacity=Math.min(1,((face?.23:.13)+Math.pow(l,.82)*(face?.78:.67)+edge*.9)*alpha);
    dots+=`<circle cx="${x}" cy="${y}" r="${(.50+l*.6).toFixed(2)}" fill="white" opacity="${opacity.toFixed(2)}"/>`;
  }
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}" viewBox="0 0 ${info.width} ${info.height}">${dots}</svg>`;
  await sharp(Buffer.from(svg)).webp({quality:88,alphaQuality:100}).toFile('public/images/rich-dots.webp');
  writeFileSync('portrait-source/preparation.json',JSON.stringify({source,decoder:'macOS sips / ImageIO Camera RAW',orientedSource:{width:4000,height:6000},crop,output:{width:info.width,height:info.height},processing:'Feathered green chroma key, monochrome conversion, bottom fade. No face generation or reshaping.'},null,2));
  console.log(`Prepared ${info.width} × ${info.height} portrait mask and dot fallback; original unchanged.`);
} finally { rmSync(temp,{recursive:true,force:true}); }
