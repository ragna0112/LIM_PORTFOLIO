import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {GameModel} from '../src/playground/gameModel';
import {GAME_LETTERS} from '../src/playground/gameConfig';
import {projects} from '../src/projects';
type Snapshot={phase:string;active:boolean;near:boolean;collected:number;player:{x:number;y:number};target:{x:number;y:number}|null;obstacles:{x:number;y:number;width:number;height:number}[];width:number;height:number};
const state=(page:Page)=>page.locator('.playground-canvas').evaluate(c=>JSON.parse((c as HTMLCanvasElement).dataset.gameState!) as Snapshot);
async function openGame(page:Page){await page.goto('/');await expect(page.locator('.intro-running')).toHaveCount(0,{timeout:11000});await page.locator('#game').scrollIntoViewIfNeeded();await expect(page.getByRole('button',{name:'Start Game',exact:true})).toBeVisible();await expect.poll(async()=>(await state(page)).near).toBe(true);}

test('model: boundaries, obstacles, acceleration, ordered collection and verified skills',()=>{
 const model=new GameModel();model.resize(1000,620);model.start();
 const future=model.targets[3];model.player={...future,vx:0,vy:0};expect(model.step(.016)).toBeNull();expect(model.collected).toBe(0);
 model.player={x:20,y:20,vx:0,vy:0};model.keys.add('left');for(let i=0;i<100;i++)model.step(.016);expect(model.player.x).toBeGreaterThanOrEqual(13);
 model.keys.clear();const block=model.obstacles[0];model.player={x:block.x-20,y:block.y+block.height/2,vx:0,vy:0};model.keys.add('right');for(let i=0;i<100;i++)model.step(.016);expect(model.player.x).toBeLessThanOrEqual(block.x-8);
 model.reset();model.start();model.keys.add('right');model.step(.016);expect(model.player.vx).toBeGreaterThan(0);expect(model.player.vx).toBeLessThan(model.speed);model.keys.clear();const speed=model.player.vx;model.step(.016);expect(model.player.vx).toBeLessThan(speed);
 for(let i=0;i<10;i++){model.keys.clear();model.player={...model.targets[i],vx:0,vy:0};expect(model.step(.016)).toBe(i);}
 expect(model.phase).toBe('complete');const x=model.player.x;model.keys.add('right');model.step(1);expect(model.player.x).toBe(x);model.reset();expect(model.collected).toBe(0);expect(model.phase).toBe('ready');
 const verified=new Set(projects.flatMap(p=>p.tags));expect(GAME_LETTERS.every(item=>verified.has(item.skill))).toBeTruthy();expect(GAME_LETTERS.map(item=>item.letter).join('')).toBe('HELLOWORLD');
});
test('embedded after Experience and before Contact with preserved game anchor, no modal or scroll lock; scoped keyboard, Stop, Resume and Restart',async({page})=>{
 await openGame(page);
 expect(await page.locator('#game').evaluate(el=>[el.previousElementSibling?.id,el.nextElementSibling?.id])).toEqual(['experience','contact']);
 expect(await page.locator('main>section[id]').evaluateAll(elements=>elements.map(el=>el.id))).toEqual(['home','work','about','credentials','experience','game','contact']);
 await expect(page.locator('nav').getByText('Playground')).toHaveCount(0);await expect(page.locator('#game dialog,dialog[open]')).toHaveCount(0);
 expect(await page.evaluate(()=>document.body.style.position)).toBe('');
 const start=page.getByRole('button',{name:'Start Game',exact:true});await start.focus();let y=await page.evaluate(()=>scrollY);await page.keyboard.press('ArrowDown');await page.waitForTimeout(350);expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(y);expect((await state(page)).phase).toBe('ready');
 await start.click();await expect(page.locator('.game-arena')).toBeFocused();const before=await state(page);y=await page.evaluate(()=>scrollY);await page.keyboard.down('ArrowDown');await page.waitForTimeout(200);await page.keyboard.up('ArrowDown');expect((await state(page)).player.y).toBeGreaterThan(before.player.y);expect(await page.evaluate(()=>scrollY)).toBe(y);
 await page.getByRole('button',{name:'Stop',exact:true}).click();await expect(page.getByRole('button',{name:'Resume Game',exact:true})).toBeFocused();expect((await state(page)).active).toBe(false);
 await page.getByRole('button',{name:'Resume Game',exact:true}).click();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Resume Game',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Resume Game',exact:true}).click();await page.getByRole('button',{name:'Restart',exact:true}).click();expect((await state(page)).collected).toBe(0);await expect(page.locator('.game-arena')).toBeFocused();
 await page.locator('.navigation a[href="#about"]').focus();await expect.poll(async()=>(await state(page)).active).toBe(false);
 y=await page.evaluate(()=>scrollY);await page.keyboard.press('ArrowDown');await page.waitForTimeout(300);expect(await page.evaluate(()=>scrollY)).toBeGreaterThan(y);
});
for(const[name,width,height]of [['desktop',1440,900],['wide',1920,1080],['tablet',768,1024],['mobile',390,844],['small-mobile',320,740]] as const){
 test(`${name}: readable scene, safe control placement, keyboard access and no overflow`,async({page})=>{
  await page.setViewportSize({width,height});await openGame(page);
  const dialog=page.locator('#game');await page.waitForTimeout(200);await page.locator('#game').screenshot({path:`verification/embedded-game/${name}-ready.png`});
  await page.getByRole('button',{name:'Start Game',exact:true}).click();const canvas=page.locator('.playground-canvas');
  const arena=(await canvas.boundingBox())!,controls=(await page.locator('.game-directions').boundingBox())!;expect(controls.y).toBeGreaterThanOrEqual(arena.y+arena.height);
  const s=await state(page);expect(s.player.x).toBeGreaterThan(8);expect(s.player.y).toBeGreaterThan(8);
  await expect(page.locator('.game-arena')).toBeFocused();await page.keyboard.down('d');await page.waitForTimeout(250);await page.keyboard.up('d');expect((await state(page)).player.x).toBeGreaterThan(s.player.x);
  await page.keyboard.down('ArrowUp');await page.waitForTimeout(250);await page.keyboard.up('ArrowUp');expect((await state(page)).player.y).toBeLessThan(s.player.y);
  expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBeTruthy();
  await page.locator('#game').screenshot({path:`verification/embedded-game/${name}-playing.png`});
  const violations=(await new AxeBuilder({page}).include('#game').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;expect(violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 });
}
test('touch buttons move and release without scrolling; reduced motion remains playable',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();await openGame(page);await page.getByRole('button',{name:'Start Game',exact:true}).click();
 await page.locator('.game-directions').scrollIntoViewIfNeeded();
 const before=await state(page),right=page.getByRole('button',{name:'Move right',exact:true});
 // Native touch through CDP supports a held contact and pointer capture.
 const cdp=await context.newCDPSession(page),box=(await right.boundingBox())!;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});await page.waitForTimeout(400);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 expect((await state(page)).player.x).toBeGreaterThan(before.player.x);const after=(await state(page)).player.x;await page.waitForTimeout(450);expect((await state(page)).player.x-after).toBeLessThan(15);
 expect(await page.evaluate(()=>document.body.style.position)).toBe('');await page.getByRole('button',{name:'Stop',exact:true}).click();await expect(page.getByRole('button',{name:'Resume Game',exact:true})).toBeVisible();await context.close();
});
function route(s:Snapshot){
 const size=22,cols=Math.ceil(s.width/size),rows=Math.ceil(s.height/size),goal=s.target!;
 const point=(index:number)=>({x:Math.min(s.width-14,(index%cols)*size+size/2),y:Math.min(s.height-14,Math.floor(index/cols)*size+size/2)});
 const allowed=(index:number)=>{
  const p=point(index);if(p.x<13||p.y<13||p.x>s.width-13||p.y>s.height-13)return false;
  return !s.obstacles.some(b=>p.x>b.x-17&&p.x<b.x+b.width+17&&p.y>b.y-17&&p.y<b.y+b.height+17);
 };
 const nearest=(p:{x:number;y:number})=>{let best=0,distance=Infinity;for(let i=0;i<cols*rows;i++){if(!allowed(i))continue;const q=point(i),d=Math.hypot(p.x-q.x,p.y-q.y);if(d<distance){distance=d;best=i;}}return best;};
 const start=nearest(s.player),end=nearest(goal),queue=[start],previous=new Map<number,number>([[start,-1]]);
 for(let n=0;n<queue.length&&!previous.has(end);n++){
  const current=queue[n],cx=current%cols,cy=Math.floor(current/cols);
  for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   const x=cx+dx,y=cy+dy,next=y*cols+x;if(x<0||x>=cols||y<0||y>=rows||previous.has(next)||!allowed(next))continue;
   if(dx&&dy&&(!allowed(cy*cols+x)||!allowed(y*cols+cx)))continue;
   previous.set(next,current);queue.push(next);
  }
 }
 expect(previous.has(end)).toBeTruthy();const path:number[]=[];let cursor=end;while(cursor!==-1){path.push(cursor);cursor=previous.get(cursor)!;}path.reverse();
 const waypoints:{x:number;y:number}[]=[];
 for(let i=1;i<path.length-1;i++){const a=point(path[i-1]),b=point(path[i]),c=point(path[i+1]);if(Math.sign(b.x-a.x)!==Math.sign(c.x-b.x)||Math.sign(b.y-a.y)!==Math.sign(c.y-b.y))waypoints.push(b);}
 waypoints.push(goal);return waypoints;
}
test('complete all letters using real keyboard input, reveal skills, play again and return',async({page})=>{
 test.setTimeout(150000);await page.setViewportSize({width:1440,height:900});await openGame(page);await page.getByRole('button',{name:'Start Game',exact:true}).click();
 let held=new Set<string>();
 const apply=async(keys:Set<string>)=>{for(const key of held)if(!keys.has(key))await page.keyboard.up(key);for(const key of keys)if(!held.has(key))await page.keyboard.down(key);held=keys;};
 for(let round=0;round<2;round++){
 const started=Date.now();
 for(let i=0;i<10;i++){
  let s=await state(page);const path=route(s);
  for(const waypoint of path){
   let attempts=0;
   while((s=await state(page)).collected===i&&Math.hypot(s.player.x-waypoint.x,s.player.y-waypoint.y)>12){
    expect(attempts++).toBeLessThan(150);
    const dx=waypoint.x-s.player.x,dy=waypoint.y-s.player.y,keys=new Set<string>();
    if(Math.abs(dx)>6)keys.add(dx>0?(i%2?'ArrowRight':'d'):(i%2?'ArrowLeft':'a'));
    if(Math.abs(dy)>6)keys.add(dy>0?(i%2?'ArrowDown':'s'):(i%2?'ArrowUp':'w'));
    await apply(keys);await page.waitForTimeout(100);
   }
   if(s.collected>i)break;
  }
  // Let the last few pixels cross the collection radius, then release before the next route.
  await apply(new Set());await expect.poll(async()=>(await state(page)).collected,{timeout:1500}).toBe(i+1);
  await expect(page.locator('.game-status [role=status]')).toContainText(GAME_LETTERS[i].skill);
  if(round===0&&i===2){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await expect.poll(async()=>(await state(page)).near).toBe(false);expect((await state(page)).collected).toBe(3);await page.locator('#game').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Resume Game',exact:true}).click();expect((await state(page)).collected).toBe(3);}
 }
 console.log('GAME COMPLETION SECONDS',(Date.now()-started)/1000);
 await expect(page.getByText('Thanks for exploring my portfolio.',{exact:true})).toBeVisible();await page.waitForTimeout(1000);await page.locator('#game').screenshot({path:'verification/embedded-game/completed.png'});
 const complete=await state(page);await page.keyboard.press('ArrowRight');expect((await state(page)).player).toEqual(complete.player);
 if(round===0){await page.getByRole('button',{name:'Play Again',exact:true}).click();expect((await state(page)).collected).toBe(0);expect((await state(page)).phase).toBe('playing');await expect(page.locator('.game-arena')).toBeFocused();
 await expect(page.locator('.intro-running')).toHaveCount(0);
 }
 }
 await page.locator('.game-completion').getByRole('link',{name:'Let’s Connect ↓'}).click();await expect(page.locator('#contact')).toBeFocused();await expect.poll(async()=>Math.abs((await page.locator('#contact').boundingBox())!.y-100),{timeout:3000}).toBeLessThan(5);
});

test('single engine across pause/resume; offscreen, browser blur and hidden suspension',async({page})=>{
  await page.addInitScript(()=>{
    const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
    const pending=new Map<number,FrameRequestCallback>(),owners=new Set<FrameRequestCallback>();
    let current:FrameRequestCallback|null=null;
    const metrics={pending:0,max:0,frames:0};
    const recount=()=>{metrics.pending=[...pending.values()].filter(callback=>owners.has(callback)).length;metrics.max=Math.max(metrics.max,metrics.pending);};
    (window as unknown as {__gameRAF:typeof metrics}).__gameRAF=metrics;
    const original=HTMLCanvasElement.prototype.getContext;
    const tracked=new WeakSet<object>();
    HTMLCanvasElement.prototype.getContext=function(...args:unknown[]){
      const context=Reflect.apply(original,this,args);
      if(context&&typeof context.clearRect==='function'&&!tracked.has(context)){
        tracked.add(context);const clear=context.clearRect.bind(context);
        context.clearRect=(...rect:number[])=>{
          if(current&&this.classList.contains('playground-canvas')){owners.add(current);metrics.frames++;recount();}
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
 await page.addInitScript(()=>{
  const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener,active=new Map<EventTarget,Map<string,Set<EventListenerOrEventListenerObject>>>();
  const watched=(target:EventTarget,type:string)=>(target===window||target===document)&&['keydown','keyup','blur','visibilitychange'].includes(type);
  EventTarget.prototype.addEventListener=function(type,listener,options){if(listener&&watched(this,type)){if(!active.has(this))active.set(this,new Map());const target=active.get(this)!;if(!target.has(type))target.set(type,new Set());target.get(type)!.add(listener);}return add.call(this,type,listener,options);};
  EventTarget.prototype.removeEventListener=function(type,listener,options){if(listener&&watched(this,type))active.get(this)?.get(type)?.delete(listener);return remove.call(this,type,listener,options);};
  (window as unknown as {__gameListeners:()=>number}).__gameListeners=()=>[...active.values()].flatMap(target=>[...target.values()]).reduce((total,set)=>total+set.size,0);
 });
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await openGame(page);
 const listeners=()=>page.evaluate(()=>(window as unknown as {__gameListeners:()=>number}).__gameListeners());const baseline=await listeners();
 const metrics=()=>page.evaluate(()=>(window as unknown as {__gameRAF:{pending:number;max:number;frames:number}}).__gameRAF);
 for(let i=0;i<3;i++){
  await page.getByRole('button',{name:i?'Resume Game':'Start Game',exact:true}).click();await page.waitForTimeout(150);
  expect((await metrics()).pending).toBe(1);expect((await metrics()).max).toBe(1);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const paused=await metrics();expect(paused.pending).toBe(0);await page.waitForTimeout(180);expect((await metrics()).frames).toBe(paused.frames);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await page.getByRole('button',{name:'Resume Game',exact:true}).click();await page.waitForTimeout(100);expect((await metrics()).pending).toBe(1);
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Resume Game',exact:true})).toBeFocused();
  expect(await listeners()).toBe(baseline);expect((await metrics()).pending).toBe(0);await expect(page.locator('.playground-canvas')).toHaveCount(1);
 }
 await page.getByRole('button',{name:'Resume Game',exact:true}).click();const progress=(await state(page)).collected;
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));expect((await state(page)).active).toBe(false);
 await page.getByRole('button',{name:'Resume Game',exact:true}).click();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await expect.poll(async()=>(await state(page)).near).toBe(false);expect((await metrics()).pending).toBe(0);
 const frames=(await metrics()).frames;await page.waitForTimeout(150);expect((await metrics()).frames).toBe(frames);
 await page.locator('#game').scrollIntoViewIfNeeded();expect((await state(page)).collected).toBe(progress);await expect(page.getByRole('button',{name:'Resume Game',exact:true})).toBeVisible();expect(errors).toEqual([]);

});

test('Canvas unavailable offers a readable non-game return path',async({page})=>{
 await page.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=(()=>null) as typeof HTMLCanvasElement.prototype.getContext;});
 await page.goto('/');await page.locator('#game').scrollIntoViewIfNeeded();
 await expect(page.getByText('Canvas is unavailable in this browser. You can still explore the portfolio.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Start Game',exact:true})).toHaveCount(0);await page.locator('.game-intro').getByRole('link',{name:'Let’s Connect ↓'}).click();await expect(page.locator('#contact')).toBeFocused();
});

test('200 percent desktop zoom equivalent remains readable and keyboard navigable',async({browser})=>{
 const context=await browser.newContext({viewport:{width:720,height:450},deviceScaleFactor:2,reducedMotion:'reduce'});const page=await context.newPage();await openGame(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const frame=page.locator('.game-frame');expect(await frame.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await page.getByRole('button',{name:'Start Game',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('.game-arena')).toBeFocused();await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Resume Game',exact:true})).toBeFocused();await page.locator('#game').screenshot({path:'verification/embedded-game/zoom-200.png'});await context.close();
});
