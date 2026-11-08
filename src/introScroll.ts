/** One page-load guard. Ordinary same-page navigation never starts this again. */
let locked=false,releaseFrame=0;
let previousStyles:Record<string,string>={};
const keys=['overflow','overscrollBehavior','scrollbarGutter'] as const;
const top=()=>window.scrollTo({top:0,left:0,behavior:'instant'});
const clearHash=()=>{if(location.hash)history.replaceState(history.state,'',location.pathname+location.search);};
const holdTop=()=>{if(locked&&(scrollY!==0||scrollX!==0))top();};
export const isIntroInitializing=()=>locked;
export function keepIntroAtHome(){if(!locked)return;clearHash();top();}
export function initializeIntroScroll(){
  if(locked)return;
  locked=true;history.scrollRestoration='manual';
  const root=document.documentElement;previousStyles=Object.fromEntries(keys.map(key=>[key,root.style[key]]));
  root.style.scrollbarGutter='stable';root.style.overflow='hidden';root.style.overscrollBehavior='none';
  clearHash();top();window.addEventListener('scroll',holdTop,{passive:true});window.addEventListener('pageshow',holdTop);
}
export function finishIntroPosition(){
  if(!locked)return;
  keepIntroAtHome();
  if(releaseFrame)return;
  releaseFrame=requestAnimationFrame(()=>{
    top();keys.forEach(key=>{document.documentElement.style[key]=previousStyles[key];});
    top();locked=false;releaseFrame=0;history.scrollRestoration='auto';
    window.removeEventListener('scroll',holdTop);window.removeEventListener('pageshow',holdTop);
  });
}
