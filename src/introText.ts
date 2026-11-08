/** Shared mask typography in CSS pixels; DPR is only applied to the visible Canvas. */
export const INTRO_TEXT = {
  phrases:['RICH DANIEL','LIM','PORTFOLIO'],
  family:'"Barlow Condensed", sans-serif',weight:800,
  minRem:4.5,viewportRatio:.14,maxRem:13,lineHeight:.85,letterSpacingEm:-.05,
  safe:26,minimumStep:2,samplesAcross:480,
} as const;
export interface IntroTextTarget{x:number;y:number;brightness:number;radius:number;face:false;order:number}
type Ink={left:number;right:number;ascent:number;descent:number};
type TrackedContext=CanvasRenderingContext2D&{letterSpacing:string};
const supportsTracking=(context:CanvasRenderingContext2D)=>typeof (context as Partial<TrackedContext>).letterSpacing==='string';
function typography(context:CanvasRenderingContext2D,size:number){
  context.font=`${INTRO_TEXT.weight} ${size}px ${INTRO_TEXT.family}`;
  context.textAlign='left';context.textBaseline='alphabetic';
  if(supportsTracking(context))(context as TrackedContext).letterSpacing=`${size*INTRO_TEXT.letterSpacingEm}px`;
}
function ink(context:CanvasRenderingContext2D,phrase:string,size:number):Ink{
  const native=supportsTracking(context);
  const metrics=(text:string)=>{const m=context.measureText(text);return {left:-(m.actualBoundingBoxLeft??0),right:m.actualBoundingBoxRight??m.width,ascent:m.actualBoundingBoxAscent??size*.72,descent:m.actualBoundingBoxDescent??0};};
  if(native)return metrics(phrase);
  let left=Infinity,right=-Infinity,ascent=0,descent=0;
  [...phrase].forEach((char,index)=>{const m=metrics(char),x=glyphX(context,phrase,index,size);left=Math.min(left,x+m.left);right=Math.max(right,x+m.right);ascent=Math.max(ascent,m.ascent);descent=Math.max(descent,m.descent);});
  return {left,right,ascent,descent};
}
function glyphX(context:CanvasRenderingContext2D,phrase:string,index:number,size:number){
  return context.measureText(phrase.slice(0,index+1)).width-context.measureText(phrase[index]).width+index*size*INTRO_TEXT.letterSpacingEm;
}
function paint(context:CanvasRenderingContext2D,phrase:string,x:number,baseline:number,size:number){
  if(supportsTracking(context))context.fillText(phrase,x,baseline);
  else [...phrase].forEach((char,index)=>context.fillText(char,x+glyphX(context,phrase,index,size),baseline));
}
export function sampleIntroWords(width:number,height:number,budget:number){
  const buffer=document.createElement('canvas');buffer.width=Math.round(width);buffer.height=Math.round(height);
  const context=buffer.getContext('2d',{willReadFrequently:true});
  if(!context||budget<1)return INTRO_TEXT.phrases.map(()=>({points:[] as IntroTextTarget[],metrics:null}));
  const rem=parseFloat(getComputedStyle(document.documentElement).fontSize)||16;
  const startingSize=Math.max(INTRO_TEXT.minRem*rem,Math.min(width*INTRO_TEXT.viewportRatio,INTRO_TEXT.maxRem*rem));
  const measure=(size:number)=>{typography(context,size);return INTRO_TEXT.phrases.map(phrase=>ink(context,phrase,size));};
  const fits=(boxes:Ink[],size:number)=>Math.max(...boxes.map(box=>box.right-box.left))<=width-INTRO_TEXT.safe*2&&Math.max(Math.max(...boxes.map(box=>box.ascent))+Math.max(...boxes.map(box=>box.descent)),size*INTRO_TEXT.lineHeight)<=height-INTRO_TEXT.safe*2;
  // A narrow/short viewport reduces the entire family together, never a single word.
  let fontSize=startingSize,boxes=measure(fontSize);
  if(!fits(boxes,fontSize)){let low=1,high=startingSize;for(let i=0;i<24;i++){const mid=(low+high)/2;if(fits(measure(mid),mid))low=mid;else high=mid;}fontSize=low;boxes=measure(fontSize);}
  typography(context,fontSize);
  const ascent=Math.max(...boxes.map(box=>box.ascent)),descent=Math.max(...boxes.map(box=>box.descent));
  const capital=ink(context,'H',fontSize),capitalHeight=capital.ascent+capital.descent;
  const lineBoxHeight=fontSize*INTRO_TEXT.lineHeight,lineTop=(height-lineBoxHeight)/2;
  const baseline=lineTop+(lineBoxHeight+capital.ascent-capital.descent)/2;
  const top=baseline-capital.ascent;
  const inkTop=baseline-ascent,inkBottom=baseline+descent;
  const masks=INTRO_TEXT.phrases.map((phrase,index)=>{
    context.clearRect(0,0,width,height);context.fillStyle='#fff';
    const box=boxes[index],x=width/2-(box.left+box.right)/2;
    paint(context,phrase,x,baseline,fontSize);
    return {phrase,box,left:x+box.left,pixels:context.getImageData(0,0,buffer.width,buffer.height).data};
  });
  let step=Math.max(INTRO_TEXT.minimumStep,width/INTRO_TEXT.samplesAcross),sampled:IntroTextTarget[][]=[];
  for(let attempt=0;attempt<10;attempt++){
    const radius=Math.min(1.55,Math.max(.65,step*.28));
    sampled=masks.map(mask=>{
      const points:IntroTextTarget[]=[],right=mask.left+mask.box.right-mask.box.left;
      // All phrases share the same vertical rows and viewport-centered sampling lattice.
      const x0=width/2+Math.ceil((mask.left-2-width/2)/step)*step;
      const rows=Math.max(1,Math.ceil(capitalHeight/step));
      for(let row=0;row<=rows;row++)for(let x=x0;x<=right+2;x+=step){
        const y=top+row*capitalHeight/rows;
        // Optical overshoot belongs to the shared edge cells, not extra rows for curved glyphs.
        // No glyph pixels are cropped, and no word receives a different coordinate scale.
        const probeTop=row===0?Math.floor(inkTop)-1:row===rows?Math.floor(y-step/2):Math.floor(y);
        const probeBottom=row===0?Math.ceil(y+step/2):row===rows?Math.ceil(inkBottom)+1:Math.floor(y);
        let filled=false;
        for(let py=probeTop;py<=probeBottom;py++)if(mask.pixels[(py*buffer.width+Math.floor(x))*4+3]>=120){filled=true;break;}
        if(!filled)continue;
        const hash=Math.sin(x*12.9898+y*78.233)*43758.5453;
        points.push({x,y,brightness:1,radius,face:false,order:hash-Math.floor(hash)});
      }
      return points;
    });
    const count=Math.max(...sampled.map(points=>points.length));if(count<=budget)break;
    step=Math.max(step+.15,step*Math.sqrt(count/budget)*1.015);
  }
  return masks.map((mask,index)=>({points:sampled[index].sort((a,b)=>a.order-b.order),metrics:{phrase:mask.phrase,font:context.font,fontSize,weight:INTRO_TEXT.weight,lineHeight:INTRO_TEXT.lineHeight,letterSpacing:fontSize*INTRO_TEXT.letterSpacingEm,baseline,capitalHeight,width:mask.box.right-mask.box.left,height:capitalHeight,inkHeight:mask.box.ascent+mask.box.descent,lineBoxHeight,left:mask.left,top,ratio:(mask.box.right-mask.box.left)/width,step,radius:sampled[index][0]?.radius??0,count:sampled[index].length}}));
}
