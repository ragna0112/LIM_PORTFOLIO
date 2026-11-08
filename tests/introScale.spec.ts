import { test,expect, type Locator } from '@playwright/test';

async function visibleBounds(canvas:Locator){
  return canvas.evaluate(el=>{
    const c=el as HTMLCanvasElement;
    const {width,height,data}=c.getContext('2d')!.getImageData(0,0,c.width,c.height);
    let left=width,top=height,right=0,bottom=0;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]>80){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
    const scale=innerWidth/c.width;
    return {width:(right-left+1)*scale,height:(bottom-top+1)*scale,left:left*scale,top:top*scale,right:(width-right-1)*scale,bottom:(height-bottom-1)*scale,ratio:(right-left+1)/width,centerX:(left+right+1)*scale/2,centerY:(top+bottom+1)*scale/2};
  });
}
for(const [name,width,height] of [['1440',1440,900],['1920',1920,1080],['1366',1366,768],['tablet-portrait',768,1024],['tablet-landscape',1024,768],['mobile',390,844],['small-mobile',320,740],['large-mobile',430,932]] as const){
  test(`${name}: shared typography and equal painted particle heights`,async({page})=>{
    await page.setViewportSize({width,height});await page.goto('/');const canvas=page.locator('.portrait-canvas');
    await expect(canvas).toHaveAttribute('data-ready','true');
    const metrics=JSON.parse((await canvas.getAttribute('data-text-metrics'))!);
    expect(metrics.map((m:{phrase:string})=>m.phrase)).toEqual(['RICH DANIEL','LIM','PORTFOLIO']);
    for(const key of ['font','fontSize','weight','lineHeight','letterSpacing','baseline','capitalHeight','step','radius'])expect(new Set(metrics.map((m:Record<string,unknown>)=>m[key])).size).toBe(1);
    expect(metrics[0].weight).toBe(800);expect(metrics[0].lineHeight).toBe(.85);expect(metrics[1].width).toBeLessThan(metrics[0].width/2);expect(metrics[1].count).toBeLessThan(metrics[0].count);
    const boxes=[];
    for(const phrase of ['rich-daniel','lim','portfolio']){
      await page.waitForFunction(phase=>document.querySelector<HTMLCanvasElement>('.portrait-canvas')?.dataset.settled===phase,phrase,{polling:'raf',timeout:3500});
      const box=await visibleBounds(canvas);boxes.push(box);
      expect(Math.min(box.left,box.top,box.right,box.bottom)).toBeGreaterThanOrEqual(24);
      expect(Math.abs(box.centerX-width/2)).toBeLessThan(3);expect(Math.abs(box.centerY-height/2)).toBeLessThan(3);
      console.log('UNIFORM GLYPHS',name,phrase,JSON.stringify(box));
      await page.screenshot({path:`verification/intro-uniform/${name}-${phrase}.png`});
    }
    expect(Math.max(...boxes.map(box=>box.height))-Math.min(...boxes.map(box=>box.height))).toBeLessThanOrEqual(1);
    expect(boxes[1].width).toBeLessThan(boxes[0].width/2);
  });
}
test('DPR and live resize/orientation regenerate one shared CSS-pixel scale',async({browser})=>{
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
  const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');const canvas=page.locator('.portrait-canvas');
  await expect(canvas).toHaveAttribute('data-settled','rich-daniel',{timeout:3500});
  let metrics=JSON.parse((await canvas.getAttribute('data-text-metrics'))!);expect(metrics[0].fontSize).toBeCloseTo(201.6,2);expect(await canvas.evaluate(c=>(c as HTMLCanvasElement).width)).toBe(2160);
  await page.setViewportSize({width:390,height:844});
  await expect.poll(async()=>JSON.parse((await canvas.getAttribute('data-text-metrics'))!)[0].fontSize).not.toBeCloseTo(201.6,2);
  metrics=JSON.parse((await canvas.getAttribute('data-text-metrics'))!);expect(new Set(metrics.map((m:{fontSize:number})=>m.fontSize)).size).toBe(1);expect(Math.max(...metrics.map((m:{width:number})=>m.width))).toBeLessThanOrEqual(338);expect(await canvas.evaluate(c=>(c as HTMLCanvasElement).width)).toBe(585);
  await page.setViewportSize({width:844,height:390});await expect.poll(async()=>JSON.parse((await canvas.getAttribute('data-text-metrics'))!)[0].fontSize).toBeGreaterThan(metrics[0].fontSize);
  metrics=JSON.parse((await canvas.getAttribute('data-text-metrics'))!);expect(new Set(metrics.map((m:{baseline:number})=>m.baseline)).size).toBe(1);expect(Math.abs(metrics[0].top+metrics[0].height/2-195)).toBeLessThan(1);
  await context.close();
});
test('atmosphere is eased, pointer-transparent, offscreen-suspended and static with reduced motion',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');await page.getByRole('button',{name:'Skip intro'}).click();
  const canvas=page.locator('.portrait-canvas'),atmosphere=page.locator('.hero-atmosphere'),hero=page.locator('.hero');
  await expect(canvas).toHaveAttribute('data-ready','true');await expect(canvas).toHaveAttribute('data-field-count','96');
  expect(await atmosphere.evaluate(el=>getComputedStyle(el).pointerEvents)).toBe('none');
  await page.mouse.move(300,300);await page.waitForTimeout(500);
  const first=await atmosphere.evaluate(el=>({x:parseFloat((el as HTMLElement).style.getPropertyValue('--field-x')),opacity:parseFloat((el as HTMLElement).style.getPropertyValue('--field-alpha'))}));
  expect(first.opacity).toBeGreaterThan(.5);
  await page.mouse.move(800,500);const immediately=await atmosphere.evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--field-x')));
  expect(immediately).toBeLessThan(790);await page.waitForTimeout(700);
  const later=await atmosphere.evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--field-x')));expect(later).toBeGreaterThan(immediately);
  await page.screenshot({path:'verification/intro-scale/background-cursor.png'});
  await page.locator('#work').scrollIntoViewIfNeeded();await expect(hero).toHaveAttribute('data-atmosphere','paused');
  expect(await page.locator('.site').evaluate(el=>getComputedStyle(el,'::after').animationPlayState)).toBe('paused');
  const before=await atmosphere.getAttribute('style');await page.waitForTimeout(200);expect(await atmosphere.getAttribute('style')).toBe(before);
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
  await expect(page.locator('.portrait-canvas')).toHaveCount(0);await expect(page.locator('.atmosphere-cursor')).not.toBeVisible();
  expect(await page.locator('.site').evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
  await page.screenshot({path:'verification/intro-scale/background-reduced-motion.png'});
});

test('uniform intro preserves every unrelated source file and exact phrase spelling',async()=>{
  const {readFile}=await import('node:fs/promises'),{createHash}=await import('node:crypto');
  const saved=JSON.parse(await readFile('verification/intro-uniform/preserved-hashes.json','utf8'));
  for(const [path,hash]of Object.entries(saved))expect(createHash('sha256').update(await readFile(path)).digest('hex')).toBe(hash);
  const {INTRO}=await import('../src/portraitConfig');expect(INTRO.words).toEqual(['RICH DANIEL','LIM','PORTFOLIO']);expect(INTRO.wordStarts).toEqual([1.5,2.5,3.3]);expect(INTRO.end).toBe(5.5);expect(INTRO.textMorph).toBe(.32);
});
