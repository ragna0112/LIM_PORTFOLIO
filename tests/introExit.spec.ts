import {test,expect} from '@playwright/test';
import {sections} from '../src/sections';
for(const section of sections){
 test(`refreshing ${section.href} clears it, preserves query/history and exits the full intro at Home`,async({page})=>{
  await page.goto('/?campaign=keep');await page.getByRole('button',{name:'Skip intro'}).click();
  await page.locator(`.desktop-navigation a[href="${section.href}"]`).click();await expect(page).toHaveURL(new RegExp(`${section.href}$`));
  await page.addInitScript(()=>{(window as unknown as {__historyAtLoad:number}).__historyAtLoad=history.length;});await page.reload();
  await expect(page.locator('.intro-controls')).toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);expect(await page.evaluate(()=>history.scrollRestoration)).toBe('manual');await expect(page).toHaveURL(/\/\?campaign=keep$/);
  await expect(page.locator('.intro-controls')).toHaveCount(0,{timeout:9000});await expect.poll(()=>page.evaluate(()=>document.documentElement.style.overflow)).toBe('');
  expect(await page.evaluate(()=>scrollY)).toBe(0);expect(await page.evaluate(()=>location.hash)).toBe('');expect(await page.evaluate(()=>history.length)).toBe(await page.evaluate(()=>(window as unknown as {__historyAtLoad:number}).__historyAtLoad));expect(await page.evaluate(()=>history.scrollRestoration)).toBe('auto');
 });
}
for(const [name,width,height,reduced]of [['desktop-skip',1440,900,false],['mobile-skip',390,844,false],['desktop-reduced',1440,900,true],['mobile-reduced',390,844,true]]as const){
 test(`${name}: every stale section hash lands Home, releases scrolling and permits navigation`,async({page})=>{
  await page.setViewportSize({width,height});if(reduced)await page.emulateMedia({reducedMotion:'reduce'});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const section of sections){await page.goto(`/?from=${name}&entry=${section.id}${section.href}`);if(!reduced){await page.getByRole('button',{name:'Skip intro'}).click();await expect(page.locator('#home')).toBeFocused();}await expect.poll(()=>page.evaluate(()=>document.documentElement.style.overflow)).toBe('');expect(await page.evaluate(()=>scrollY)).toBe(0);expect(await page.evaluate(()=>location.hash)).toBe('');expect(await page.evaluate(()=>history.scrollRestoration)).toBe('auto');}
  await page.mouse.wheel(0,350);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0);
  if(width<=900)await page.getByRole('button',{name:'Open navigation menu'}).click();
  await page.locator(width<=900?'.mobile-navigation a[href="#work"]':'.desktop-navigation a[href="#work"]').click();await expect(page).toHaveURL(/#work$/);await expect(page.locator('#work')).toBeFocused();
  await page.locator('.navigation .logo').click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await expect.poll(()=>page.evaluate(()=>location.hash)).toBe('');expect(errors).toEqual([]);
 });
}
test('scroll and fragment restoration cannot move the document behind the intro',async({page})=>{
 await page.goto('/?guard=1#work');await expect(page.locator('.intro-controls')).toBeVisible();
 await page.evaluate(()=>{window.scrollTo({top:1800,behavior:'instant'});location.hash='credentials';});await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await expect(page).toHaveURL(/\/\?guard=1$/);
 const positions=await page.evaluate(()=>new Promise<number[]>(resolve=>{const positions:number[]=[];const sample=()=>{positions.push(scrollY);if(document.querySelector('.intro-controls'))requestAnimationFrame(sample);else requestAnimationFrame(()=>resolve([...positions,scrollY]));};sample();}));
 expect(Math.max(...positions)).toBe(0);expect(await page.evaluate(()=>document.documentElement.style.overflow)).toBe('');
});
test('exit fix preserves shared typography, timing and all unrelated source',async()=>{
 const {readFile}=await import('node:fs/promises'),{createHash}=await import('node:crypto');
 const files=JSON.parse(await readFile('verification/intro-exit/preserved-hashes.json','utf8'));for(const [path,hash]of Object.entries(files))expect(createHash('sha256').update(await readFile(path)).digest('hex')).toBe(hash);
});

test('refresh during an active intro does not retain manual restoration or a scroll lock',async({page})=>{
 await page.goto('/#about');await expect(page.locator('.intro-controls')).toBeVisible();expect(await page.evaluate(()=>history.scrollRestoration)).toBe('manual');await page.reload();await expect(page.locator('.intro-controls')).toBeVisible();await page.getByRole('button',{name:'Skip intro'}).click();await expect.poll(()=>page.evaluate(()=>history.scrollRestoration)).toBe('auto');expect(await page.evaluate(()=>scrollY)).toBe(0);expect(await page.evaluate(()=>location.hash)).toBe('');expect(await page.evaluate(()=>document.documentElement.style.overflow)).toBe('');
});
