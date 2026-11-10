import {useRef,useState,type FormEvent} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {ArrowUpRight,MapPin,Phone,Mail,Copy,Github} from 'lucide-react';
import {profile} from './projects';
import {ResumeActions} from './Credentials';
import {sectionEyebrow} from './sections';
import {CONTACT_LIMITS,validateContact,type ContactFields,type ContactErrors} from './contactValidation';
import './contact.css';
const email='richdaniel011206@gmail.com';
const empty={name:'',email:'',message:''};
export function Contact(){
 const reduce=useReducedMotion();
 const [fields,setFields]=useState<ContactFields>(empty),[errors,setErrors]=useState<ContactErrors>({}),[status,setStatus]=useState(''),[sending,setSending]=useState(false),[copyStatus,setCopyStatus]=useState('');
 const busy=useRef(false),honeypot=useRef<HTMLInputElement>(null),identity=useRef({content:'',id:''});
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy.current)return;
  const clean={name:fields.name.trim(),email:fields.email.trim(),message:fields.message.trim()};const invalid=validateContact(clean);setErrors(invalid);
  if(Object.keys(invalid).length){setStatus('Please check the highlighted fields.');document.getElementById(`contact-${Object.keys(invalid)[0]}`)?.focus();return;}
  busy.current=true;setSending(true);setStatus('Sending your message…');
  try{
   const content=JSON.stringify(clean);if(identity.current.content!==content)identity.current={content,id:crypto.randomUUID()};
   const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...clean,website:honeypot.current?.value??'',submissionId:identity.current.id}),signal:AbortSignal.timeout(20000)});
   const data=await response.json();if(!response.ok||data.message!=='Thanks! Your message has been sent.')throw new Error('Send failed');
   setStatus('Thanks! Your message has been sent.');setFields(empty);if(honeypot.current)honeypot.current.value='';identity.current={content:'',id:''};
  }catch{setStatus('Your message couldn’t be sent. Please try again or email me directly.');}
  finally{busy.current=false;setSending(false);}
 }
 async function copyEmail(){try{await navigator.clipboard.writeText(email);setCopyStatus('Email copied.');}catch{setCopyStatus('Couldn’t copy. Please use the email link.');}}
 return <section className="contact section-pad" id="contact" aria-labelledby="contact-title">
  <span className="eyebrow mono">{sectionEyebrow('contact')}</span>
  <motion.div data-reveal className="contact-grid" initial={reduce?false:{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.12}} transition={{duration:.5}}><div className="contact-details"><h2 id="contact-title">GET IN TOUCH</h2>
   <address><p><MapPin size={18} aria-hidden="true"/><span>Valenzuela City, Philippines</span></p><p><Phone size={18} aria-hidden="true"/><a href="tel:+639163424218">+63 916 342 4218</a></p><p><Mail size={18} aria-hidden="true"/><a href={`mailto:${email}`}>{email}</a></p></address>
   <button className="copy-email" type="button" onClick={copyEmail}><Copy size={14} aria-hidden="true"/> Copy Email</button><p className="copy-status" role="status">{copyStatus}</p>
   <div className="contact-socials"><a className="social-link" href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${profile.name} on LinkedIn (opens in a new tab)`}>LinkedIn <ArrowUpRight size={16} aria-hidden="true"/></a><a className="social-link" href={profile.githubUrl} target="_blank" rel="noopener noreferrer">Say hello on GitHub <Github size={16} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a><ResumeActions/></div>
  </div><div className="contact-form-column"><h3>Have something in mind?</h3><p>For internship opportunities, collaborations, or a conversation—send me a message.</p>
   <form onSubmit={submit} noValidate aria-busy={sending}>
    {(['name','email','message'] as const).map(key=><div className="contact-field" key={key}><label htmlFor={`contact-${key}`}>{key[0].toUpperCase()+key.slice(1)} <span aria-hidden="true">*</span></label>{key==='message'?<textarea id="contact-message" name="message" rows={6} required disabled={sending} maxLength={CONTACT_LIMITS.message} value={fields.message} onChange={event=>setFields({...fields,message:event.target.value})} aria-invalid={!!errors.message} aria-describedby={errors.message?'contact-message-error':undefined}/>:<input id={`contact-${key}`} name={key} type={key==='email'?'email':'text'} autoComplete={key} required disabled={sending} maxLength={CONTACT_LIMITS[key]} value={fields[key]} onChange={event=>setFields({...fields,[key]:event.target.value})} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`contact-${key}-error`:undefined}/>}<span className="field-error" id={`contact-${key}-error`}>{errors[key]}</span></div>)}
    <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label><input ref={honeypot} id="contact-website" name="website" tabIndex={-1} autoComplete="off"/></div>
    <button className="contact-submit" type="submit" disabled={sending}>{sending?'Sending…':'Send Message ↗'}</button><p className="form-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
   </form>
  </div></motion.div>
 </section>;
}
