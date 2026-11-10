import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {navigationSections as sections,sectionEyebrow} from '../src/sections';
async function ready(page:Page,reduced=true){if(reduced)await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');if(!reduced)await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});await page.evaluate(()=>document.fonts.ready);}
async function positioned(page:Page,id:string){
 await expect.poll(async()=>{const rect=await page.locator(`#${id}`).boundingBox(),header=await page.locator('.navigation').boundingBox();const maxScroll=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight),scroll=await page.evaluate(()=>scrollY);return Math.abs(rect!.y-Math.max(header!.height+14,rect!.y+scroll-maxScroll));},{timeout:4000}).toBeLessThan(3);
 const heading=await page.locator(`#${id} h2`).boundingBox(),header=await page.locator('.navigation').boundingBox();expect(heading!.y).toBeGreaterThanOrEqual(header!.height);
}
test('central numbering, right-aligned desktop links, heading targets, active state and unchanged project numbering',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await ready(page);const nav=page.locator('.desktop-navigation');
 expect(sections.map(s=>s.number)).toEqual(['01','02','03','04','06']);await expect(nav.locator('a')).toHaveText(['Work01','About02','Credentials03','Experience04','Contact06']);
 for(const section of sections){await expect(page.locator(`#${section.id} .eyebrow`).first()).toHaveText(sectionEyebrow(section.id));await expect(nav.locator(`a[href="${section.href}"] .section-number`)).toHaveText(section.number);}
 await expect(page.locator('.cap-intro .eyebrow')).toHaveText('WHAT I BRING');await expect(page.locator('.project-top>.mono:first-child')).toHaveText(['/01','/02','/03','/04']);
 const geometry=await page.evaluate(()=>{const header=document.querySelector('.navigation')!,nav=document.querySelector('.desktop-navigation')!,logo=header.querySelector('.logo')!;return {right:nav.getBoundingClientRect().right,pad:parseFloat(getComputedStyle(header).paddingRight),width:innerWidth,logo:logo.getBoundingClientRect().left,left:parseFloat(getComputedStyle(header).paddingLeft)};});expect(Math.abs(geometry.right-(geometry.width-geometry.pad))).toBeLessThan(2);expect(Math.abs(geometry.logo-geometry.left)).toBeLessThan(1);
 for(const section of sections){await nav.locator(`a[href="${section.href}"]`).click();await expect(page).toHaveURL(new RegExp(`${section.href}$`));await positioned(page,section.id);await expect(nav.locator(`a[href="${section.href}"]`)).toHaveAttribute('aria-current','location');await expect(page.locator(`#${section.id}`)).toBeFocused();}
 await nav.locator('a[href="#work"]').click();await positioned(page,'work');await page.locator('#about').evaluate(el=>el.scrollIntoView({behavior:'instant'}));await expect(nav.locator('a[href="#about"]')).toHaveAttribute('aria-current','location');await expect(page).toHaveURL(/#work$/);
 await page.locator('.navigation .logo').click();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await expect.poll(()=>page.evaluate(()=>location.hash)).toBe('');await expect(nav.locator('[aria-current]')).toHaveCount(0);
 await page.screenshot({path:'verification/navigation/desktop-header.png'});
 expect(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.length===new Set(ids).size;})).toBe(true);
});
for(const section of sections){
 test(`stale ${section.href} clears on direct load and refresh; later navigation still works`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`/?source=portfolio${section.href}`);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await expect(page).toHaveURL(/\/\?source=portfolio$/);await expect.poll(()=>page.evaluate(()=>history.scrollRestoration)).toBe('auto');
  await page.locator('.desktop-navigation').locator(`a[href="${section.href}"]`).click();await positioned(page,section.id);await expect(page).toHaveURL(new RegExp(`${section.href}$`));
  await page.reload();await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await expect(page).toHaveURL(/\/\?source=portfolio$/);
 });
}
test('normal intro ignores the stale hash, finishes at Hero and clears it again on refresh',async({page})=>{
 test.setTimeout(25000);await page.goto('/?source=intro#credentials');await expect(page.locator('.intro-running')).toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);await expect(page).toHaveURL(/\/\?source=intro$/);await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:9000});await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
 await page.locator('.desktop-navigation a[href="#work"]').click();await positioned(page,'work');await page.reload();await expect(page.locator('.intro-running')).toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);await expect(page).toHaveURL(/\/\?source=intro$/);expect(await page.evaluate(()=>scrollY)).toBe(0);
});
for(const[name,width,height]of [['tablet',768,1024],['mobile',390,844],['small-mobile',320,740],['zoom-200',720,450]]as const){
 test(`${name}: compact menu, numbered links, native containment, Escape, scroll/focus restore and selection`,async({page})=>{
  await page.setViewportSize({width,height});await ready(page);await expect(page.locator('.navigation .logo')).toBeVisible();await expect(page.locator('.desktop-navigation')).toBeHidden();const trigger=page.getByRole('button',{name:'Open navigation menu',exact:true});await expect(trigger).toBeVisible();
  await page.evaluate(()=>scrollTo({top:1000,behavior:'instant'}));await trigger.evaluate(el=>(el as HTMLElement).focus({preventScroll:true}));const y=await page.evaluate(()=>scrollY);await page.keyboard.press('Enter');const menu=page.getByRole('dialog',{name:'Navigation menu',exact:true});await expect(menu).toBeVisible();expect(await page.evaluate(()=>document.body.style.position)).toBe('fixed');await expect(page.getByRole('button',{name:'Close navigation menu'})).toBeFocused();
  await expect(menu.locator('nav a')).toHaveText(['01Work','02About','03Credentials','04Experience','06Contact']);await page.keyboard.press('Shift+Tab');await expect(menu.locator('nav a').last()).toBeFocused();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close navigation menu'})).toBeFocused();await page.screenshot({path:`verification/navigation/${name}-menu.png`});
  const violations=(await new AxeBuilder({page}).include('.mobile-navigation').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;expect(violations.map(v=>v.id)).toEqual([]);expect(await menu.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');await expect(menu).toHaveCount(0);await expect(trigger).toBeFocused();expect(await page.evaluate(()=>scrollY)).toBe(y);expect(await page.evaluate(()=>document.body.style.position)).toBe('');
  for(const section of sections){await trigger.click();await page.locator('.mobile-navigation').locator(`a[href="${section.href}"]`).click();await expect(menu).toHaveCount(0);await expect(page).toHaveURL(new RegExp(`${section.href}$`));await positioned(page,section.id);await expect(page.locator(`#${section.id}`)).toBeFocused();expect(await page.evaluate(()=>document.body.style.position)).toBe('');}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await trigger.click();await page.getByRole('button',{name:'Close navigation menu'}).click();await expect(trigger).toBeFocused();
 });
}
test('back/forward hash navigation, mobile-to-desktop cleanup and cursor exclusion',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await ready(page,false);const nav=page.locator('.desktop-navigation');await nav.locator('a[href="#about"]').click();await positioned(page,'about');await nav.locator('a[href="#experience"]').click();await positioned(page,'experience');await page.goBack();await positioned(page,'about');await page.goForward();await positioned(page,'experience');
 const link=nav.locator('a[href="#credentials"]');await link.hover();await expect(page.locator('.cursor')).toHaveCSS('visibility','hidden');expect(await link.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('a')===el;})).toBe(true);
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open navigation menu'}).click();await page.setViewportSize({width:1440,height:900});await expect(page.locator('.mobile-navigation')).toHaveCount(0);expect(await page.evaluate(()=>document.body.style.position)).toBe('');await expect(nav).toBeVisible();
});
