import {GAME,GAME_LETTERS} from './gameConfig';
export type Direction='up'|'down'|'left'|'right';
export type GamePhase='ready'|'playing'|'complete';
export type Obstacle={x:number;y:number;width:number;height:number};
export type Player={x:number;y:number;vx:number;vy:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export class GameModel{
  width=1;height=1;phase:GamePhase='ready';collected=0;speed=80;
  player:Player={x:0,y:0,vx:0,vy:0};
  keys=new Set<Direction>();
  targets:{x:number;y:number}[]=[];
  obstacles:Obstacle[]=[];
  resize(width:number,height:number){
    const oldWidth=this.width,oldHeight=this.height;
    this.width=Math.max(180,width);this.height=Math.max(160,height);
    const padding=Math.min(GAME.padding,this.width*.09,this.height*.11);
    this.targets=GAME_LETTERS.map(letter=>({x:padding+letter.u*(this.width-padding*2),y:padding+letter.v*(this.height-padding*2)}));
    this.obstacles=[{x:this.width*.44,y:this.height*.54,width:this.width*.15,height:Math.max(7,this.height*.018)},{x:this.width*.63,y:this.height*.26,width:Math.max(7,this.width*.009),height:this.height*.16}];
    const start={x:padding+.09*(this.width-padding*2),y:this.height*.48};
    let distance=0,previous=start;for(const target of this.targets){distance+=Math.hypot(target.x-previous.x,target.y-previous.y);previous=target;}
    this.speed=distance/GAME.nominalTravelSeconds;
    if(oldWidth<=1||this.phase==='ready')this.player={...start,vx:0,vy:0};
    else{this.player.x=clamp(this.player.x/oldWidth*this.width,GAME.playerRadius+5,this.width-GAME.playerRadius-5);this.player.y=clamp(this.player.y/oldHeight*this.height,GAME.playerRadius+5,this.height-GAME.playerRadius-5);this.player.vx=0;this.player.vy=0;}
    this.resolveObstacleOverlaps();
  }
  reset(){this.phase='ready';this.collected=0;this.keys.clear();this.resize(this.width,this.height);}
  start(){if(this.phase==='complete')this.reset();this.phase='playing';this.keys.clear();}
  private resolveObstacleOverlaps(){
    const r=GAME.playerRadius;
    for(const box of this.obstacles){
      if(this.player.x>box.x-r&&this.player.x<box.x+box.width+r&&this.player.y>box.y-r&&this.player.y<box.y+box.height+r){
        const options=[{d:Math.abs(this.player.x-(box.x-r)),x:box.x-r,y:this.player.y},{d:Math.abs(this.player.x-(box.x+box.width+r)),x:box.x+box.width+r,y:this.player.y},{d:Math.abs(this.player.y-(box.y-r)),x:this.player.x,y:box.y-r},{d:Math.abs(this.player.y-(box.y+box.height+r)),x:this.player.x,y:box.y+box.height+r}];
        const nearest=options.sort((a,b)=>a.d-b.d)[0];this.player.x=nearest.x;this.player.y=nearest.y;
      }
    }
  }
  step(delta:number):number|null{
    if(this.phase!=='playing')return null;
    const dt=clamp(delta,0,.04),r=GAME.playerRadius;
    let x=Number(this.keys.has('right'))-Number(this.keys.has('left')),y=Number(this.keys.has('down'))-Number(this.keys.has('up'));
    const length=Math.hypot(x,y);if(length){x/=length;y/=length;}
    const blend=1-Math.exp(-dt*(length?13:10));
    this.player.vx+=(x*this.speed-this.player.vx)*blend;this.player.vy+=(y*this.speed-this.player.vy)*blend;
    const oldX=this.player.x,oldY=this.player.y;
    this.player.x=clamp(oldX+this.player.vx*dt,r+5,this.width-r-5);
    for(const b of this.obstacles)if(this.player.y>b.y-r&&this.player.y<b.y+b.height+r&&this.player.x>b.x-r&&this.player.x<b.x+b.width+r){this.player.x=this.player.vx>=0?b.x-r:b.x+b.width+r;this.player.vx=0;}
    this.player.y=clamp(oldY+this.player.vy*dt,r+5,this.height-r-5);
    for(const b of this.obstacles)if(this.player.x>b.x-r&&this.player.x<b.x+b.width+r&&this.player.y>b.y-r&&this.player.y<b.y+b.height+r){this.player.y=this.player.vy>=0?b.y-r:b.y+b.height+r;this.player.vy=0;}
    const target=this.targets[this.collected];
    if(target&&Math.hypot(this.player.x-target.x,this.player.y-target.y)<r+GAME.letterRadius){
      const index=this.collected++;if(this.collected===GAME_LETTERS.length){this.phase='complete';this.player.vx=0;this.player.vy=0;this.keys.clear();}return index;
    }
    return null;
  }
}
