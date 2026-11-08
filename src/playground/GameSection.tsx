import {sectionEyebrow} from '../sections';
import {Component,lazy,Suspense,useEffect,useRef,useState,type ReactNode} from 'react';
import './playground.css';
const HelloWorldGame=lazy(()=>import('./HelloWorldGame'));
class GameBoundary extends Component<{children:ReactNode},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className="game-placeholder"><p>The game could not be loaded. You can keep exploring below.</p><a href="#contact">Let’s Connect ↓</a></div>:this.props.children;}
}
export function GameSection(){
  const section=useRef<HTMLElement>(null),[near,setNear]=useState(false);
  useEffect(()=>{const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setNear(true);observer.disconnect();}},{rootMargin:'600px'});observer.observe(section.current!);return()=>observer.disconnect();},[]);
  return <section ref={section} id="game" className="game-section section-pad" aria-labelledby="game-title">
    <div className="section-heading"><div><span className="eyebrow mono">{sectionEyebrow('game')}</span><h2 id="game-title">HELLO WORLD</h2></div><p>A small interactive break. Collect the letters and uncover the tools behind my work.</p></div>
    <GameBoundary><Suspense fallback={<div className="game-placeholder"><p>Preparing HELLO WORLD…</p></div>}>{near?<HelloWorldGame/>:<div className="game-placeholder"><p>HELLO WORLD · An interactive break</p></div>}</Suspense></GameBoundary>
  </section>;
}
