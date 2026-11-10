import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const digest=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
test('branding preserves the uploaded silver artwork and uses optimized crops',async()=>{
 const prep=JSON.parse(await readFile('source-assets/branding/preparation.json','utf8'));
 expect(digest(await readFile(prep.source))).toBe(prep.sha256);
 const header=await sharp('public/branding/rlwork-header-silver.webp').metadata();expect([header.width,header.height]).toEqual([566,144]);
 const preserved=JSON.parse(await readFile('verification/branding/preserved-hashes.json','utf8'));
 for(const [file,hash]of Object.entries(preserved))expect(digest(await readFile(file)),file).toBe(hash);
});
test('icons have opaque black backgrounds and ICO contains all three sizes',async({request})=>{
 const ico=await readFile('public/favicon.ico');expect(ico.readUInt16LE(2)).toBe(1);expect(ico.readUInt16LE(4)).toBe(3);
 for(let i=0;i<3;i++){const pos=6+i*16,size=[16,32,48][i];expect(ico[pos]).toBe(size);expect(ico[pos+1]).toBe(size);const png=ico.subarray(ico.readUInt32LE(pos+12),ico.readUInt32LE(pos+12)+ico.readUInt32LE(pos+8));expect((await sharp(png).metadata()).width).toBe(size);}
 for(const [path,size]of [['favicon-16x16.png',16],['favicon-32x32.png',32],['apple-touch-icon.png',180]] as const){
  const response=await request.get('/'+path);expect(response.ok()).toBeTruthy();const data=await response.body();expect(digest(data)).toBe(digest(await readFile('public/'+path)));
  const {data:pixels,info}=await sharp(data).ensureAlpha().raw().toBuffer({resolveWithObject:true});expect(info.width).toBe(size);expect(info.height).toBe(size);expect([...pixels.subarray(0,4)]).toEqual([0,0,0,255]);expect(Array.from(pixels).filter((_,n)=>n%4===3).every(alpha=>alpha===255)).toBeTruthy();
 }
});
for(const [width,height]of [[1920,1080],[1440,900],[1024,768],[768,1024],[390,844],[320,740]])test(`logos fit and Home works at ${width}x${height}`,async({page})=>{
 await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 const logo=page.getByRole('link',{name:'RLwork — Rich Daniel Lim, Home',exact:true});await expect(logo).toBeVisible();await expect(logo.locator('img')).toHaveAttribute('alt','');
 await expect.poll(()=>page.locator('.intro-running').count()).toBe(0);
 const box=await logo.boundingBox();expect(box!.x).toBeGreaterThanOrEqual(20);expect(box!.width).toBeLessThan(width/2+10);
 expect(await logo.locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBeTruthy();
 expect(await logo.locator('img').evaluate(el=>el.getBoundingClientRect().height)).toBe(width<=650?34:44);
 await page.locator('footer').scrollIntoViewIfNeeded();const footer=page.locator('.footer-brand img');await expect(footer).toBeVisible();await expect.poll(()=>footer.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBeTruthy();
 await expect(page.locator('footer').getByRole('link',{name:/LinkedIn/})).toBeVisible();await expect(page.locator('footer').getByRole('link',{name:/GitHub/})).toBeVisible();
 await logo.click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(3);expect(new URL(page.url()).hash).toBe('');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);
 await page.screenshot({path:`verification/branding/header-${width}.png`});
});
