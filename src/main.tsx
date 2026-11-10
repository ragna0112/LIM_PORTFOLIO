import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDown, ArrowUp, Plus, Minus, Github } from 'lucide-react';
import { profile, projects, resume, experience, type ProjectConfig } from './projects';
import { ProjectGallery } from './ProjectGallery';
import './gallery.css';
import './style.css';
import './branding.css';
import './experience.css';
import { PortraitHero } from './PortraitHero';
import './portrait.css';
import {ScrollProgress,useMagneticLinks} from './InteractionPolish';
import './polish.css';
import {GameSection} from './playground/GameSection';
import {Credentials,ResumeActions} from './Credentials';
import {Navigation} from './Navigation';
import {sectionEyebrow} from './sections';
import {initializeIntroScroll,finishIntroPosition} from './introScroll';

initializeIntroScroll();

document.title=`${profile.name} — ${profile.title}`;
const descriptionMeta=document.createElement('meta');
descriptionMeta.name='description';descriptionMeta.content=profile.heroDescription;document.head.appendChild(descriptionMeta);

const ease = [0.22, 1, 0.36, 1] as const;
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div data-reveal className={className} initial={reduce ? false : { opacity: 0, y: 16, clipPath:'inset(0 0 8% 0)' }} whileInView={{ opacity: 1, y: 0, clipPath:'inset(-12px -12px -12px -12px)' }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: .65, delay, ease }}>{children}</motion.div>;
}
function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 350, damping: 35 }), sy = useSpring(y, { stiffness: 350, damping: 35 });
  const [active, setActive] = useState(false);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const move = (e: PointerEvent) => { x.set(e.clientX); y.set(e.clientY); setActive(!!(e.target as HTMLElement).closest('a,button,summary')); };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [reduce, x, y]);
  if (reduce) return null;
  return <motion.div className={`cursor ${active ? 'active' : ''}`} style={{ left: sx, top: sy }} aria-hidden="true"/>;
}
function Project({ project, index }: { project: ProjectConfig; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const offset = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const rotateX = useMotionValue(0), rotateY = useMotionValue(0);
  const rx = useSpring(rotateX, { stiffness: 180, damping: 25 }), ry = useSpring(rotateY, { stiffness: 180, damping: 25 });
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || matchMedia('(prefers-reduced-motion: reduce)').matches || e.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    rotateX.set(-((e.clientY-r.top)/r.height-.5)*4); rotateY.set(((e.clientX-r.left)/r.width-.5)*4);
  };
  return <article ref={ref} className={`project ${project.mood} ${index % 2 ? 'reverse' : ''}`} id={project.id}>
    <Reveal className="project-top"><span className="mono">/{project.number}</span><span className="mono">{project.category}</span><a className="project-top-name" href={project.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} (opens in a new tab)`}>{project.name} <ArrowUpRight size={15}/></a></Reveal>
    <Reveal className="project-stage">
      <div className="stage-art" aria-hidden="true">{project.visualMark ? <span className="film-word">{project.visualMark}</span> : project.mood === 'weather' ? <div className="weather-orb"/> : <div className="contours">{Array.from({length: 8},(_,i)=><i key={i} style={{ width: `${180+i*80}px`, height: `${110+i*48}px` }}/>)}</div>}</div>
      <span className="stage-label mono">{project.name} — INTERFACE STUDY</span>
      {project.screenshots.length>1 ? <ProjectGallery project={project}/> : <>
      <motion.div className="screenshot-wrap" style={{ rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry }} onPointerMove={tilt} onPointerLeave={()=>{rotateX.set(0);rotateY.set(0);}}>
        <div className="browser-bar" aria-hidden="true"><span>● ● ●</span><span>{project.name.toLowerCase()} / dashboard</span><ArrowUpRight size={12}/></div>
        <motion.img src={project.screenshots[0].src} alt={project.screenshots[0].alt} loading="lazy" decoding="async" width={project.screenshots[0].width} height={project.screenshots[0].height} style={{ y: reduce ? 0 : offset }}/>
      </motion.div>
      {project.detailScreenshot && <div className="detail-preview"><img src={project.detailScreenshot.src} alt={project.detailScreenshot.alt} width={project.detailScreenshot.width} height={project.detailScreenshot.height} loading="lazy" decoding="async"/></div>}
      </>}
      <span className="stage-bottom mono">DESIGNED TO MAKE DATA USEFUL</span>
    </Reveal>
    <div className="project-copy"><Reveal><h3><a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${project.name} (opens in a new tab)`}>{project.name}</a></h3><h4>{project.headline}</h4>{project.credit&&<p className="project-credit">{project.credit}</p>}{project.contribution&&<p>{project.contribution}</p>}</Reveal><Reveal delay={.08}>
      <span className="mono project-type">{project.type}</span><p>{project.description}</p>
      {project.technicalDescription&&<details className="project-details"><summary>How it works &amp; key features <Plus size={14}/></summary><p>{project.technicalDescription}</p><ul>{project.keyFeatures.map(feature=><li key={feature}>{feature}</li>)}</ul></details>}
      <ul className="tags" aria-label={`${project.name} technologies`}>{project.tags.map(tag=><li key={tag}>{tag}</li>)}</ul>
      <div className="project-links"><a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={`${project.websiteLabel}: ${project.name} (opens in a new tab)`}>{project.websiteLabel} <ArrowUpRight size={15}/></a>{project.repositoryUrl&&<a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label={`GitHub repository for ${project.name} (opens in a new tab)`}>GitHub <ArrowUpRight size={15}/></a>}</div>
    </Reveal></div>
  </article>;
}
function wantsLessData(){
  return matchMedia('(prefers-reduced-data: reduce)').matches||!!(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData;
}
function App() {
  useMagneticLinks();
  const [reduce,setReduce] = useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [saveData, setSaveData] = useState(() => wantsLessData());
  const staticMode=!!reduce||saveData;
  const [loading, setLoading] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches&&!wantsLessData());
  const finishIntro=useCallback(()=>{
    finishIntroPosition();
    setLoading(false);
  },[]);
  useEffect(()=>{
    const query=matchMedia('(prefers-reduced-data: reduce)');
    const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
    const connection=(navigator as Navigator & {connection?: EventTarget & {saveData?:boolean}}).connection;
    const change=()=>{setSaveData(wantsLessData());setReduce(motionQuery.matches);};
    query.addEventListener('change',change);motionQuery.addEventListener('change',change);connection?.addEventListener('change',change);
    return ()=>{query.removeEventListener('change',change);motionQuery.removeEventListener('change',change);connection?.removeEventListener('change',change);};
  },[]);
  useEffect(()=>{ if(staticMode)finishIntro(); },[staticMode,finishIntro]);
  // A stalled asset or renderer must never leave the page locked behind the intro.
  useEffect(()=>{if(!loading)return;const fallback=window.setTimeout(finishIntro,9000);return()=>window.clearTimeout(fallback);},[loading,finishIntro]);
  const [open, setOpen] = useState<number | null>(0);

  return <MotionConfig reducedMotion="user"><div className={`site ${loading?'intro-running':''}`} onFocusCapture={()=>{if(loading)finishIntro();}}>
    <a className="skip" href="#main">Skip to content</a><ScrollProgress/>
    <Navigation/>
    <main id="main"><section className="hero portrait-hero" id="home" aria-labelledby="hero-title">
      <PortraitHero active={loading} staticMode={staticMode} onFinish={finishIntro}/>
      <motion.div className="hero-content" initial={{opacity:staticMode?0:1}} animate={{opacity:1}} transition={{duration:.18}}>
        <div className="hero-top mono"><span className="hero-location"><span className="location-asterisk" aria-hidden="true">✳</span>{profile.location.toUpperCase()}</span></div>
        <div className="hero-identity">
          <h1 id="hero-title" tabIndex={-1} aria-label={profile.name}><span className="chrome">{profile.displayName[0]}</span><span className="chrome">{profile.displayName[1]}<span className="hero-period">.</span></span></h1>
          <p className="hero-role">{profile.title} <span>· {profile.specialization}</span></p>
        </div>
        <div className="hero-bottom"><p>{profile.heroDescription}</p><a className="round-link" href="#work"><span>EXPLORE MY WORK</span><span className="round-icon"><ArrowDown size={19}/></span></a></div>
        <div className="hero-foot mono"><span>CODE WITH PURPOSE. BUILD WITH CURIOSITY.</span><span>SCROLL TO DISCOVER ↓</span></div>
      </motion.div>
    </section>
      <section id="work" className="work section-pad" aria-labelledby="work-title"><Reveal className="section-heading"><div><span className="eyebrow mono">{sectionEyebrow('work')}</span><h2 id="work-title">Data. Design.<br/><span>Real-world context.</span></h2></div><p>{profile.selectedWorkIntroduction}</p></Reveal>{projects.map((project,index)=><Project key={project.id} project={project} index={index}/>)}</section>
      <div className="ticker" role="region" aria-label={`Technologies: ${profile.technologyTicker.join(', ')}`}><div className="ticker-track" aria-hidden="true">{[0,1].map(i=><span key={i}>{profile.technologyTicker.map(technology=><React.Fragment key={technology}>{technology.toUpperCase()} <b>✳</b> </React.Fragment>)}</span>)}</div></div>
      <section className="capabilities section-pad" aria-labelledby="cap-title"><Reveal className="cap-intro"><span className="eyebrow mono">WHAT I BRING</span><h2 id="cap-title">From an idea<br/>to <span>real use.</span></h2><p>A growing toolkit, put into practice.<br/>Here’s how I approach the work.</p></Reveal><div className="accordion">{profile.capabilities.map(({number,title,description,tools},i)=><div className={`capability ${open===i?'is-open':''}`} key={title}><h3><button id={`cap-button-${i}`} aria-expanded={open===i} aria-controls={`cap-panel-${i}`} onClick={()=>setOpen(open===i?null:i)}><span className="mono">{number}</span><span>{title}</span>{open===i?<Minus size={20}/>:<Plus size={20}/>}</button></h3><div id={`cap-panel-${i}`} role="region" aria-labelledby={`cap-button-${i}`} hidden={open!==i}><p>{description}</p><span className="mono cap-tools">{tools}</span></div></div>)}</div></section>
      <section className="about section-pad" id="about" aria-labelledby="about-title"><Reveal className="about-mark" aria-hidden="true"><img className="about-brand" src="/branding/rlwork-footer-silver.webp" width="640" height="656" alt="" loading="lazy"/><span className="mono">ALWAYS A WORK IN PROGRESS.</span></Reveal><Reveal className="about-copy"><span className="eyebrow mono">{sectionEyebrow('about')}</span><h2 id="about-title">Curiosity drives it.<br/><span>Building makes it real.</span></h2><p>{profile.aboutDescription}</p><p>{profile.aboutShortDescription}</p><a className="text-link" href={profile.githubUrl} target="_blank" rel="noopener noreferrer">More of what I’m building <Github size={17}/><ArrowUpRight size={16}/><span className="sr-only"> on GitHub (opens in a new tab)</span></a><a className="text-link resume-about" href={resume.url} target="_blank" rel="noopener noreferrer" aria-label={resume.accessibleLabel}>View Full Resume <ArrowUpRight aria-hidden="true" size={17}/></a></Reveal></section>
      <Credentials/>
      <section id="experience" className="experience section-pad" aria-labelledby="experience-title">
        <Reveal className="section-heading"><div><span className="eyebrow mono">{sectionEyebrow('experience')}</span><h2 id="experience-title">Experience</h2></div></Reveal>
        <div className="experience-list">{experience.map(entry=><Reveal key={entry.id} className="experience-entry"><h3>{entry.title}</h3><div className="experience-meta"><span className="experience-organization">{entry.organization}</span><time dateTime={entry.startDate}>{entry.dates}</time><span className="experience-category mono">{entry.category}</span></div></Reveal>)}</div>
      </section>
      <GameSection/>
      <section className="contact section-pad" id="contact" aria-labelledby="contact-title"><Reveal><span className="eyebrow mono">{sectionEyebrow('contact')}</span><div className="contact-pre mono"><span><i className="status-dot"/> GOOD WORK STARTS WITH A CONVERSATION</span><span>LET’S MAKE SOMETHING USEFUL.</span></div><h2 className="dot-type" id="contact-title">LET’S<br/>CONNECT<span>↗</span></h2><div className="contact-bottom"><p>Have a question, an idea, or a project in mind?<br/><span>Find me on GitHub. Let’s start there.</span></p><div className="contact-socials"><a className="contact-link social-link" href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${profile.name} on LinkedIn (opens in a new tab)`}>LinkedIn <ArrowUpRight aria-hidden="true" size={23}/></a><a className="contact-link" href={profile.githubUrl} target="_blank" rel="noopener noreferrer">Say hello on GitHub <ArrowUpRight size={23}/><span className="sr-only"> (opens in a new tab)</span></a><ResumeActions/></div></div></Reveal></section>
    </main><footer><span className="footer-brand"><img src="/branding/rlwork-footer-silver.webp" width="640" height="656" alt="RLwork" loading="lazy" decoding="async"/></span><span className="mono">© {new Date().getFullYear()} {profile.name.toUpperCase()}</span><div className="footer-links"><a className="social-link" href={profile.githubUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${profile.name} on GitHub (opens in a new tab)`}>GitHub <ArrowUpRight aria-hidden="true" size={12}/></a><a className="social-link" href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${profile.name} on LinkedIn (opens in a new tab)`}>LinkedIn <ArrowUpRight aria-hidden="true" size={12}/></a><ResumeActions/><a href="#home" className="mono">BACK TO TOP <ArrowUp size={14}/></a></div></footer><a className="connect-pill" href="#contact"><span className="status-dot"/> Let’s connect <ArrowUpRight size={16}/></a><Cursor/>
  </div></MotionConfig>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
