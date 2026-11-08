import {test,expect} from '@playwright/test';
import {Constellation} from '../src/constellation';

for(const[name,width,height,count]of [['desktop',1440,900,96],['wide',1920,1080,96],['tablet',768,1024,60],['mobile',390,844,34]] as const){
  test(`${name}: autonomous constellation, no manual control, safe layering`,async({page})=>{
    await page.setViewportSize({width,height});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');await page.getByRole('button',{name:'Skip intro'}).click();await page.mouse.move(40,40);
    const canvas=page.locator('.portrait-canvas');await expect(canvas).toHaveAttribute('data-ready','true');
    await expect(canvas).toHaveAttribute('data-field-count',String(count));await page.waitForTimeout(550);
    expect(Number(await canvas.getAttribute('data-field-connections'))).toBeGreaterThan(0);
    await expect(page.locator('.navigation button:not(.menu-toggle),.motion-toggle')).toHaveCount(0);
    if(width>900)await expect(page.getByRole('navigation',{name:'Main navigation',exact:true})).toBeVisible();else await expect(page.getByRole('button',{name:'Open navigation menu'})).toBeVisible();
    const layers=await page.evaluate(()=>({canvas:getComputedStyle(document.querySelector('.portrait-layer')!).zIndex,content:getComputedStyle(document.querySelector('.hero-content')!).zIndex,pointer:getComputedStyle(document.querySelector('.hero-atmosphere')!).pointerEvents,portrait:getComputedStyle(document.querySelector('.portrait-layer')!).pointerEvents}));
    expect(Number(layers.canvas)).toBeLessThan(Number(layers.content));expect(layers.pointer).toBe('none');expect(layers.portrait).toBe('none');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    await page.screenshot({path:`verification/constellation/${name}-idle.png`});expect(errors).toEqual([]);
  });
}
test('cursor forces and extra connections fade out; portrait interaction stays independent',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');await page.getByRole('button',{name:'Skip intro'}).click();
  const canvas=page.locator('.portrait-canvas');await expect(canvas).toHaveAttribute('data-ready','true');
  await page.mouse.move(600,350);await page.waitForTimeout(1000);
  expect(Number(await canvas.getAttribute('data-field-near-connections'))).toBeGreaterThan(0);
  expect(Number(await canvas.getAttribute('data-field-offset'))).toBeGreaterThan(.1);
  await expect(canvas).toHaveAttribute('data-interacting','false');
  await page.screenshot({path:'verification/constellation/desktop-cursor.png'});
  await page.mouse.move(1100,320);await expect(canvas).toHaveAttribute('data-interacting','true');
  await page.mouse.move(40,40);await expect(canvas).toHaveAttribute('data-interacting','false');await page.waitForTimeout(1800);
  expect(Number(await canvas.getAttribute('data-field-near-connections'))).toBe(0);
  expect(Number(await canvas.getAttribute('data-field-offset'))).toBeLessThan(.5);
});
test('touch keeps autonomous connections without pointer forces',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/');await page.getByRole('button',{name:'Skip intro'}).click();const canvas=page.locator('.portrait-canvas');await expect(canvas).toHaveAttribute('data-ready','true');
  await page.touchscreen.tap(200,300);await page.waitForTimeout(700);
  expect(Number(await canvas.getAttribute('data-field-connections'))).toBeGreaterThan(0);expect(Number(await canvas.getAttribute('data-field-offset'))).toBe(0);
  expect(await page.locator('.atmosphere-cursor').evaluate(el=>getComputedStyle(el).display)).toBe('none');await context.close();
});
test('reduced motion paints a static constellation with no replacement control',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.waitForTimeout(400);
  const canvas=page.locator('.constellation-static');await expect(canvas).toBeVisible();
  expect(Number(await canvas.getAttribute('data-field-connections'))).toBeGreaterThan(0);
  const before=await canvas.evaluate(el=>(el as HTMLCanvasElement).toDataURL());await page.mouse.move(500,350);await page.waitForTimeout(300);
  expect(await canvas.evaluate(el=>(el as HTMLCanvasElement).toDataURL())).toBe(before);
  await expect(page.locator('.navigation button:not(.menu-toggle)')).toHaveCount(0);await expect(page.locator('.portrait-canvas')).toHaveCount(0);
  await expect(page.locator('.atmosphere-sweep')).toBeHidden();await expect(page.locator('.atmosphere-cursor')).toBeHidden();
  await page.screenshot({path:'verification/constellation/reduced-motion.png'});
});
test('bounded spatial search, gradual force return and adaptive density',()=>{
  const ctx={beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){}} as unknown as CanvasRenderingContext2D;
  const field=new Constellation();field.resize(1440,900);field.draw(ctx,0,null,true);
  expect(field.metrics.comparisons).toBeLessThan(96*95/2);expect(field.metrics.connections).toBeGreaterThan(0);
  for(let i=0;i<120;i++)field.draw(ctx,1/60,{x:600,y:350,active:true});
  expect(field.metrics.maxOffset).toBeGreaterThan(.1);
  for(let i=0;i<240;i++)field.draw(ctx,1/60,{x:600,y:350,active:false});
  expect(field.metrics.maxOffset).toBeLessThan(.05);
  for(let i=0;i<100;i++)field.observeFrame(45,80);
  expect(field.metrics.count).toBeLessThan(96);expect(field.metrics.count).toBeGreaterThanOrEqual(70);expect(field.metrics.quality).toBe('reduced');
  const ys:number[]=[];ctx.arc=(_x:number,y:number)=>{ys.push(y);};field.draw(ctx,0,null,true);
  expect(Math.max(...ys)).toBeGreaterThan(900*.85);
});
test('one portrait RAF, clean suspension/disposal, and restrained periodic sweep',async({page})=>{
  await page.addInitScript(()=>{
    const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
    const pending=new Map<number,FrameRequestCallback>(),owners=new Set<FrameRequestCallback>();
    let current:FrameRequestCallback|null=null;
    const metrics={pending:0,max:0,frames:0};
    const recount=()=>{metrics.pending=[...pending.values()].filter(callback=>owners.has(callback)).length;metrics.max=Math.max(metrics.max,metrics.pending);};
    (window as unknown as {__portraitRAF:typeof metrics}).__portraitRAF=metrics;
    const original=HTMLCanvasElement.prototype.getContext;
    const tracked=new WeakSet<object>();
    HTMLCanvasElement.prototype.getContext=function(...args:unknown[]){
      const context=Reflect.apply(original,this,args);
      if(context&&typeof context.clearRect==='function'&&!tracked.has(context)){
        tracked.add(context);const clear=context.clearRect.bind(context);
        context.clearRect=(...rect:number[])=>{
          if(current&&this.classList.contains('portrait-canvas')){owners.add(current);metrics.frames++;recount();}
          clear(...rect);
        };
      }
      return context;
    } as typeof original;
    window.requestAnimationFrame=callback=>{
      const id=request(time=>{pending.delete(id);recount();const previous=current;current=callback;try{callback(time);}finally{current=previous;}});
      pending.set(id,callback);recount();return id;
    };
    window.cancelAnimationFrame=id=>{pending.delete(id);recount();cancel(id);};
  });
  const errors:string[]=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto('/');await page.getByRole('button',{name:'Skip intro'}).click();await expect(page.locator('.portrait-canvas')).toHaveAttribute('data-ready','true');
  await page.waitForTimeout(300);
  let stats=await page.evaluate(()=>(window as unknown as {__portraitRAF:{pending:number;max:number;frames:number}}).__portraitRAF);
  expect(stats.max).toBe(1);expect(stats.frames).toBeGreaterThan(0);
  const sweep=page.locator('.atmosphere-sweep');
  expect(await sweep.evaluate(el=>getComputedStyle(el).animationDuration)).toBe('13s');
  expect(await sweep.evaluate(el=>getComputedStyle(el).backgroundImage)).not.toBe('none');
  await sweep.evaluate(el=>{for(const animation of el.getAnimations())animation.currentTime=11000;});
  await page.screenshot({path:'verification/constellation/silver-sweep.png'});
  await page.locator('#work').scrollIntoViewIfNeeded();await expect(page.locator('.hero')).toHaveAttribute('data-atmosphere','paused');
  stats=await page.evaluate(()=>(window as unknown as {__portraitRAF:{pending:number;max:number;frames:number}}).__portraitRAF);expect(stats.pending).toBe(0);
  await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.constellation-static')).toBeVisible();await page.waitForTimeout(200);
  stats=await page.evaluate(()=>(window as unknown as {__portraitRAF:{pending:number;max:number;frames:number}}).__portraitRAF);expect(stats.pending).toBe(0);
  expect(errors).toEqual([]);
});
