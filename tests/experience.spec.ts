import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {experience,profile} from '../src/projects';
import {sections,navigationSections} from '../src/sections';
const digest=(data:Buffer)=>createHash('sha256').update(data).digest('hex');
test('verified experience configuration, updated resume bytes and unrelated features preserved',async({request})=>{
 expect(experience.map(({title,organization,dates,category})=>[title,organization,dates,category])).toEqual([
  ['Machine Learning Engineering Intern','FlyRank','July 2026 – Present','Internship'],
  ['DataCamp Scholar','Data Engineer Pilipinas','July 2026 – Present','Scholarship / Learning Experience'],
 ]);
 expect(sections.map(s=>s.number)).toEqual(['01','02','03','04',null,'05']);expect(navigationSections.map(s=>s.label)).toEqual(['Work','About','Credentials','Experience','Contact']);
 const original=await readFile('/Users/rich/Downloads/Rich Daniel A. Lim - Briefcase.pdf'),local=await readFile('public/documents/Rich-Daniel-Lim-Resume.pdf');expect(digest(local)).toBe(digest(original));expect(digest(await (await request.get('/documents/Rich-Daniel-Lim-Resume.pdf')).body())).toBe(digest(original));
 const manifest=JSON.parse(await readFile('source-assets/credentials/manifest.json','utf8'));expect(manifest.resume.sha256).toBe(digest(original));expect(manifest.resume.pages).toBe(1);
 const hashes=JSON.parse(await readFile('verification/experience/preserved-hashes.json','utf8'));for(const [file,hash]of Object.entries(hashes))expect(digest(await readFile(file)),file).toBe(hash);
});
for(const [name,width,height,reduced]of [['desktop',1440,900,false],['wide',1920,1080,true],['tablet',768,1024,true],['mobile',390,844,true],['small-mobile',320,740,true]]as const)test(`${name}: hero cleanup, experience rows, navigation state and responsive accessibility`,async({page})=>{
 await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');if(!reduced)await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});await expect(page.locator('.intro-running')).toHaveCount(0);await page.evaluate(()=>document.fonts.ready);
 const hero=page.locator('#home');await expect(hero.locator('.hero-top')).toContainText('BASED IN THE PHILIPPINES');expect((await hero.innerText()).match(/BASED IN THE PHILIPPINES/g)).toHaveLength(1);expect((await hero.innerText()).match(/Computer Science Student/g)).toHaveLength(1);expect((await hero.innerText()).match(/Software Engineering/g)).toHaveLength(1);await expect(hero.locator('.hero-kicker')).toHaveCount(0);await expect(hero.locator('.hero-role')).toHaveText('Computer Science Student · Software Engineering');await expect(hero.locator('.hero-bottom>p')).toHaveText(profile.heroDescription);
 await page.screenshot({path:`verification/experience/${name}-hero.png`});
 expect(await page.locator('main>section[id]').evaluateAll(els=>els.map(el=>el.id))).toEqual(['home','work','about','credentials','experience','game','contact']);
 const mobile=width<=900;if(mobile)await page.getByRole('button',{name:'Open navigation menu'}).click();const nav=page.getByRole('navigation',{name:mobile?'Mobile navigation':'Main navigation',exact:true});await expect(nav.getByRole('link')).toHaveCount(5);await expect(nav.locator('a[href="#game"]')).toHaveCount(0);await nav.getByRole('link',{name:/Experience/}).click();
 await expect(page).toHaveURL(/#experience$/);await expect(page.locator('#experience')).toBeFocused();await expect.poll(async()=>Math.round((await page.locator('#experience').boundingBox())!.y)).toBe(width<=650?86:100);
 await expect(page.locator('#experience .experience-entry')).toHaveCount(2);await expect(page.locator('#experience h3')).toHaveText(experience.map(e=>e.title));await expect(page.locator('#experience .experience-organization')).toHaveText(experience.map(e=>e.organization));await expect(page.locator('#experience time')).toHaveText(experience.map(e=>e.dates));await expect(page.locator('#experience .experience-category')).toHaveText(experience.map(e=>e.category));await expect(page.locator('#experience p')).toHaveCount(0);
 await expect(page.locator('#experience .eyebrow')).toHaveText('EXPERIENCE / 04');await expect(page.locator('#game .eyebrow')).toHaveText('INTERACTIVE');await expect(page.locator('#contact .eyebrow')).toHaveText('CONTACT / 05');
 await expect(page.locator('.desktop-navigation a[href="#experience"]')).toHaveAttribute('aria-current','location');await page.locator('#experience').screenshot({path:`verification/experience/${name}-section.png`});expect((await new AxeBuilder({page}).include('#experience').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.locator('#game').evaluate(el=>el.scrollIntoView({behavior:'instant'}));await expect(page.locator('.desktop-navigation [aria-current]')).toHaveCount(0);await expect(page.getByRole('button',{name:'Start Game',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);
});
