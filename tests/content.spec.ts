import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { profile,projects } from '../src/projects';

test('student profile, project order, exact URLs and safe external links',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await expect(page.locator('.hero-role')).toHaveText('Computer Science Student · Software Engineering');
  await expect(page.locator('.hero-bottom>p')).toHaveText(profile.heroDescription);
  await expect(page.locator('.about-copy')).toContainText(profile.aboutDescription);
  await expect(page.locator('.project-copy h3')).toHaveText(['CineMetrics','PanahonPH','QuakePH','LAMS DocuFlow']);
  const urls=['https://cine-metrics-theta.vercel.app/','https://panahon-ph-henna.vercel.app/','https://quakeph.vercel.app/','https://lamsdocuflow.com/'];
  for(const [i,p] of projects.entries()){
    const project=page.locator(`#${p.id}`);
    await expect(project.locator('.project-links a').first()).toHaveAttribute('href',urls[i]);
    await expect(project.locator('h3 a')).toHaveAttribute('href',urls[i]);
    for(const a of await project.locator('a').all()){
      await expect(a).toHaveAttribute('target','_blank');
      await expect(a).toHaveAttribute('rel','noopener noreferrer');
      expect(await a.getAttribute('href')).toMatch(/^https:\/\//);
    }
  }
  await expect(page.locator('#lams-docuflow').getByRole('link',{name:/GitHub/})).toHaveCount(0);
  await expect(page.locator('#lams-docuflow').getByRole('link',{name:/Visit Website/})).toBeVisible();
  await expect(page.locator('#lams-docuflow .project-credit')).toHaveText('Developed as part of a collaborative Software Engineering thesis project.');
  expect(projects[3].contribution).toBeNull();
  expect(projects[3].tags).toEqual(['Python','Flask','JavaScript','HTML','CSS','MySQL','SQLAlchemy','Docker','Nginx','GitHub']);
  await page.locator('#lams-docuflow summary').click();
  await expect(page.locator('#lams-docuflow details')).toContainText('waiting time, and priority payment');
  expect(await page.locator('#lams-docuflow details li').count()).toBe(11);
  const text=await page.locator('main').innerText();
  expect(text).not.toMatch(/data engineering student|professional software engineer|not published|offline|temporarily unavailable/i);
  await expect(page.getByRole('button',{name:/replay/i})).toHaveCount(0);
});
for(const [name,width,height]of [['desktop',1440,1000],['tablet',768,1024],['mobile',390,844]] as const){
  test(`${name}: DocuFlow gallery, enlarged screenshots, zoom and keyboard close`,async({page})=>{
    await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const project=page.locator('#lams-docuflow');await project.scrollIntoViewIfNeeded();
    const image=project.locator('.gallery-preview>img');
    await expect(image).toHaveAttribute('alt','LAMS DocuFlow student dashboard showing document request progress and recent requests.');
    await image.evaluate(async(img:HTMLImageElement)=>img.decode());
    await page.screenshot({path:`verification/docuflow-${name}.png`});
    const enlarge=project.getByRole('button',{name:/Enlarge LAMS/});await enlarge.click();
    const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('img')).toHaveAttribute('src','/images/lams-docuflow-student-dashboard.webp');
    await dialog.getByRole('button',{name:'Next screenshot'}).click();
    await expect(dialog.getByRole('img')).toHaveAttribute('alt','LAMS DocuFlow administrator queue showing ranked document requests and priority controls.');
    await dialog.getByRole('img').evaluate(async(img:HTMLImageElement)=>img.decode());
    await page.screenshot({path:`verification/docuflow-${name}-enlarged.png`});
    if(width<650)expect(await dialog.locator('.lightbox-scroll').evaluate(el=>el.scrollWidth>el.clientWidth)).toBeTruthy();
    else await dialog.getByRole('button',{name:'View actual size'}).click();
    await expect(dialog.getByRole('button',{name:'Fit image'})).toHaveAttribute('aria-pressed','true');
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
    await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();await expect(enlarge).toBeFocused();
    await project.getByRole('button',{name:'02 Administrator live queue'}).click();
    await expect(image).toHaveAttribute('src','/images/lams-docuflow-admin-queue.webp');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  });
}
