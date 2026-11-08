import {useEffect} from 'react';
import {motion,useScroll} from 'framer-motion';

/** Functional reading progress; raw scroll values avoid lag, including reduced motion. */
export function ScrollProgress(){
  const {scrollYProgress}=useScroll();
  return <motion.div className="reading-progress" aria-hidden="true" style={{scaleX:scrollYProgress}}/>;
}

/** CSS individual translate composes with existing transforms; no React renders or extra RAF. */
export function useMagneticLinks(){
  useEffect(()=>{
    const fine=matchMedia('(hover: hover) and (pointer: fine)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const selector='.connect-pill,.round-link,.project-links a,.project-top-name,.contact-link,.footer-links a,.gallery-enlarge';
    const links=[...document.querySelectorAll<HTMLElement>(selector)];
    links.forEach(link=>link.classList.add('magnetic-link'));
    let active:HTMLElement|null=null,box:DOMRect|null=null;
    const reset=()=>{if(active)active.style.removeProperty('translate');active=null;box=null;};
    const move=(event:PointerEvent)=>{
      if(!fine.matches||reduced.matches||event.pointerType!=='mouse'){reset();return;}
      const target=event.target instanceof Element?event.target.closest<HTMLElement>(selector):null;
      if(!target){reset();return;}
      if(target!==active){reset();active=target;box=target.getBoundingClientRect();}
      if(!box)return;
      const clamp=(value:number)=>Math.max(-3,Math.min(3,value));
      const x=clamp((event.clientX-box.left-box.width/2)*.065),y=clamp((event.clientY-box.top-box.height/2)*.1);
      active!.style.translate=`${x.toFixed(2)}px ${y.toFixed(2)}px`;
    };
    const leave=(event:PointerEvent)=>{if(event.target===active)reset();};
    document.addEventListener('pointermove',move,{passive:true});document.addEventListener('pointerleave',leave,true);
    document.addEventListener('focusin',reset);window.addEventListener('scroll',reset,{passive:true});window.addEventListener('blur',reset);
    fine.addEventListener('change',reset);reduced.addEventListener('change',reset);
    return()=>{
      reset();links.forEach(link=>{link.classList.remove('magnetic-link');link.style.removeProperty('translate');});
      document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave,true);document.removeEventListener('focusin',reset);
      window.removeEventListener('scroll',reset);window.removeEventListener('blur',reset);fine.removeEventListener('change',reset);reduced.removeEventListener('change',reset);
    };
  },[]);
}
