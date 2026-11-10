import { test, expect } from '@playwright/test';

test('every page load plays ball, individual words, scatter, portrait in about 5.5 seconds',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  const canvas=page.locator('.portrait-canvas');
  await expect(page.locator('.intro-running')).toHaveCount(1);
  await expect(canvas).toHaveAttribute('data-phase','ball');
  const started=Date.now();
  for(const phase of ['rich-daniel','lim','portfolio','portrait-transition','portrait']){
    await expect(canvas).toHaveAttribute('data-phase',phase,{timeout:2500});
    await page.waitForTimeout(100);
    await page.screenshot({path:`verification/sequence-${phase}.png`});
  }
  expect(Date.now()-started).toBeGreaterThan(4800);expect(Date.now()-started).toBeLessThan(6500);
  await expect(page.getByRole('button',{name:'Skip intro'})).toHaveCount(0);
  await expect(page.getByRole('heading',{level:1})).toHaveAccessibleName('Rich Daniel Lim');
  expect(await canvas.getAttribute('data-particles')).toBe('16000');
  await page.reload();await expect(page.locator('.intro-running')).toHaveCount(1);
  await expect(canvas).toHaveAttribute('data-phase','ball');
  await expect(page.getByRole('button',{name:/replay/i})).toHaveCount(0);
});
test('no intro control in the keyboard order; ordinary navigation remains accessible',async({page})=>{
 await page.goto('/');await expect(page.getByRole('button',{name:/skip intro|replay/i})).toHaveCount(0);
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await expect(page.locator('.intro-running')).toHaveCount(0);await expect(page.locator('.skip-intro')).toHaveCount(0);
});
test('portrait-only desktop interaction and return',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});
  const canvas=page.locator('.portrait-canvas');
  await expect(canvas).toHaveAttribute('data-ready','true');
  await page.mouse.move(1100,320);await expect(canvas).toHaveAttribute('data-interacting','true');
  await page.waitForTimeout(450);await page.screenshot({path:'verification/portrait-pointer.png'});
  await page.mouse.move(300,700);await expect(canvas).toHaveAttribute('data-interacting','false');
  await page.waitForTimeout(800);await page.screenshot({path:'verification/portrait-return.png'});
});
test('reduced motion receives the static short fade on every refresh',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.intro-running')).toHaveCount(0);await expect(page.locator('.portrait-canvas')).toHaveCount(0);
  await expect(page.locator('.portrait-fallback')).toBeVisible();
  await page.reload();
  await expect(page.locator('.intro-running')).toHaveCount(0);
  await expect(page.locator('.portrait-fallback')).toBeVisible();
  await expect(page.getByRole('button',{name:/replay/i})).toHaveCount(0);
});
test('save-data skips intro and requests only dot fallback',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(navigator,'connection',{value:{saveData:true,addEventListener(){},removeEventListener(){}}});});
  await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0);
  await expect(page.locator('.portrait-canvas')).toHaveCount(0);await expect(page.locator('.portrait-fallback')).toBeVisible();
  expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(e=>e.name.includes('rich-mask')))).toBeFalsy();
});
test('Canvas unavailable preserves an optimized portrait and readable hero',async({page})=>{
  await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=(()=>null) as typeof HTMLCanvasElement.prototype.getContext;});
  await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0);
  await expect(page.locator('.portrait-fallback')).toBeVisible();await expect(page.getByRole('heading',{level:1})).toBeVisible();
});
test('intro never reads or writes browser storage and still runs on refresh',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    for(const key of ['sessionStorage','localStorage']) Object.defineProperty(window,key,{get(){throw new Error('Unexpected persistent storage access');}});
    Object.defineProperty(document,'cookie',{get(){throw new Error('Unexpected cookie access');},set(){throw new Error('Unexpected cookie write');}});
  });
  await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});
  await expect(page.locator('.intro-running')).toHaveCount(0);
  await page.reload();await expect(page.locator('.intro-running')).toHaveCount(1);
  await expect(page.locator('.portrait-canvas')).toHaveAttribute('data-phase','ball');
  expect(errors).toEqual([]);
});
test('hidden tab suspends intro timeline and resumes without skipping words',async({page})=>{
  await page.goto('/');const canvas=page.locator('.portrait-canvas');await expect(canvas).toHaveAttribute('data-phase','ball');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForTimeout(1800);await expect(canvas).toHaveAttribute('data-phase','ball');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(canvas).toHaveAttribute('data-phase','rich-daniel',{timeout:2500});
});
test('touch intro timing, responsive budget and offscreen suspension',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();await page.goto('http://127.0.0.1:4173');
  const canvas=page.locator('.portrait-canvas');await expect(canvas).toHaveAttribute('data-phase','ball');
  const started=Date.now();await expect(canvas).toHaveAttribute('data-phase','portrait',{timeout:6500});
  expect(Date.now()-started).toBeLessThan(6500);await expect(canvas).toHaveAttribute('data-particles','5000');
  await page.locator('#work').scrollIntoViewIfNeeded();await page.waitForTimeout(150);
  const frozen=await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(350);expect(await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL())).toBe(frozen);
  await context.close();
});

test('stalled renderer timeline still releases the intro at Home',async({page})=>{
 test.setTimeout(18000);
 // Suspend the renderer's timeline while allowing the independent timer to run.
 await page.addInitScript(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});});
 await page.goto('/#work');
 await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11500});
 await expect.poll(()=>page.evaluate(()=>document.documentElement.style.overflow)).toBe('');
 expect(await page.evaluate(()=>scrollY)).toBe(0);expect(await page.evaluate(()=>location.hash)).toBe('');
 await expect(page.locator('#hero-title')).toBeVisible();
});

test('failed portrait asset and renderer exception reveal Home',async({page})=>{
 await page.route('**/images/rich-mask.webp',route=>route.abort());
 await page.goto('/#work');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});
 await expect.poll(()=>page.evaluate(()=>document.documentElement.style.overflow)).toBe('');expect(await page.evaluate(()=>scrollY)).toBe(0);
 await page.unroute('**/images/rich-mask.webp');
 await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=(()=>{throw new Error('Renderer unavailable');}) as typeof HTMLCanvasElement.prototype.getContext;});
 await page.reload();await expect(page.locator('.intro-running')).toHaveCount(0);await expect(page.locator('#hero-title')).toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);
});
