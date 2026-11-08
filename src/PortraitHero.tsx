import { useEffect, useRef } from 'react';
import { PORTRAIT } from './portraitConfig';
import { startPortrait } from './portraitEngine';
import { Atmosphere } from './Atmosphere';
import './atmosphere.css';

export function PortraitHero({ active, staticMode, onFinish }: {active:boolean;staticMode:boolean;onFinish:()=>void}) {
  const ref=useRef<HTMLCanvasElement>(null);
  const engine=useRef<ReturnType<typeof startPortrait>>(null);
  const latest=useRef({active,onFinish});latest.current={active,onFinish};
  useEffect(()=>{
    if(staticMode)return;
    const canvas=ref.current!,hero=canvas.closest('.hero') as HTMLElement;
    const running=startPortrait(canvas,hero,{active:latest.current.active,onFinish:()=>latest.current.onFinish()});
    engine.current=running;
    if(!running){canvas.dataset.failed='true';latest.current.onFinish();}
    return ()=>{running?.dispose();engine.current=null;};
  },[staticMode]);
  useEffect(()=>{engine.current?.update(active);},[active]);
  return <><Atmosphere staticMode={staticMode}/><div className={`portrait-layer ${active?'intro-canvas':''} ${staticMode?'portrait-static':''}`} aria-hidden="true">
    <img className="portrait-fallback" src={PORTRAIT.fallback} alt="" width="660" height="1080" decoding="async" fetchPriority="high"/>
    {!staticMode && <canvas ref={ref} className="portrait-canvas" aria-hidden="true"/>}
  </div></>;
}
