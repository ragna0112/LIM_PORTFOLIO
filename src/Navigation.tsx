import {useCallback,useEffect,useLayoutEffect,useRef,useState,type MouseEvent} from 'react';
import {ArrowUpRight,Menu,X} from 'lucide-react';
import {isSectionTarget,sections,navigationSections,type SectionId} from './sections';
import './navigation.css';
import {isIntroInitializing,keepIntroAtHome} from './introScroll';

async function layoutReady(){await document.fonts.ready;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));}
function scrollToSection(id:string,instant:boolean,focus:boolean){
  const section=document.getElementById(id);if(!section)return;
  if(focus){section.tabIndex=-1;section.focus({preventScroll:true});}
  const behavior=instant||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
  if(id==='home')window.scrollTo({top:0,left:0,behavior});else section.scrollIntoView({behavior,block:'start'});
}
function MobileMenu({active,onSelect,onClose,trigger}:{active:SectionId|null;onSelect:(event:MouseEvent<HTMLAnchorElement>,id:string)=>void;onClose:()=>void;trigger:HTMLButtonElement|null}){
  const dialog=useRef<HTMLDialogElement>(null),close=useRef<HTMLButtonElement>(null);
  useLayoutEffect(()=>{
    const modal=dialog.current!,body=document.body,x=scrollX,y=scrollY;
    const keys=['position','top','left','width','overflow','paddingRight'] as const,previous=Object.fromEntries(keys.map(key=>[key,body.style[key]]));
    const scrollbar=innerWidth-document.documentElement.clientWidth;
    body.style.position='fixed';body.style.top=`${-y}px`;body.style.left=`${-x}px`;body.style.width='100%';body.style.overflow='hidden';
    if(scrollbar)body.style.paddingRight=`${parseFloat(getComputedStyle(body).paddingRight)+scrollbar}px`;
    modal.showModal();close.current?.focus({preventScroll:true});
    return()=>{modal.close();keys.forEach(key=>{body.style[key]=previous[key];});window.scrollTo({left:x,top:y,behavior:'instant'});if(trigger?.getClientRects().length)trigger.focus({preventScroll:true});else document.querySelector<HTMLAnchorElement>('.navigation .logo')?.focus({preventScroll:true});};
  },[trigger]);
  return <dialog id="mobile-navigation" ref={dialog} className="mobile-navigation" aria-label="Navigation menu" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}} onKeyDown={event=>{
    if(event.key!=='Tab')return;
    const items=[...event.currentTarget.querySelectorAll<HTMLElement>('button,a[href]')],first=items[0],last=items[items.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }}>
    <div className="mobile-menu-heading"><span className="mono">EXPLORE</span><button ref={close} type="button" onClick={onClose} aria-label="Close navigation menu"><X size={18} aria-hidden="true"/> Close</button></div>
    <nav aria-label="Mobile navigation">{navigationSections.map(section=><a key={section.id} href={section.href} aria-current={active===section.id?'location':undefined} onClick={event=>onSelect(event,section.id)}><span className="section-number">{section.number}</span>{section.label}{section.id==='contact'&&<ArrowUpRight size={16} aria-hidden="true"/>}</a>)}</nav>
  </dialog>;
}
export function Navigation(){
  const header=useRef<HTMLElement>(null),trigger=useRef<HTMLButtonElement>(null),intent=useRef(0);
  const [active,setActive]=useState<SectionId|null>(null),[menuOpen,setMenuOpen]=useState(false);
  const select=useCallback(async(event:MouseEvent<HTMLAnchorElement>,id:string)=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();const version=++intent.current;
    setMenuOpen(false);
    await layoutReady();if(version!==intent.current)return;
    const hash=id==='home'?'':`#${id}`;if(location.hash!==hash)history.pushState(history.state,'',location.pathname+location.search+hash);
    scrollToSection(id,false,true);
  },[]);
  useEffect(()=>{
    const hashchange=()=>{if(isIntroInitializing()){keepIntroAtHome();return;}const id=location.hash.slice(1)||'home';if(!isSectionTarget(id))return;const version=++intent.current;setMenuOpen(false);void layoutReady().then(()=>{if(version===intent.current)scrollToSection(id,false,false);});};
    window.addEventListener('hashchange',hashchange);return()=>window.removeEventListener('hashchange',hashchange);
  },[]);
  useEffect(()=>{
    const query=matchMedia('(max-width: 900px)'),change=()=>{if(!query.matches)setMenuOpen(false);};query.addEventListener('change',change);return()=>query.removeEventListener('change',change);
  },[]);
  useEffect(()=>{
    let observer:IntersectionObserver|null=null;
    const setup=()=>{
      observer?.disconnect();const visible=new Set<string>(),offset=header.current!.getBoundingClientRect().height+14;
      observer=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting)visible.add(entry.target.id);else visible.delete(entry.target.id);});
        const candidates=[...visible].map(id=>document.getElementById(id)!).sort((a,b)=>Math.abs(a.getBoundingClientRect().top-offset)-Math.abs(b.getBoundingClientRect().top-offset));
        const id=candidates[0]?.id;setActive(id&&id!=='home'?id as SectionId:null);
      },{rootMargin:`-${offset}px 0px -55% 0px`,threshold:0});
      for(const id of ['home',...sections.map(section=>section.id)]){const element=document.getElementById(id);if(element)observer.observe(element);}
    };
    const resize=new ResizeObserver(setup);resize.observe(header.current!);setup();return()=>{resize.disconnect();observer?.disconnect();};
  },[]);
  return <header ref={header} className="navigation"><a className="logo" href="#home" aria-label="RLwork — Rich Daniel Lim, Home" onClick={event=>select(event,'home')}><img src="/branding/rlwork-header-silver.webp" width="566" height="144" alt=""/></a>
    <nav className="desktop-navigation" aria-label="Main navigation">{navigationSections.map(section=><a key={section.id} href={section.href} aria-current={active===section.id?'location':undefined} onClick={event=>select(event,section.id)}>{section.label}<span className="section-number">{section.number}</span>{section.id==='contact'&&<ArrowUpRight size={13} aria-hidden="true"/>}</a>)}</nav>
    <button ref={trigger} type="button" className="menu-toggle" aria-label="Open navigation menu" aria-expanded={menuOpen} aria-controls={menuOpen?'mobile-navigation':undefined} aria-haspopup="dialog" onClick={()=>setMenuOpen(true)}><Menu aria-hidden="true" size={19}/> Menu</button>
    {menuOpen&&<MobileMenu active={active} onSelect={select} onClose={()=>setMenuOpen(false)} trigger={trigger.current}/>}
  </header>;
}
