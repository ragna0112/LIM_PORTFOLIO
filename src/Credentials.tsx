import {sectionEyebrow} from './sections';
import {useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {ArrowUpRight,ArrowDown,X,ZoomIn,ZoomOut} from 'lucide-react';
import {credentials,resume,type Credential} from './projects';
import './credentials.css';

function CertificateLightbox({credential,onClose,opener}:{credential:Credential;onClose:()=>void;opener:HTMLElement|null}){
  const dialog=useRef<HTMLDialogElement>(null),closeButton=useRef<HTMLButtonElement>(null),viewer=useRef<HTMLDivElement>(null);
  const [zoom,setZoom]=useState(false);
  useLayoutEffect(()=>{
    const modal=dialog.current!,body=document.body,x=scrollX,y=scrollY;
    const keys=['position','top','left','width','overflow','paddingRight'] as const;
    const previous=Object.fromEntries(keys.map(key=>[key,body.style[key]]));
    const scrollbar=innerWidth-document.documentElement.clientWidth;
    body.style.position='fixed';body.style.top=`${-y}px`;body.style.left=`${-x}px`;body.style.width='100%';body.style.overflow='hidden';
    if(scrollbar)body.style.paddingRight=`${parseFloat(getComputedStyle(body).paddingRight)+scrollbar}px`;
    modal.showModal();closeButton.current?.focus({preventScroll:true});
    return()=>{modal.close();keys.forEach(key=>{body.style[key]=previous[key];});window.scrollTo({left:x,top:y,behavior:'instant'});opener?.focus({preventScroll:true});};
  },[opener]);
  const image=credential.certificate;
  return <dialog ref={dialog} className="certificate-lightbox" aria-labelledby="certificate-caption" aria-describedby="certificate-issuer" onKeyDown={event=>{if(event.key!=='Tab')return;const controls=[...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),[tabindex="0"],a[href]')];const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus({preventScroll:true});}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus({preventScroll:true});}}} onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <div className="certificate-header"><div><h3 id="certificate-caption">{credential.title}</h3><p id="certificate-issuer">{credential.issuer} · {credential.dateLabel}</p></div><button ref={closeButton} type="button" onClick={onClose} aria-label="Close certificate"><X size={18} aria-hidden="true"/> Close</button></div>
    <div ref={viewer} className={`certificate-viewer ${zoom?'is-zoomed':''}`} style={{'--certificate-width':`${image.width}px`} as CSSProperties} tabIndex={0} role="region" aria-label={zoom?'Full-size certificate. Scroll or pinch to explore.':'Complete certificate. Use Zoom in to read smaller details.'}>
      <img src={image.src} alt={image.alt} width={image.width} height={image.height} decoding="async"/>
    </div>
    <div className="certificate-controls"><span className="mono">{zoom?'SCROLL TO EXPLORE':'FULL CERTIFICATE'}</span><button type="button" aria-pressed={zoom} onClick={()=>{setZoom(!zoom);viewer.current?.scrollTo({left:0,top:0,behavior:'instant'});}}>{zoom?<ZoomOut aria-hidden="true" size={17}/>:<ZoomIn aria-hidden="true" size={17}/>} {zoom?'Fit certificate':'Zoom in'}</button></div>
  </dialog>;
}
export function Credentials(){
  const [selected,setSelected]=useState<Credential|null>(null),opener=useRef<HTMLElement|null>(null);
  const reduce=useReducedMotion();
  const open=(credential:Credential,trigger:HTMLElement)=>{opener.current=trigger;setSelected(credential);};
  return <section id="credentials" className="credentials section-pad" aria-labelledby="credentials-title">
    <div className="section-heading"><div><span className="eyebrow mono">{sectionEyebrow('credentials')}</span><h2 id="credentials-title">Credentials.</h2></div><p>Selected certificates and track completion.</p></div>
    <ul className="credential-list">{credentials.map((credential,index)=><motion.li className="credential-row" key={credential.id} data-credential={credential.id} initial={reduce?false:{opacity:0,y:12,clipPath:'inset(0 0 8% 0)'}} whileInView={{opacity:1,y:0,clipPath:'inset(-8px -8px -8px -8px)'}} viewport={{once:true,amount:.15}} transition={{duration:.5,delay:index*.045,ease:[.22,1,.36,1]}}>
      <span className="credential-year mono">{credential.issuedOn.slice(0,4)}</span>
      <div className="credential-copy"><span className="credential-issuer mono">{credential.issuer}</span><h3>{credential.title}</h3><time dateTime={credential.issuedOn}>{credential.dateLabel}</time></div>
      <button type="button" className="credential-preview" aria-label={`Preview ${credential.title} certificate from ${credential.issuer}`} onClick={event=>open(credential,event.currentTarget)}><img src={credential.certificate.previewSrc} alt={credential.certificate.alt} width={credential.certificate.previewWidth} height={credential.certificate.previewHeight} loading="lazy" decoding="async"/></button>
      <button type="button" className="credential-action" aria-label={`View Certificate: ${credential.title} from ${credential.issuer}`} onClick={event=>open(credential,event.currentTarget)}>View Certificate <ArrowUpRight aria-hidden="true" size={16}/></button>
    </motion.li>)}</ul>
    {selected&&<CertificateLightbox credential={selected} opener={opener.current} onClose={()=>setSelected(null)}/>}
  </section>;
}

export function ResumeActions(){
  return <span className="resume-actions"><a href={resume.url} target="_blank" rel="noopener noreferrer" aria-label={resume.accessibleLabel}>Resume <ArrowUpRight aria-hidden="true" size={14}/></a><a href={resume.url} download={resume.filename} aria-label="Download Rich Daniel Lim’s resume PDF">Download PDF <ArrowDown aria-hidden="true" size={14}/></a></span>;
}
