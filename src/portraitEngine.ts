import { INTRO, PORTRAIT, phaseAt } from './portraitConfig';
import { INTRO_TEXT, sampleIntroWords } from './introText';
import { Constellation } from './constellation';

type Point = { x: number; y: number; brightness: number; radius: number; face: boolean; importance?: number; priority?: number };
type Particle = { x: number; y: number; vx: number; vy: number; seed: number; fromX: number; fromY: number; scatterX: number; scatterY: number; opacity:number; fromOpacity:number };
type Controls = { active: boolean; onFinish: () => void };
const clamp = (n: number, low=0, high=1) => Math.max(low, Math.min(high,n));
const smooth = (n: number) => { const t=clamp(n);return t*t*(3-2*t); };
const lerp = (a: number,b: number,t: number) => a+(b-a)*t;

export function startPortrait(canvas: HTMLCanvasElement, hero: HTMLElement, controls: Controls) {
  const ctx = canvas.getContext('2d',{alpha:true});
  if (!ctx) return null;
  const image = new Image();
  const readiness=setTimeout(()=>{if(!ready&&!disposed){canvas.dataset.failed='true';controls.onFinish();}},9000);
  let disposed=false, ready=false, frame=0, last=0, elapsed=0, lastTime=0, visible=true, w=0,h=0;
  let points: Point[]=[], particles: Particle[]=[], words: Point[][]=[], imageData: ImageData | null=null;
  let stage='', morphStart=0;
  const pointer={x:-9999,y:-9999,active:false};
  let fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  const fineQuery=matchMedia('(hover: hover) and (pointer: fine)');
  const site=hero.closest('.site') as HTMLElement;
  const atmosphere=hero.querySelector('.hero-atmosphere') as HTMLElement;
  const light={x:0,y:0,targetX:0,targetY:0,active:false,alpha:0};
  let ambientTime=0,lastLightWrite=0,ambientStep=0;
  const constellation=new Constellation();
  let lastStatsWrite=0;
  const atmosphereState=()=>{hero.dataset.atmosphere=document.hidden||!visible?'paused':'running';};
  const drawAtmosphere=(time:number,dt=0,moving=false)=>{
    if(moving){
      ambientTime+=dt;
      const blend=1-Math.exp(-dt*4.5);
      if(light.active&&fine){light.x=lerp(light.x,light.targetX,blend);light.y=lerp(light.y,light.targetY,blend);}
      light.alpha=lerp(light.alpha,light.active&&fine?1:0,blend);
      if(time-lastLightWrite>32){
        const gx=Math.sin(ambientTime*.065)*13+(fine&&light.active?(light.x/w-.5)*10:0);
        const gy=Math.cos(ambientTime*.05)*8+(fine&&light.active?(light.y/h-.5)*7:0);
        atmosphere.style.setProperty('--spotlight-alpha',(.84+Math.sin(ambientTime*Math.PI*2/14)*.14).toFixed(3));
        atmosphere.style.setProperty('--glow-x',`${gx.toFixed(2)}px`);
        atmosphere.style.setProperty('--glow-y',`${gy.toFixed(2)}px`);
        atmosphere.style.setProperty('--field-x',`${light.x.toFixed(2)}px`);
        atmosphere.style.setProperty('--field-y',`${light.y.toFixed(2)}px`);
        atmosphere.style.setProperty('--field-alpha',light.alpha.toFixed(3));lastLightWrite=time;
      }
    }
    constellation.draw(ctx,dt,fine?{x:light.x,y:light.y,active:light.active}:null);
    if(time-lastStatsWrite>250){
      const stats=constellation.metrics;
      canvas.dataset.fieldCount=String(stats.count);canvas.dataset.fieldConnections=String(stats.connections);
      canvas.dataset.fieldNearConnections=String(stats.nearConnections);canvas.dataset.fieldOffset=stats.maxOffset.toFixed(3);
      canvas.dataset.fieldQuality=stats.quality;lastStatsWrite=time;
    }
  };
  const introBox=()=>controls.active;
  const portraitBox=()=>{
    const r=hero.getBoundingClientRect();
    const mobile=r.width<651;
    const ph=mobile?Math.min(r.width*1.23,490):Math.min(r.height*.94,r.width*.62,850);
    const pw=ph*660/1080;
    const x=mobile?r.width-pw+8:r.width-pw-r.width*.045;
    const y=mobile?98:Math.max(40,(r.height-ph)*.5);
    return {x:x+(introBox()?r.left:0),y:y+(introBox()?r.top:0),width:pw,height:ph};
  };
  const makePortrait=()=>{
    if(!imageData) return;
    const {data,width,height}=imageData;
    const box=portraitBox();
    const budget=w<651?PORTRAIT.mobileParticles:w<1000?PORTRAIT.tabletParticles:PORTRAIT.desktopParticles;
    const candidates: Point[]=[];
    // A deterministic grid preserves facial features instead of redrawing random noise.
    const step=w<651?4:3;
    for(let y=0;y<height;y+=step) for(let x=0;x<width;x+=step){
      const i=(y*width+x)*4, alpha=data[i+3]/255;
      if(alpha<.08) continue;
      const l=data[i]/255;
      const edge=Math.abs(data[i]-data[Math.min(i+8,data.length-4)])/255;
      const nx=x/width,ny=y/height;
      const face=ny>.015 && ny<.40 && nx>.20 && nx<.82;
      const detail=1-smooth((ny-.30)/.22);
      const outline=data[Math.max(0,i-step*4)+3]<80||data[Math.min(data.length-1,i+step*4+3)]<80;
      candidates.push({x:box.x+nx*box.width,y:box.y+ny*box.height,brightness:clamp((.13+.10*detail+Math.pow(l,.82)*(.67+.11*detail)+edge*.9+(outline?.2:0))*alpha),radius:(.52+l*.72+.12*detail)*Math.min(1,box.width/480),face,importance:1+12*detail});
    }
    // Smoothly weighted, deterministic sampling: dense facial detail without a seam at the shoulders.
    const priority=(p:Point)=>{const n=Math.sin(p.x*127.1+p.y*311.7)*43758.5453;const hash=n-Math.floor(n);return -Math.log(Math.max(.00001,hash))/(p.importance||1);};
    for(const point of candidates)point.priority=priority(point);
    points=candidates.sort((a,b)=>a.priority!-b.priority!).slice(0,budget);
    canvas.dataset.particles=String(points.length);
  };
  const build=()=>{
    const r=hero.getBoundingClientRect();
    w=controls.active?innerWidth:r.width;h=controls.active?innerHeight:r.height;
    const dpr=Math.min(devicePixelRatio||1,PORTRAIT.dprLimit);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    constellation.resize(w,h);
    canvas.dataset.fieldCount=String(constellation.metrics.count);
    light.x=light.targetX=w*.72;light.y=light.targetY=h*.4;
    atmosphereState();
    makePortrait();
    if(controls.active){
      const masks=sampleIntroWords(w,h,points.length);
      words=masks.map(mask=>mask.points);
      canvas.dataset.textMetrics=JSON.stringify(masks.map(mask=>mask.metrics));
    }
    particles=points.map((p,i)=>({x:controls.active?w/2:p.x,y:controls.active?h*.57:p.y,vx:0,vy:0,seed:(i*.61803398875)%1,fromX:w/2,fromY:h*.57,scatterX:0,scatterY:0,opacity:0,fromOpacity:0}));
    stage='';delete canvas.dataset.settled;morphStart=elapsed;
    if(!controls.active) renderStill();
  };
  const dot=(x:number,y:number,r:number,alpha:number)=>{ctx.globalAlpha=clamp(alpha);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
  const renderStill=()=>{ctx.clearRect(0,0,w,h);drawAtmosphere(0);ctx.fillStyle='#fff';points.forEach(p=>dot(p.x,p.y,p.radius,p.brightness));ctx.globalAlpha=1;};
  const setStage=(next:string)=>{
    if(next===stage)return;
    stage=next;canvas.dataset.phase=next;delete canvas.dataset.settled;morphStart=elapsed;
    for(const p of particles){p.fromX=p.x;p.fromY=p.y;p.fromOpacity=p.opacity;const angle=p.seed*Math.PI*2;p.scatterX=w/2+Math.cos(angle)*w*(.35+p.seed*.4);p.scatterY=h/2+Math.sin(angle)*h*(.3+p.seed*.5);}
  };
  const ballPosition=(t:number)=>{
    const floor=h*.57;
    if(t<.46)return lerp(h*.18,floor,(t/.46)**2);
    const ranges=[[.46,.94,h*.20],[.94,1.27,h*.105],[1.27,1.5,h*.044]];
    for(const [start,end,amp] of ranges)if(t<=end){const q=(t-start)/(end-start);return floor-amp*4*q*(1-q);}
    return floor;
  };
  const drawBall=(t:number)=>{
    ctx.fillStyle='#fff';
    for(let i=7;i>=1;i--){const dt=i*.018;dot(w/2,ballPosition(Math.max(0,t-dt)),Math.max(2,7-i*.5),(.13-i*.014));}
    const impact=Math.min(...[.46,.94,1.27].map(time=>Math.abs(t-time)));
    const squash=Math.exp(-impact*55)*.45;
    const stretch=Math.abs(ballPosition(t)-ballPosition(Math.max(0,t-.012)))*.025;
    ctx.globalAlpha=1;ctx.save();ctx.translate(w/2,ballPosition(t));ctx.scale(1+squash-stretch*.15,1-squash+stretch*.35);ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.globalAlpha=.08;ctx.beginPath();ctx.ellipse(w/2,h*.57+14,14+squash*12,2,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  };
  const draw=(time:number)=>{
    frame=0;if(disposed||document.hidden||(!controls.active&&!visible))return;
    if(!lastTime)lastTime=time;
    const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
    if(!controls.active)ambientStep+=dt;
    if(controls.active)elapsed+=dt; // Advance in real time, including skipped mobile draw frames.
    const fps=w<651?PORTRAIT.mobileFPS:PORTRAIT.desktopFPS;
    if(time-last<1000/fps-1){frame=requestAnimationFrame(draw);return;}const drawInterval=time-last;last=time;const renderStarted=performance.now();
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';
    if(controls.active){
      setStage(phaseAt(elapsed));
      if(stage==='ball')drawBall(elapsed/INTRO.ballEnd*1.5);
      else {
        const wordIndex=elapsed<INTRO.wordStarts[1]?0:elapsed<INTRO.wordStarts[2]?1:2;
        const targets=words[wordIndex];
        const morph=smooth((elapsed-morphStart)/INTRO.textMorph);
        const transition=elapsed>=INTRO.scatterStart;
        if(!transition&&morph>=1&&canvas.dataset.settled!==stage)canvas.dataset.settled=stage;
        const q=clamp((elapsed-INTRO.scatterStart)/(INTRO.end-INTRO.scatterStart));
        for(let i=0;i<particles.length;i++){
          const p=particles[i], home=points[i];
          if(!home)continue;
          let alpha=1,radius=w<651?.8:1;
          if(transition){
            // Quadratic outward scatter followed by convergence to the source portrait.
            const travel=smooth(q),a=(1-travel)*(1-travel),b=2*(1-travel)*travel,c=travel*travel;
            p.x=a*p.fromX+b*p.scatterX+c*home.x;p.y=a*p.fromY+b*p.scatterY+c*home.y;
            alpha=lerp(p.fromOpacity,home.brightness,smooth(q));radius=lerp(radius,home.radius,q);
          }else{
            if(!targets?.length)continue;
            const target=targets[i%targets.length];
            // Reuse the pool, but fade excess dots instead of stacking them into denser short words.
            p.x=lerp(p.fromX,target.x,morph);p.y=lerp(p.fromY,target.y,morph);
            const targetOpacity=i<targets.length?1:0;
            alpha=stage==='rich-daniel'?targetOpacity*smooth((elapsed-INTRO.wordStarts[0])/.15):lerp(p.fromOpacity,targetOpacity,morph);radius=target.radius;
          }
          p.opacity=alpha;if(alpha>.001)dot(p.x,p.y,radius,alpha);
        }
      }
      const reveal=smooth((elapsed-INTRO.revealStart)/(INTRO.end-INTRO.revealStart));
      site.style.setProperty('--intro-reveal',String(reveal));
      if(elapsed>=INTRO.end){controls.active=false;site.style.setProperty('--intro-reveal','1');controls.onFinish();build();setStage('portrait');}
    }else{
      drawAtmosphere(time,ambientStep,true);ambientStep=0;
      setStage('portrait');
      for(let i=0;i<particles.length;i++){
        const p=particles[i],home=points[i];
        let dx=0,dy=0,glow=0;
        if(pointer.active&&fine){
          const ax=home.x-pointer.x,ay=home.y-pointer.y,dist=Math.hypot(ax,ay);
          if(dist<PORTRAIT.pointerRadius){
            const strength=(1-dist/PORTRAIT.pointerRadius)**2;
            const max=home.face?PORTRAIT.faceDisplacement:PORTRAIT.maxDisplacement;
            const angle=Math.atan2(ay,ax);
            dx=(Math.cos(angle)-Math.sin(angle)*.14)*max*strength;dy=(Math.sin(angle)+Math.cos(angle)*.14)*max*strength;glow=strength*.3;
          }
        }
        const idle=Math.sin(time*.00065+p.seed*12)*PORTRAIT.idleAmplitude;
        const tx=home.x+dx+idle,ty=home.y+dy+idle*.7;
        p.vx=(p.vx+(tx-p.x)*PORTRAIT.spring)*PORTRAIT.damping;p.vy=(p.vy+(ty-p.y)*PORTRAIT.spring)*PORTRAIT.damping;
        p.x+=p.vx;p.y+=p.vy;
        dot(p.x,p.y,home.radius,home.brightness+glow);
      }
    }
    ctx.globalAlpha=1;
    if(!controls.active)constellation.observeFrame(performance.now()-renderStarted,drawInterval);
    frame=requestAnimationFrame(draw);
  };
  const wake=()=>{lastTime=0;if(ready&&!frame&&!document.hidden&&(visible||controls.active))frame=requestAnimationFrame(draw);};
  const move=(e:PointerEvent)=>{
    if(e.pointerType!=='mouse'||!fine||controls.active)return;
    const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;
    light.targetX=pointer.x;light.targetY=pointer.y;light.active=true;
    const box=portraitBox(),nx=(pointer.x-box.x)/box.width,ny=(pointer.y-box.y)/box.height;
    const ix=Math.floor(nx*(imageData?.width||0)),iy=Math.floor(ny*(imageData?.height||0));
    pointer.active=!!imageData&&nx>=0&&nx<1&&ny>=0&&ny<1&&imageData.data[(iy*imageData.width+ix)*4+3]>35;
    canvas.dataset.interacting=String(pointer.active);
  };
  const leave=()=>{pointer.active=false;light.active=false;canvas.dataset.interacting='false';};
  const change=()=>{fine=fineQuery.matches;if(!fine)leave();};
  const visibility=()=>{atmosphereState();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};
  const needsResize=()=>{
    const rect=hero.getBoundingClientRect(),width=controls.active?innerWidth:rect.width,height=controls.active?innerHeight:rect.height;
    const dpr=Math.min(devicePixelRatio||1,PORTRAIT.dprLimit);
    return Math.round(w)!==Math.round(width)||Math.round(h)!==Math.round(height)||canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr);
  };
  const resize=new ResizeObserver(()=>{if(ready&&needsResize()){build();wake();}});resize.observe(hero);
  const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;atmosphereState();if(!visible&&!controls.active){cancelAnimationFrame(frame);frame=0;}else wake();});intersection.observe(hero);
  const windowResize=()=>{if(ready&&needsResize()){build();wake();}};
  window.addEventListener('resize',windowResize);document.addEventListener('visibilitychange',visibility);hero.addEventListener('pointermove',move);hero.addEventListener('pointerleave',leave);fineQuery.addEventListener('change',change);document.documentElement.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);
  image.onload=async()=>{
    try {
      await document.fonts.load(`${INTRO_TEXT.weight} 100px ${INTRO_TEXT.family}`);await document.fonts.ready;if(disposed)return;
      const buffer=document.createElement('canvas');buffer.width=660;buffer.height=1080;
      const b=buffer.getContext('2d',{willReadFrequently:true});if(!b)throw new Error('No sampling context');
      b.drawImage(image,0,0,660,1080);imageData=b.getImageData(0,0,660,1080);ready=true;clearTimeout(readiness);build();canvas.dataset.ready='true';wake();
    } catch { canvas.dataset.failed='true';controls.onFinish(); }
  };
  image.onerror=()=>{canvas.dataset.failed='true';controls.onFinish();};image.src=PORTRAIT.mask;
  return {
    update(active:boolean){
      controls.active=active;atmosphereState();
      if(!active&&ready&&canvas.dataset.phase!=='portrait'){elapsed=INTRO.end;build();setStage('portrait');}
      wake();
    },
    dispose(){disposed=true;clearTimeout(readiness);cancelAnimationFrame(frame);resize.disconnect();intersection.disconnect();window.removeEventListener('resize',windowResize);document.removeEventListener('visibilitychange',visibility);hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);fineQuery.removeEventListener('change',change);document.documentElement.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);delete hero.dataset.atmosphere;image.onload=null;image.onerror=null;site.style.removeProperty('--intro-reveal');},
  };
}
