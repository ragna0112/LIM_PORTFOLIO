import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import {credentials,resume} from '../src/projects';
const digest=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
async function visit(page:Page,reduced=true){if(reduced)await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');if(!reduced)await page.getByRole('button',{name:'Skip intro'}).click();await page.locator('#credentials').scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);}

test('exact five selected credentials, correct source mapping, preserved files and production assets',async({page,request})=>{
 await visit(page);
 expect(await page.locator('#credentials').evaluate(el=>[el.previousElementSibling?.id,el.nextElementSibling?.id])).toEqual(['about','game']);
 expect(await page.locator('#game').evaluate(el=>el.nextElementSibling?.id)).toBe('contact');
 await expect(page.locator('.credential-row')).toHaveCount(5);
 const expected=[
  ['Associate Data Engineer in SQL — Track Completion','DataCamp','August 11, 2026','ADESQLCERTLIM.pdf'],
  ['AI Fluency: Framework & Foundations','Anthropic','July 24, 2026','LIM_AI Fluency Certificate.pdf'],
  ['SAP Certified Associate – Generative AI Developer','SAP SE','July 14, 2026','LIM_SAPCERT_GENERATIVE_AI.jpg'],
  ['PMI Project Management Ready','Project Management Institute','March 4, 2026','Cert41733128407.pdf'],
  ['Information Technology Specialist – Python','Certiport','July 16, 2025','PythonCERTLIIM.pdf'],
 ];
 const manifest=JSON.parse(await readFile('source-assets/credentials/manifest.json','utf8'));
 for(const [i,credential]of credentials.entries()){
  const row=page.locator('.credential-row').nth(i);await expect(row.locator('h3')).toHaveText(expected[i][0]);await expect(row.locator('.credential-issuer')).toHaveText(expected[i][1]);await expect(row.locator('time')).toHaveText(expected[i][2]);await expect(row.locator('time')).toHaveAttribute('datetime',credential.issuedOn);
  const proof=credential.certificate;await expect(row.locator('img')).toHaveAttribute('alt',proof.alt);await expect(row.locator('img')).toHaveAttribute('loading','lazy');expect(proof.alt).toContain(credential.title);expect(proof.alt).toContain(credential.issuer);
  const source=manifest.certificates[i];expect(source.source).toBe(expected[i][3]);expect(digest(await readFile(`/Users/rich/Downloads/${source.source}`))).toBe(source.sha256);expect(digest(await readFile(`source-assets/credentials/${source.source}`))).toBe(source.sha256);
  for(const asset of [proof.src,proof.previewSrc]){const response=await request.get(asset);expect(response.ok()).toBeTruthy();expect(response.headers()['content-type']).toContain('image/webp');expect(digest(await response.body())).toBe(digest(await readFile(`public${asset}`)));}
 }
 const region=await page.locator('#credentials').innerText();expect(region).not.toMatch(/LinkedIn Learning|Kotlin|Postman|Visual Studio Code|FlyRank|Scholar|score|grade|credential ID|expires|verify credential/i);
 await expect(page.locator('#credentials a[href^="http"]')).toHaveCount(0);
 const bytes=await readFile('public/documents/Rich-Daniel-Lim-Resume.pdf');expect(digest(bytes)).toBe(digest(await readFile('/Users/rich/Downloads/Rich Daniel A. Lim - Briefcase.pdf')));expect(digest(bytes)).toBe(manifest.resume.sha256);
 const response=await request.get(resume.url);expect(response.headers()['content-type']).toContain('application/pdf');expect(digest(await response.body())).toBe(digest(bytes));expect(bytes.subarray(0,4).toString()).toBe('%PDF');
 const preserved=JSON.parse(await readFile('verification/game-position/preserved-hashes.json','utf8'));for(const [path,hash]of Object.entries(preserved))expect(digest(await readFile(path))).toBe(hash);
 for(const name of await readdir('dist/assets'))if(name.endsWith('.js'))expect(await readFile(`dist/assets/${name}`,'utf8')).not.toContain('/Users/rich/');
 await expect(page.locator('.desktop-navigation a')).toHaveCount(5);await expect(page.locator('.navigation button:not(.menu-toggle)')).toHaveCount(0);
});

test('all ten certificate triggers open the matching complete proof; close/focus/scroll are restored',async({page})=>{
 await visit(page);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 for(const credential of credentials){
  const row=page.locator(`[data-credential="${credential.id}"]`);
  for(const [i,selector]of ['.credential-preview','.credential-action'].entries()){
   const trigger=row.locator(selector);await trigger.scrollIntoViewIfNeeded();await trigger.focus();const y=await page.evaluate(()=>scrollY);await page.keyboard.press('Enter');
   const modal=page.getByRole('dialog',{name:credential.title,exact:true});await expect(modal).toBeVisible();await expect(page.locator('.certificate-lightbox[open]')).toHaveCount(1);await expect(modal.locator('img')).toHaveAttribute('src',credential.certificate.src);await expect(modal.locator('img')).toHaveAttribute('alt',credential.certificate.alt);
   await modal.locator('img').evaluate((image:HTMLImageElement)=>image.decode());const proportions=await modal.locator('img').evaluate((image:HTMLImageElement)=>({width:image.clientWidth,height:image.clientHeight,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight}));expect(Math.abs(proportions.width/proportions.height-proportions.naturalWidth/proportions.naturalHeight)).toBeLessThan(.02);
   expect(await page.evaluate(()=>document.body.style.position)).toBe('fixed');await expect(page.getByRole('button',{name:'Close certificate',exact:true})).toBeFocused();
   // Native modal focus containment: backwards from Close wraps to Zoom, then back to Close.
   await page.keyboard.press('Shift+Tab');await expect(page.getByRole('button',{name:'Zoom in',exact:true})).toBeFocused();await page.keyboard.press('Tab');await expect(page.getByRole('button',{name:'Close certificate',exact:true})).toBeFocused();
   if(i===0)await page.keyboard.press('Escape');else await page.getByRole('button',{name:'Close certificate',exact:true}).click();
   await expect(modal).toHaveCount(0);await expect(trigger).toBeFocused();expect(await page.evaluate(()=>scrollY)).toBe(y);expect(await page.evaluate(()=>document.body.style.position)).toBe('');
  }
 }
 expect(errors).toEqual([]);
});

for(const[name,width,height]of [['desktop',1440,900],['wide',1920,1080],['tablet',768,1024],['mobile',390,844],['small-mobile',320,740]]as const){
 test(`${name}: editorial rows, full image fit/zoom, backdrop close and accessibility`,async({page})=>{
  await page.setViewportSize({width,height});await visit(page);await page.locator('#credentials').screenshot({path:`verification/credentials/${name}-section.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const trigger=page.locator('.credential-preview').nth(2);await trigger.click();const modal=page.locator('.certificate-lightbox');await modal.locator('img').evaluate((image:HTMLImageElement)=>image.decode());await page.screenshot({path:`verification/credentials/${name}-certificate.png`});
  const fit=await modal.locator('img').boundingBox(),frame=await modal.locator('.certificate-viewer').boundingBox();expect(fit!.width).toBeLessThanOrEqual(frame!.width+1);expect(fit!.height).toBeLessThanOrEqual(frame!.height+1);
  const violations=(await new AxeBuilder({page}).include('.certificate-lightbox').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;expect(violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(page.getByRole('button',{name:'Fit certificate',exact:true})).toHaveAttribute('aria-pressed','true');expect(await modal.locator('img').evaluate(image=>image.clientWidth)).toBe(1024);expect(await modal.locator('.certificate-viewer').evaluate(el=>['manipulation','pan-x pan-y pinch-zoom'].includes(getComputedStyle(el).touchAction))).toBe(true);
  await page.getByRole('button',{name:'Fit certificate',exact:true}).click();await page.mouse.click(2,2);await expect(modal).toHaveCount(0);await expect(trigger).toBeFocused();
  const sectionViolations=(await new AxeBuilder({page}).include('#credentials').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;expect(sectionViolations.map(v=>v.id)).toEqual([]);
 });
}

test('resume view actions use safe new tabs; contact/footer downloads retain the exact PDF filename',async({page})=>{
 await visit(page);for(const region of ['#about','#contact','footer']){
  const scope=page.locator(region),link=scope.getByRole('link',{name:resume.accessibleLabel,exact:true});await expect(link).toHaveAttribute('href',resume.url);await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noopener noreferrer');
 }
 const about=page.locator('#about').getByRole('link',{name:resume.accessibleLabel,exact:true});await expect(about).toHaveText('View Full Resume');
 // Headless Chromium does not render its PDF viewer. Assert the new context and real PDF navigation request; bytes are checked above.
 const popupPromise=page.waitForEvent('popup'),requestPromise=page.context().waitForEvent('request',{predicate:request=>request.isNavigationRequest()&&request.url().endsWith(resume.url)});await about.click();const popup=await popupPromise;expect((await requestPromise).url()).toContain(resume.url);await popup.close();
 for(const region of ['#contact','footer']){
  const link=page.locator(region).getByRole('link',{name:'Download Rich Daniel Lim’s resume PDF',exact:true});await expect(link).toHaveAttribute('download',resume.filename);const promise=page.waitForEvent('download');await link.click();const download=await promise;expect(download.suggestedFilename()).toBe(resume.filename);expect(digest(await readFile((await download.path())!))).toBe(digest(await readFile(`public${resume.url}`)));
 }
});

test('200 percent zoom equivalent and reduced motion keep all credential controls readable',async({browser})=>{
 const context=await browser.newContext({viewport:{width:720,height:450},deviceScaleFactor:2,reducedMotion:'reduce'});const page=await context.newPage();await visit(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 for(const row of await page.locator('.credential-row').all()){expect(await row.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);expect(await row.evaluate(el=>getComputedStyle(el).opacity)).toBe('1');expect(await row.evaluate(el=>getComputedStyle(el).transform)).toBe('none');}
 const button=page.locator('.credential-action').first();await button.focus();await page.keyboard.press('Enter');await expect(page.getByRole('button',{name:'Close certificate',exact:true})).toBeFocused();await page.keyboard.press('Escape');await expect(button).toBeFocused();await page.locator('#credentials').screenshot({path:'verification/credentials/zoom-200.png'});await context.close();
});

test('row entrances settle once; keyboard focus reveals rows without requiring hover',async({page})=>{
 await visit(page,false);const row=page.locator('.credential-row').first();await row.scrollIntoViewIfNeeded();await expect(row).toHaveCSS('opacity','1');await page.locator('#home').scrollIntoViewIfNeeded();await page.locator('#credentials').scrollIntoViewIfNeeded();await expect(row).toHaveCSS('opacity','1');
 const action=row.locator('.credential-action');await action.focus();await expect(action).toBeFocused();await expect(row).toHaveCSS('transform','none');
});
