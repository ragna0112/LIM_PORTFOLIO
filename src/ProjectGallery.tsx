import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Expand, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { ProjectConfig } from './projects';

export function ProjectGallery({project}:{project:ProjectConfig}) {
  const [index,setIndex]=useState(0);
  const [enlarged,setEnlarged]=useState(false);
  const [zoom,setZoom]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const opener=useRef<HTMLButtonElement>(null);
  const reduce=useReducedMotion();
  const image=project.screenshots[index];
  useEffect(()=>{
    if(!enlarged)return;
    const modal=dialog.current!;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';modal.showModal();
    return ()=>{modal.close();document.body.style.overflow=overflow;opener.current?.focus({preventScroll:true});};
  },[enlarged]);
  const change=(direction:number)=>setIndex(current=>(current+direction+project.screenshots.length)%project.screenshots.length);
  return <div className="project-gallery">
    <div className="gallery-preview">
      <motion.img key={image.src} initial={reduce?false:{opacity:.4,y:6}} animate={{opacity:1,y:0}} transition={{duration:.25}} src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"/>

    </div>
    <div className="gallery-controls" role="group" aria-label={`${project.name} screenshots`}>
      {project.screenshots.map((s,i)=><button key={s.src} aria-pressed={index===i} onClick={()=>setIndex(i)}><span className="mono">0{i+1}</span>{s.label}</button>)}
      <button ref={opener} className="gallery-enlarge" aria-label={`Enlarge ${project.name} ${image.label}`} onClick={()=>{setZoom(innerWidth<650);setEnlarged(true);}}><Expand aria-hidden="true" size={15}/> Enlarge image</button>
    </div>
    <dialog ref={dialog} className="project-lightbox" aria-label={`${project.name} enlarged screenshots`} onClose={()=>setEnlarged(false)} onClick={e=>{if(e.target===e.currentTarget)setEnlarged(false);}} onKeyDown={e=>{if(e.target===(dialog.current?.querySelector('.lightbox-scroll')))return;if(e.key==='ArrowLeft')change(-1);if(e.key==='ArrowRight')change(1);}}>
      {enlarged&&<>
        <div className="lightbox-header"><span>{project.name} <span className="lightbox-caption">/ {image.label}</span></span><button onClick={()=>setEnlarged(false)} aria-label="Close enlarged image"><X aria-hidden="true" size={20}/></button></div>
        <div className={`lightbox-scroll ${zoom?'actual-size':''}`} tabIndex={0} role="region" aria-label="Screenshot viewer. Scroll to explore the full image."><img src={image.src} alt={image.alt} width={image.width} height={image.height}/></div>
        <div className="lightbox-controls"><button onClick={()=>change(-1)} aria-label="Previous screenshot"><ArrowLeft aria-hidden="true" size={17}/></button><span className="mono">{index+1} / {project.screenshots.length}</span><button onClick={()=>change(1)} aria-label="Next screenshot"><ArrowRight aria-hidden="true" size={17}/></button><button className="zoom-button" aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?<ZoomOut aria-hidden="true" size={16}/>:<ZoomIn aria-hidden="true" size={16}/>} {zoom?'Fit image':'View actual size'}</button></div>
      </>}
    </dialog>
  </div>;
}
