import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const [name, width, height] of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844],['small-mobile',320,740]] as const) {
  test(`${name}: responsive content, screenshots and accessibility`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    await page.locator('.intro-running').waitFor({state:'detached',timeout:10000});
    await page.evaluate(()=>document.fonts.ready);
    await expect(page.getByRole('heading',{level:1})).toHaveAccessibleName('Rich Daniel Lim');
    await expect(page.getByRole('heading',{level:1})).toBeVisible();
    await page.screenshot({path:`verification/${name}-hero.png`});
    for(const id of ['cinemetrics','panahonph','quakeph','lams-docuflow']) {
      const project = page.locator(`#${id}`);
      await project.scrollIntoViewIfNeeded();
      await page.waitForTimeout(850);
      if(id==='lams-docuflow')await expect(project.getByRole('link',{name:/GitHub/})).toHaveCount(0);
      else await expect(project.getByRole('link',{name:/GitHub/})).toHaveAttribute('href',/https:\/\/github.com\/ragna0112\//);
      expect(await project.locator('.screenshot-wrap img, .gallery-preview img').first().evaluate((image:HTMLImageElement)=>image.complete && image.naturalWidth>0)).toBeTruthy();
      if(id==='cinemetrics') await project.screenshot({path:`verification/${name}-project.png`});
    }
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.waitForTimeout(850);
    await page.screenshot({path:`verification/${name}-contact.png`});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const violations = (await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
    expect(violations.map(v=>({id:v.id, nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
    expect(errors).toEqual([]);
  });
}
test('keyboard: skip link, navigation, accordion, persistent contact',async({page})=>{
  await page.goto('/');
  await page.locator('.intro-running').waitFor({state:'detached',timeout:10000});
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main/);
  const button=page.getByRole('button',{name:'02 APIs & SQL fundamentals'});
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('#cap-panel-1')).toBeVisible();
  await expect(page.locator('#cap-panel-0')).toBeHidden();
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-expanded','false');
  const connect=page.getByRole('link',{name:'Let’s connect',exact:true});
  await connect.focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contact/);
});
test('reduced motion: static readable content, no loader, particles or transforms',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('.loader')).toHaveCount(0);
  await expect(page.locator('.portrait-canvas')).toHaveCount(0);
  await expect(page.locator('.constellation-static')).toBeVisible();
  expect(await page.locator('.ticker-track').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  await page.locator('#quakeph').scrollIntoViewIfNeeded();
  expect(await page.locator('#quakeph .screenshot-wrap img').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await page.screenshot({path:'verification/reduced-motion.png'});
});
test('animations run automatically without a header pause/play control',async({page})=>{
  await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});
  await expect(page.locator('.navigation button:not(.menu-toggle)')).toHaveCount(0);
  await expect(page.getByRole('button',{name:/pause|resume|replay/i})).toHaveCount(0);
  expect(await page.locator('.ticker-track').evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
  expect(await page.evaluate(()=>document.elementFromPoint(innerWidth-85,43)?.closest('button'))).toBeNull();
});
test('mobile coarse pointer hides desktop cursor',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();await page.goto('http://127.0.0.1:4173');
  await expect(page.locator('.cursor')).toBeHidden();
  expect(await page.locator('.screenshot-wrap').first().evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await context.close();
});
for(const reduced of [false,true])test(`production performance under CPU and network throttling (${reduced?'reduced motion':'automatic intro'})`,async({page})=>{
  if(reduced)await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:390,height:844});
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:1_600_000/8,uploadThroughput:750_000/8});
  await page.addInitScript(()=>{
    (window as any).__metrics={lcp:0,cls:0,longTasks:[]};
    new PerformanceObserver(list=>{for(const entry of list.getEntries()) (window as any).__metrics.lcp=entry.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
    new PerformanceObserver(list=>{for(const e of list.getEntries() as any) if(!e.hadRecentInput) (window as any).__metrics.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(list=>{for(const entry of list.getEntries()) (window as any).__metrics.longTasks.push(entry.duration);}).observe({type:'longtask',buffered:true});
  });
  // Measure both cold-load paths. The automatic path includes the unchanged 5.5-second intro.
  await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});
  await page.locator('.intro-running').waitFor({state:'detached',timeout:10000});
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await page.waitForTimeout(2500);
  const metrics=await page.evaluate(()=>({...((window as any).__metrics),resources:performance.getEntriesByType('resource').map((e:any)=>({name:e.name.split('/').pop(),bytes:e.transferSize})),domNodes:document.querySelectorAll('*').length}));
  console.log('THROTTLED MOBILE',JSON.stringify(metrics));
  expect(metrics.cls).toBeLessThan(.1);
  expect(metrics.lcp).toBeLessThan(reduced?4000:9500);
  expect(metrics.domNodes).toBeLessThan(900);
});
test('all static content passes automated accessibility checks',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
});
