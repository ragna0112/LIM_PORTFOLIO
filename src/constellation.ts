/** Separate background particles, sharing the portrait renderer's one animation loop. */
type Star={u:number;v:number;depth:number;phase:number;offsetX:number;offsetY:number;vx:number;vy:number;x:number;y:number};
type Edge={a:number;b:number;alpha:number;target:number;near:boolean};
export type FieldPointer={x:number;y:number;active:boolean};
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const seed=(n:number)=>{const v=Math.sin(n*127.1)*43758.5453;return v-Math.floor(v);};

export class Constellation {
  private width=1;
  private height=1;
  private time=0;
  private stars:Star[]=[];
  private edges=new Map<string,Edge>();
  private mobile=false;
  private distance=160;
  private pressure=0;
  private minimum=70;
  private pointerStrength=0;
  private stats={count:0,connections:0,nearConnections:0,comparisons:0,maxOffset:0,quality:'full'};

  resize(width:number,height:number){
    this.width=width;this.height=height;this.mobile=width<651;
    this.distance=this.mobile?88:width<1000?125:160;
    this.minimum=this.mobile?25:width<1000?45:70;
    const count=this.mobile?34:width<1000?60:96;
    const cols=Math.ceil(Math.sqrt(count*width/height)),rows=Math.ceil(count/cols);
    this.stars=Array.from({length:count},(_,i)=>({u:(i%cols+.12+seed(i+1)*.76)/cols,v:(Math.floor(i/cols)+.12+seed(i+71)*.76)/rows,depth:.2+seed(i+31)*.8,phase:seed(i+41)*Math.PI*2,offsetX:0,offsetY:0,vx:0,vy:0,x:0,y:0}));
    this.edges.clear();this.pressure=0;this.stats.quality='full';this.stats.count=count;
  }
  /** Sustained costly/dropped frames reduce background density, without changing the portrait. */
  observeFrame(costMs:number,intervalMs:number){
    const budget=this.mobile?1000/30:1000/60;
    const slow=costMs>budget*.74||intervalMs>budget*1.8;
    this.pressure=clamp(this.pressure+(slow?1:-.5),0,60);
    if(this.pressure>=45&&this.stars.length>this.minimum){
      const count=Math.max(this.minimum,Math.floor(this.stars.length*.8));
      const previous=this.stars;
      this.stars=Array.from({length:count},(_,i)=>previous[Math.floor(i*previous.length/count)]);this.edges.clear();this.pressure=0;this.stats.count=count;this.stats.quality='reduced';
    }
  }
  get metrics(){return {...this.stats,pointerStrength:this.pointerStrength};}
  private shade(x:number,y:number){
    // Darken behind the editorial name/role while leaving the outer field visible.
    return 1-.67*(1-smooth((x/this.width-.38)/.3))*smooth((y/this.height-.13)/.16)*(1-smooth((y/this.height-.84)/.16));
  }
  draw(ctx:CanvasRenderingContext2D,delta:number,pointer:FieldPointer|null,staticFrame=false){
    const dt=clamp(delta,0,.065);
    this.time+=staticFrame?0:dt;
    const blend=staticFrame?1:1-Math.exp(-dt*5);
    this.pointerStrength+=(pointer?.active?1-this.pointerStrength:-this.pointerStrength)*blend;
    const strength=staticFrame?0:this.pointerStrength;
    const radius=this.mobile?0:220;
    const cells=new Map<string,number[]>(),cellSize=this.distance+45;
    let maxOffset=0;
    this.stars.forEach((p,i)=>{
      const naturalX=p.u*this.width+Math.sin(this.time*.045+p.phase)*12*p.depth;
      const naturalY=p.v*this.height+Math.cos(this.time*.035+p.phase)*9*p.depth;
      let tx=0,ty=0;
      if(pointer&&strength>0){
        const ax=naturalX-pointer.x,ay=naturalY-pointer.y,d=Math.hypot(ax,ay);
        const force=(1-clamp(d/radius))**2*strength*(10+p.depth*13);
        if(d<radius&&d>0){tx=ax/d*force-ay/d*force*.1;ty=ay/d*force+ax/d*force*.1;}
      }
      if(!staticFrame){
        p.vx=(p.vx+(tx-p.offsetX)*42*dt)*Math.exp(-9*dt);p.vy=(p.vy+(ty-p.offsetY)*42*dt)*Math.exp(-9*dt);
        p.offsetX+=p.vx*dt;p.offsetY+=p.vy*dt;
      }
      p.x=clamp(naturalX+p.offsetX,3,this.width-3);p.y=clamp(naturalY+p.offsetY,3,this.height-3);
      maxOffset=Math.max(maxOffset,Math.hypot(p.offsetX,p.offsetY));
      const key=`${Math.floor(p.x/cellSize)},${Math.floor(p.y/cellSize)}`;
      const bucket=cells.get(key)||[];bucket.push(i);cells.set(key,bucket);
    });
    for(const edge of this.edges.values())edge.target=0;
    let comparisons=0;
    this.stars.forEach((p,i)=>{
      const cx=Math.floor(p.x/cellSize),cy=Math.floor(p.y/cellSize);
      const near=!!pointer&&Math.hypot(p.x-pointer.x,p.y-pointer.y)<240&&strength>.05;
      const candidates:{j:number;d:number}[]=[];
      const reach=this.distance+(near?45*strength:0);
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const j of cells.get(`${cx+dx},${cy+dy}`)||[]){
        if(j<=i)continue;
        comparisons++;const q=this.stars[j],d=Math.hypot(q.x-p.x,q.y-p.y);
        if(d<reach)candidates.push({j,d});
      }
      candidates.sort((a,b)=>a.d-b.d);
      for(const {j,d} of candidates.slice(0,near?5:2)){
        const q=this.stars[j],key=`${i}:${j}`;
        const light=near?strength:0;
        const target=(.095+.105*light)*Math.pow(1-d/reach,.75)*this.shade((p.x+q.x)/2,(p.y+q.y)/2);
        const edge=this.edges.get(key)||{a:i,b:j,alpha:0,target:0,near:false};
        edge.target=target;edge.near=near;this.edges.set(key,edge);
      }
    });
    let connections=0,nearConnections=0;
    ctx.lineWidth=.65;ctx.strokeStyle='#dedede';
    for(const [key,edge] of this.edges){
      edge.alpha+=(edge.target-edge.alpha)*blend;
      if(edge.alpha<.001&&edge.target===0){this.edges.delete(key);continue;}
      if(edge.alpha<.001)continue;
      const a=this.stars[edge.a],b=this.stars[edge.b];if(!a||!b)continue;
      ctx.globalAlpha=Math.min(.20,edge.alpha);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();connections++;if(edge.near)nearConnections++;
    }
    ctx.fillStyle='#eee';
    for(const p of this.stars){
      ctx.globalAlpha=(.08+p.depth*.20)*this.shade(p.x,p.y);
      ctx.beginPath();ctx.arc(p.x,p.y,.45+p.depth*.9,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    this.stats={...this.stats,count:this.stars.length,connections,nearConnections,comparisons,maxOffset};
  }
}
