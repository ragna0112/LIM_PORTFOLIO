import {GAME,GAME_LETTERS} from './gameConfig';
import {GameModel,type Direction} from './gameModel';
type Options={root:HTMLElement;reduced:()=>boolean;onCollect:(index:number)=>void;onComplete:()=>void;onPause:()=>void};
export function startGameEngine(canvas:HTMLCanvasElement,options:Options){
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  const tile=document.createElement('canvas');tile.width=tile.height=64;
  const tileContext=tile.getContext('2d');let grain:CanvasPattern|null=null,glow:CanvasGradient|null=null;
  if(tileContext){
    const pixels=tileContext.createImageData(64,64);
    for(let i=0;i<pixels.data.length;i+=4){const shade=(i*37)%255;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=shade;pixels.data[i+3]=9;}
    tileContext.putImageData(pixels,0,0);grain=ctx.createPattern(tile,'repeat');
  }
  const model=new GameModel();let active=false,near=false,disposed=false,frame=0,last=0,time=0,completion=0,lastSnapshot=0;
  let pulse:{x:number;y:number;age:number}|null=null;
  const pressed=new Set<string>(),touch=new Set<Direction>();
  const keyMap:Record<string,Direction>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'};
  const syncInput=()=>{model.keys=new Set([...pressed].map(key=>keyMap[key]).concat([...touch]));};
  const clearKeys=()=>{pressed.clear();touch.clear();model.keys.clear();};
  const snapshot=()=>{canvas.dataset.gameState=JSON.stringify({phase:model.phase,active,near,collected:model.collected,player:{x:model.player.x,y:model.player.y},target:model.targets[model.collected]||null,obstacles:model.obstacles,width:model.width,height:model.height});};
  const render=()=>{
    const w=model.width,h=model.height,reduced=options.reduced();ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#0c0c0c';ctx.fillRect(0,0,w,h);
    if(glow){ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);}
    if(grain){ctx.fillStyle=grain;ctx.fillRect(0,0,w,h);}
    ctx.strokeStyle='#ffffff10';ctx.lineWidth=1;ctx.strokeRect(5.5,5.5,w-11,h-11);
    // A few distant nodes; no scene scrolling or expensive generated noise.
    for(let i=0;i<(w<600?9:w<1000?12:18);i++){
      const x=((i*137.51+47)%997)/997*w,y=((i*83.73+73)%613)/613*h;
      ctx.fillStyle='#ffffff17';ctx.beginPath();ctx.arc(x+(reduced?0:Math.sin(time*.12+i)*2),y, .7,0,Math.PI*2);ctx.fill();
      if(i%4===0){ctx.strokeStyle='#ffffff07';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+45,y-20);ctx.stroke();}
    }
    const finished=model.phase==='complete';
    ctx.globalAlpha=finished?.18:1;
    for(const b of model.obstacles){ctx.fillStyle='#242424';ctx.fillRect(b.x,b.y,b.width,b.height);ctx.strokeStyle='#62625a';ctx.strokeRect(b.x+.5,b.y+.5,b.width-1,b.height-1);}
    ctx.globalAlpha=1;
    const fontSize=w<500?20:24;ctx.font=`600 ${fontSize}px "Barlow Condensed", sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    if(!finished)GAME_LETTERS.forEach((item,i)=>{
      if(i<model.collected)return;const p=model.targets[i],active=i===model.collected;
      ctx.strokeStyle=active?'#dadad0':'#343432';ctx.lineWidth=active?1.2:1;ctx.beginPath();ctx.arc(p.x,p.y,GAME.letterRadius+(active?4:0),0,Math.PI*2);ctx.stroke();
      ctx.fillStyle=active?'#f3f3eb':'#88887d';ctx.fillText(item.letter,p.x,p.y+.5);
      if(active){ctx.fillStyle='#b6b6aa';ctx.font='8px "Space Mono", monospace';ctx.fillText('NEXT',p.x,p.y-GAME.letterRadius-14);ctx.font=`600 ${fontSize}px "Barlow Condensed", sans-serif`;}
    });
    if(!finished){
      ctx.save();ctx.shadowColor='#ffffff70';ctx.shadowBlur=reduced?0:9;ctx.fillStyle='#f5f5ee';ctx.beginPath();ctx.arc(model.player.x,model.player.y,GAME.playerRadius,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.strokeStyle='#ffffff30';ctx.beginPath();ctx.arc(model.player.x,model.player.y,GAME.playerRadius+4,0,Math.PI*2);ctx.stroke();
    }
    if(pulse&&!reduced&&pulse.age<.65){ctx.globalAlpha=(1-pulse.age/.65)*.45;ctx.strokeStyle='#fff';ctx.beginPath();ctx.arc(pulse.x,pulse.y,18+pulse.age*35,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(finished){
      const label='HELLO WORLD';let size=Math.min(120,w*.16);ctx.font=`800 ${size}px "Barlow Condensed", sans-serif`;size*=Math.min(1,w*.82/ctx.measureText(label).width);ctx.font=`800 ${size}px "Barlow Condensed", sans-serif`;
      const full=ctx.measureText(label).width,start=(w-full)/2,t=reduced?1:Math.min(1,completion/.9),e=t*t*(3-2*t);
      const layout=[...'HELLO WORLD'];let advance=0,index=0;
      for(const letter of layout){const width=ctx.measureText(letter).width;if(letter!==' '){const from=model.targets[index++];const x=start+advance+width/2,y=h*.38;ctx.fillStyle='#eeeeE4';ctx.fillText(letter,from.x+(x-from.x)*e,from.y+(y-from.y)*e);}advance+=width;}
    }
  };
  const resize=()=>{
    const box=canvas.getBoundingClientRect();if(box.width<1||box.height<1)return;
    const dpr=Math.min(devicePixelRatio||1,GAME.dprLimit);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    model.resize(box.width,box.height);glow=ctx.createRadialGradient(model.width*.6,model.height*.4,0,model.width*.6,model.height*.4,Math.max(model.width,model.height)*.6);glow.addColorStop(0,'#ffffff09');glow.addColorStop(1,'#ffffff00');snapshot();render();
  };
  const draw=(now:number)=>{
    frame=0;if(disposed||document.hidden||!near)return;
    const dt=last?Math.min((now-last)/1000,.04):0;last=now;time+=dt;if(pulse)pulse.age+=dt;
    const collected=active?model.step(dt):null;
    if(collected!==null){const p=model.targets[collected];pulse={...p,age:0};options.onCollect(collected);if(model.phase==='complete'){active=false;completion=0;options.onComplete();}}
    if(model.phase==='complete')completion+=dt;
    render();if(now-lastSnapshot>80){snapshot();lastSnapshot=now;}
    if((active&&model.phase==='playing')||(model.phase==='complete'&&completion<1&&!options.reduced()))frame=requestAnimationFrame(draw);else snapshot();
  };
  const wake=()=>{last=0;if(!disposed&&!frame&&!document.hidden&&near&&((active&&model.phase==='playing')||(model.phase==='complete'&&completion<1&&!options.reduced())))frame=requestAnimationFrame(draw);};
  const keydown=(event:KeyboardEvent)=>{
    if(event.ctrlKey||event.metaKey||event.altKey||!active||!options.root.contains(document.activeElement)||model.phase!=='playing')return;
    const key=event.key.length===1?event.key.toLowerCase():event.key;if(!keyMap[key])return;
    event.preventDefault();pressed.add(key);syncInput();
  };
  const keyup=(event:KeyboardEvent)=>{const key=event.key.length===1?event.key.toLowerCase():event.key;if(keyMap[key]){pressed.delete(key);syncInput();}};
  const pause=()=>{active=false;clearKeys();model.player.vx=0;model.player.vy=0;cancelAnimationFrame(frame);frame=0;if(model.phase==='complete'){completion=1;render();}snapshot();if(model.phase==='playing')options.onPause();};
  const visibility=()=>{if(document.hidden)pause();else wake();};
  const focusout=(event:FocusEvent)=>{if(!options.root.contains(event.relatedTarget as Node|null))pause();};
  const intersection=new IntersectionObserver(([entry])=>{near=entry.isIntersecting;if(!near)pause();else wake();snapshot();},{rootMargin:'200px'});intersection.observe(canvas);
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  options.root.addEventListener('keydown',keydown);options.root.addEventListener('focusout',focusout);window.addEventListener('keyup',keyup);window.addEventListener('blur',pause);document.addEventListener('visibilitychange',visibility);
  return {
    start(restart=false){if(restart||model.phase==='complete')model.reset();active=true;completion=0;pulse=null;clearKeys();model.start();snapshot();render();wake();},
    pause,
    press(direction:Direction,down:boolean){if(!active||model.phase!=='playing')return;if(down)touch.add(direction);else touch.delete(direction);syncInput();},
    refresh(){render();wake();},
    dispose(){disposed=true;cancelAnimationFrame(frame);frame=0;clearKeys();observer.disconnect();intersection.disconnect();options.root.removeEventListener('keydown',keydown);options.root.removeEventListener('focusout',focusout);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',pause);document.removeEventListener('visibilitychange',visibility);},
  };
}
