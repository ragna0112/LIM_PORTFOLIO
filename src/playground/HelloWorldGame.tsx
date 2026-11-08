import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {ArrowDown,ArrowLeft,ArrowRight,ArrowUp} from 'lucide-react';
import {GAME_LETTERS} from './gameConfig';
import {startGameEngine} from './gameEngine';
import type {Direction,GamePhase} from './gameModel';
import './playground.css';
export default function HelloWorldGame(){
  const focusAfterPause=useRef(false);
  const frame=useRef<HTMLDivElement>(null),startControl=useRef<HTMLButtonElement>(null),canvas=useRef<HTMLCanvasElement>(null),arena=useRef<HTMLDivElement>(null);
  const engine=useRef<ReturnType<typeof startGameEngine>>(null),clearReveal=useRef<ReturnType<typeof setTimeout>|null>(null);
  const reduced=useRef(matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [phase,setPhase]=useState<GamePhase>('ready'),[progress,setProgress]=useState(0),[skill,setSkill]=useState(''),[available,setAvailable]=useState(true),[paused,setPaused]=useState(false);
  useEffect(()=>{
    const query=matchMedia('(prefers-reduced-motion: reduce)');
    const change=()=>{reduced.current=query.matches;engine.current?.refresh();};query.addEventListener('change',change);
    const running=startGameEngine(canvas.current!,{
      root:frame.current!,reduced:()=>reduced.current,onPause:()=>setPaused(true),
      onCollect:index=>{
        setProgress(index+1);const item=GAME_LETTERS[index];setSkill(`${item.letter} collected · ${item.skill}`);
        if(clearReveal.current)clearTimeout(clearReveal.current);clearReveal.current=setTimeout(()=>setSkill(''),2300);
      },
      onComplete:()=>setPhase('complete'),
    });
    engine.current=running;if(!running)setAvailable(false);
    return()=>{running?.dispose();engine.current=null;if(clearReveal.current)clearTimeout(clearReveal.current);query.removeEventListener('change',change);};
  },[]);
  const start=(restart=false)=>{if(restart||phase==='complete'){setProgress(0);setSkill('');}setPaused(false);setPhase('playing');if(clearReveal.current)clearTimeout(clearReveal.current);engine.current?.start(restart);arena.current?.focus({preventScroll:true});};
  useLayoutEffect(()=>{if(paused&&focusAfterPause.current){focusAfterPause.current=false;startControl.current?.focus({preventScroll:true});}},[paused]);
  const stop=()=>{focusAfterPause.current=phase==='playing'&&!paused;engine.current?.pause();if(!focusAfterPause.current)startControl.current?.focus({preventScroll:true});};
  const continueToContact=(event:React.MouseEvent<HTMLAnchorElement>)=>{event.preventDefault();engine.current?.pause();const contact=document.getElementById('contact');if(contact){contact.tabIndex=-1;contact.focus({preventScroll:true});contact.scrollIntoView({behavior:reduced.current?'instant':'smooth',block:'start'});}};
  const directions:{direction:Direction;Icon:typeof ArrowUp}[]=[{direction:'up',Icon:ArrowUp},{direction:'left',Icon:ArrowLeft},{direction:'down',Icon:ArrowDown},{direction:'right',Icon:ArrowRight}];
  const word=GAME_LETTERS.map((item,index)=>index<progress?item.letter:'_');
  return <div className="game-frame" ref={frame} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();stop();}}}>
      <p id="game-instructions" className="sr-only">Move using WASD, arrow keys, or direction buttons. Collect the next highlighted letter in order. Escape pauses. Tab leaves the game normally.</p>
      <div className="game-toolbar"><span className="mono">{phase==='complete'?'HELLO WORLD':paused?'PAUSED · PROGRESS SAVED':'COLLECT THE LETTERS'}</span>{phase==='playing'&&<div><button className="game-secondary" onClick={()=>start(true)}>Restart</button><button className="game-secondary" onClick={stop} disabled={paused}>Stop</button></div>}</div>
      <div className="game-hud"><p className="game-progress" aria-label={`${progress} of 10 letters collected`}>{word.slice(0,5).join(' ')}<span/>{word.slice(5).join(' ')}</p><span className="mono game-next">{phase==='complete'?'10 / 10':`NEXT: ${GAME_LETTERS[progress]?.letter||'H'} · ${progress+1} / 10`}</span></div>
      <div className="game-arena" ref={arena} tabIndex={0} role="group" aria-label="Game arena. Move with arrow keys or WASD. Collect the highlighted next letter. Escape pauses.">
        <canvas className="playground-canvas" ref={canvas} role="img" aria-label="HELLO WORLD letter collection game" aria-describedby="game-instructions"/>
        {(phase==='ready'||(phase==='playing'&&paused)||!available)&&<div className="game-intro"><span className="mono">{paused?"TAKE YOUR TIME.":"CONNECT THE LETTERS."}</span><h3>{paused?"Ready to continue?":"HELLO WORLD"}</h3><p>{available?'Collect H E L L O  W O R L D':'Canvas is unavailable in this browser. You can still explore the portfolio.'}</p>{available&&<><p className="game-key-hint" >WASD / Arrow Keys · Touch controls below<br/>Collect the next letter. Escape pauses.</p><button ref={startControl} className="game-primary" onClick={()=>start()}>{paused?"Resume Game":"Start Game"} <ArrowRight aria-hidden="true" size={16}/></button></>}<a className="game-text-button" href="#contact" onClick={continueToContact}>Let’s Connect ↓</a></div>}
        {phase==='complete'&&<div className="game-completion"><h3 className="sr-only">HELLO WORLD</h3><p>Thanks for exploring my portfolio.</p><div><a className="game-primary" href="#contact" onClick={continueToContact}>Let’s Connect ↓</a><button ref={startControl} className="game-secondary" onClick={()=>start(true)}>Play Again</button></div></div>}
      </div>
      <div className="game-bottom"><div className="game-status"><p role="status" aria-live="polite" aria-atomic="true">{phase==='complete'?`${skill?`${skill}. `:''}HELLO WORLD. Thanks for exploring my portfolio.`:skill}</p><span className="mono">{phase==='playing'?'FOLLOW THE NEXT LETTER · ESC TO PAUSE':'NO SCORE. JUST CURIOSITY.'}</span></div>
        <div className="game-directions" role="group" aria-label="Movement controls">{directions.map(({direction,Icon})=><button key={direction} className={`game-direction direction-${direction}`} aria-label={`Move ${direction}`} disabled={phase!=='playing'||paused||!available} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);engine.current?.press(direction,true);}} onPointerUp={()=>engine.current?.press(direction,false)} onPointerCancel={()=>engine.current?.press(direction,false)} onLostPointerCapture={()=>engine.current?.press(direction,false)} onKeyDown={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();engine.current?.press(direction,true);}}} onKeyUp={event=>{if(event.key===' '||event.key==='Enter')engine.current?.press(direction,false);}} onBlur={()=>engine.current?.press(direction,false)}><Icon aria-hidden="true" size={19}/></button>)}</div>
      </div>
  </div>;
}
