import { useEffect, useRef } from 'react';
import { Constellation } from './constellation';
/** Animated mode uses the existing portrait Canvas/RAF. Static mode paints once per resize. */
export function Atmosphere({staticMode}:{staticMode:boolean}){
  const staticCanvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    if(!staticMode)return;
    const canvas=staticCanvas.current!,host=canvas.parentElement!;
    const context=canvas.getContext('2d');if(!context)return;
    const field=new Constellation();
    const render=()=>{
      const width=host.clientWidth,height=host.clientHeight,dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);
      field.resize(width,height);context.clearRect(0,0,width,height);field.draw(context,0,null,true);
      canvas.dataset.fieldCount=String(field.metrics.count);canvas.dataset.fieldConnections=String(field.metrics.connections);
    };
    const observer=new ResizeObserver(render);observer.observe(host);render();return()=>observer.disconnect();
  },[staticMode]);
  return <div className={`hero-atmosphere ${staticMode?'atmosphere-static':''}`} aria-hidden="true">
    <div className="atmosphere-glow"/>
    {staticMode&&<canvas className="constellation-static" ref={staticCanvas} aria-hidden="true"/>}
    <svg className="atmosphere-fields" viewBox="0 0 800 1000" fill="none" preserveAspectRatio="xMidYMid slice">
      <path d="M740-80C180 90 860 310 350 510S140 900 690 1100"/>
      <path d="M780-40C220 130 900 350 390 550S180 940 730 1140"/>
      <path d="M820 0C260 170 940 390 430 590S220 980 770 1180"/>
    </svg>
    <div className="atmosphere-sweep"/>
    <div className="atmosphere-cursor"/>
  </div>;
}
