import {test,expect} from '@playwright/test';
const linkedin='https://www.linkedin.com/in/rich-daniel-lim-28a80134a/';
for(const[name,width,height]of [['desktop',1440,900],['tablet',768,1024],['mobile',390,844],['small-mobile',320,740]] as const){
  test(`${name}: LinkedIn, existing contact links and footer remain accessible`,async({page})=>{
    await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const contact=page.locator('#contact');await contact.scrollIntoViewIfNeeded();
    const links=page.getByRole('link',{name:'Visit Rich Daniel Lim on LinkedIn (opens in a new tab)',exact:true});
    await expect(links).toHaveCount(2);
    for(const link of await links.all()){
      await expect(link).toHaveAttribute('href',linkedin);await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noopener noreferrer');
      await link.focus();await expect(link).toBeFocused();expect(await link.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
      expect(await link.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('a')===el;})).toBeTruthy();
    }
    await expect(contact.getByRole('link',{name:/Say hello on GitHub/})).toHaveAttribute('href','https://github.com/ragna0112');
    await expect(page.locator('footer').getByRole('link',{name:/Visit Rich Daniel Lim on GitHub/})).toBeVisible();
    await expect(page.locator('footer').getByRole('link',{name:/BACK TO TOP/})).toBeVisible();
    await expect(page.getByRole('link',{name:'Let’s connect',exact:true})).toHaveAttribute('href','#contact');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:`verification/polish/${name}-contact-footer.png`});
  });
}
test('progress follows scroll without intercepting input',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const progress=page.locator('.reading-progress');
  expect(await progress.evaluate(el=>getComputedStyle(el).pointerEvents)).toBe('none');
  expect(await progress.evaluate(el=>el.getBoundingClientRect().height)).toBeLessThanOrEqual(2);
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(80);expect(await progress.evaluate(el=>el.getBoundingClientRect().width)).toBeLessThan(2);
  await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await page.waitForTimeout(100);
  expect(await progress.evaluate(el=>el.getBoundingClientRect().width/innerWidth)).toBeGreaterThan(.98);
});
test('fine-pointer magnetic links are bounded, keyboard stable and reset with reduced motion',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});
  const link=page.locator('#cinemetrics .project-links a').first();await link.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));await page.waitForTimeout(800);
  const box=(await link.boundingBox())!;await link.hover({position:{x:box.width-6,y:box.height/2}});await page.waitForTimeout(350);
  const translate=await link.evaluate(el=>(el as HTMLElement).style.translate);expect(translate).not.toBe('');
  const x=parseFloat(translate);expect(Math.abs(x)).toBeGreaterThan(.2);expect(Math.abs(x)).toBeLessThanOrEqual(3);
  await link.focus();expect(await link.evaluate(el=>(el as HTMLElement).style.translate)).toBe('');
  await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(box.x+3,box.y+box.height/2);
  expect(await link.evaluate(el=>getComputedStyle(el).translate)).toBe('none');
  await page.getByRole('link',{name:'Let’s connect',exact:true}).hover();
  expect(await page.getByRole('link',{name:'Let’s connect',exact:true}).evaluate(el=>getComputedStyle(el).transform)).toBe('none');
});
test('touch disables magnetic, hover color and parallax effects',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});
  const link=page.locator('#cinemetrics .project-links a').first();await link.scrollIntoViewIfNeeded();await page.waitForTimeout(750);await page.touchscreen.tap(30,300);
  expect(await link.evaluate(el=>getComputedStyle(el).translate)).toBe('none');
  expect(await page.locator('#cinemetrics .screenshot-wrap img').evaluate(el=>getComputedStyle(el).transform)).toBe('none');
  await context.close();
});
test('project media parallax and color stay separate from text and preserve links',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});
  const media=page.locator('#cinemetrics .screenshot-wrap'),img=media.locator('img');await media.scrollIntoViewIfNeeded();await page.waitForTimeout(750);
  const filter=await img.evaluate(el=>getComputedStyle(el).filter);expect(filter).toBe('grayscale(0.8)');
  await media.hover();await page.waitForTimeout(450);expect(await img.evaluate(el=>Number(getComputedStyle(el).filter.match(/grayscale\(([^)]+)\)/)?.[1]))).toBeLessThan(.001);
  await expect(page.locator('#cinemetrics .project-links a').first()).toHaveAttribute('href','https://cine-metrics-theta.vercel.app/');
  await page.emulateMedia({reducedMotion:'reduce'});expect(await img.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
});
