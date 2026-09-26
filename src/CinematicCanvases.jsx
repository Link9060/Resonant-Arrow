import React,{useEffect,useRef}from'react';
import{ARROW_MARK_PATH}from'./ArrowMark';

function seeded(seed){
  let s=seed|0;
  return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296};
}

function fit(canvas,ctx){
  const w=innerWidth,h=innerHeight;
  const dpr=Math.min(devicePixelRatio||1,1.6);
  canvas.width=Math.round(w*dpr);
  canvas.height=Math.round(h*dpr);
  canvas.style.width=w+'px';
  canvas.style.height=h+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return{w,h};
}

export function LostArrowCanvas({mode='wander'}){
  const ref=useRef(null);
  const modeRef=useRef(mode);
  modeRef.current=mode;

  useEffect(()=>{
    const canvas=ref.current;
    const ctx=canvas?.getContext('2d');
    if(!ctx)return;

    let frame=0,last=performance.now(),started=performance.now(),size=fit(canvas,ctx),paused=document.hidden;
    const rnd=seeded(9060);
    const count=76;
    const path=new Path2D(ARROW_MARK_PATH);

    const arrows=Array.from({length:count},()=>({
      x:rnd()*size.w,
      y:rnd()*size.h,
      vx:(rnd()-.5)*(16+rnd()*32),
      vy:(rnd()-.5)*(14+rnd()*28),
      rot:rnd()*Math.PI*2,
      vr:(rnd()-.5)*(0.45+rnd()*1.25),
      scale:.52+rnd()*1.34,
      alpha:.075+rnd()*.20,
      depth:.35+rnd()*.9,
      phase:rnd()*Math.PI*2,
      swirl:(rnd()>.5?1:-1)*(0.6+rnd()*1.4),
    }));

    const resize=()=>{size=fit(canvas,ctx)};
    const visibility=()=>{
      paused=document.hidden;
      last=performance.now();
      if(!paused&&!frame)frame=requestAnimationFrame(loop);
    };
    addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',visibility);

    function drawArrow(a,alpha,scale,rot,x,y){
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(rot);
      ctx.scale(scale,scale);
      ctx.translate(-12,-12);
      ctx.fillStyle='rgba(225,233,245,'+alpha+')';
      ctx.shadowColor='rgba(155,190,255,'+(alpha*.42)+')';
      ctx.shadowBlur=10*a.depth;
      ctx.fill(path);
      ctx.restore();
    }

    function loop(now){
      frame=0;
      if(paused)return;
      const dt=Math.min(.034,Math.max(0,(now-last)/1000));
      last=now;
      const elapsed=(now-started)/1000;
      ctx.clearRect(0,0,size.w,size.h);

      const mx=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mx'))||0;
      const my=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--my'))||0;
      const converging=modeRef.current==='converge';
      const p=converging?Math.min(1,elapsed/5.9):0;
      const eased=p*p*(3-2*p);

      for(const a of arrows){
        if(!converging){
          const wanderX=Math.sin(now*.00042+a.phase)*7*a.depth;
          const wanderY=Math.cos(now*.00036+a.phase*1.3)*6*a.depth;
          a.vx+=Math.sin(now*.00031+a.phase)*dt*1.9;
          a.vy+=Math.cos(now*.00027+a.phase)*dt*1.7;
          const max=42*a.depth;
          a.vx=Math.max(-max,Math.min(max,a.vx));
          a.vy=Math.max(-max,Math.min(max,a.vy));
          a.x+=a.vx*dt;
          a.y+=a.vy*dt;
          a.rot+=a.vr*dt;
          if(a.x<-70)a.x=size.w+70;
          if(a.x>size.w+70)a.x=-70;
          if(a.y<-70)a.y=size.h+70;
          if(a.y>size.h+70)a.y=-70;
          const px=mx*18*(1-a.depth*.35);
          const py=my*14*(1-a.depth*.35);
          drawArrow(a,a.alpha,a.scale*a.depth,a.rot,a.x+wanderX-px,a.y+wanderY-py);
        }else{
          const cx=size.w*.5,cy=size.h*.5;
          const dx=a.x-cx,dy=a.y-cy;
          const radius=Math.hypot(dx,dy);
          const baseAngle=Math.atan2(dy,dx);
          const swirl=baseAngle+a.swirl*eased*3.6;
          const pull=1-eased;
          const x=cx+Math.cos(swirl)*radius*pull;
          const y=cy+Math.sin(swirl)*radius*pull;
          const nextP=Math.min(1,p+.012);
          const nextEased=nextP*nextP*(3-2*nextP);
          const nextSwirl=baseAngle+a.swirl*nextEased*3.6;
          const nextPull=1-nextEased;
          const nx=cx+Math.cos(nextSwirl)*radius*nextPull;
          const ny=cy+Math.sin(nextSwirl)*radius*nextPull;
          const tx=nx-x,ty=ny-y;
          const rot=Math.hypot(tx,ty)>.001?Math.atan2(ty,tx):Math.atan2(cy-y,cx-x);
          const alpha=a.alpha*(1-p*.7);
          const scale=a.scale*a.depth*(1-p*.82);
          drawArrow(a,alpha,scale,rot,x,y);
        }
      }

      frame=requestAnimationFrame(loop);
    }

    frame=requestAnimationFrame(loop);
    return()=>{
      cancelAnimationFrame(frame);
      removeEventListener('resize',resize);
      document.removeEventListener('visibilitychange',visibility);
    };
  },[]);

  return <canvas ref={ref} className="lost-arrow-canvas" aria-hidden="true"/>;
}

export function SpaceFieldCanvas({scene}){
  const ref=useRef(null);
  const sceneRef=useRef(scene);
  sceneRef.current=scene;

  useEffect(()=>{
    const canvas=ref.current;
    const ctx=canvas?.getContext('2d');
    if(!ctx)return;

    let frame=0,last=performance.now(),size=fit(canvas,ctx),paused=document.hidden;
    const rnd=seeded(5005);
    const lowPower=matchMedia('(max-width: 700px)').matches||((navigator.hardwareConcurrency||8)<=4);
    const points=Array.from({length:lowPower?280:520},()=>({
      x:(rnd()-.5)*2.2,
      y:(rnd()-.5)*2.2,
      z:.04+rnd()*.96,
      width:.25+rnd()*1.2,
      tone:.72+rnd()*.28,
    }));

    const resize=()=>{size=fit(canvas,ctx)};
    const visibility=()=>{
      paused=document.hidden;
      last=performance.now();
      if(!paused&&!frame)frame=requestAnimationFrame(loop);
    };
    addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',visibility);

    function config(s){
      if(s===2)return{speed:.36,alpha:.24,streak:1.2};
      if(s===3)return{speed:.86,alpha:.35,streak:2.6};
      if(s===4)return{speed:.14,alpha:.16,streak:.35};
      if(s===5)return{speed:.08,alpha:.12,streak:.18};
      if(s>=6&&s<=10)return{speed:.045,alpha:.095,streak:.08};
      if(s===11)return{speed:.025,alpha:.075,streak:.02};
      return{speed:.018,alpha:.065,streak:.02};
    }

    function loop(now){
      frame=0;
      if(paused)return;
      const dt=Math.min(.034,Math.max(0,(now-last)/1000));
      last=now;
      const cfg=config(sceneRef.current);
      ctx.clearRect(0,0,size.w,size.h);
      ctx.save();
      ctx.translate(size.w/2,size.h/2);
      ctx.globalCompositeOperation='lighter';

      for(const p of points){
        p.z-=cfg.speed*dt;
        if(p.z<=.025){
          p.z=1;
          p.x=(rnd()-.5)*2.2;
          p.y=(rnd()-.5)*2.2;
        }
        const current=1/p.z;
        const prior=1/Math.min(1,p.z+cfg.speed*dt*(10+cfg.streak*13));
        const x=p.x*size.w*.48*current;
        const y=p.y*size.h*.52*current;
        const px=p.x*size.w*.48*prior;
        const py=p.y*size.h*.52*prior;
        const a=Math.min(.78,cfg.alpha+(1-p.z)*.26)*p.tone;

        ctx.strokeStyle='rgba(210,225,255,'+a+')';
        ctx.lineWidth=p.width;
        ctx.beginPath();
        ctx.moveTo(px,py);
        ctx.lineTo(x,y);
        ctx.stroke();
      }

      ctx.restore();
      ctx.globalCompositeOperation='source-over';
      frame=requestAnimationFrame(loop);
    }

    frame=requestAnimationFrame(loop);
    return()=>{
      cancelAnimationFrame(frame);
      removeEventListener('resize',resize);
      document.removeEventListener('visibilitychange',visibility);
    };
  },[]);

  return <canvas ref={ref} className="space-field-canvas" aria-hidden="true"/>;
}

export function ImpactParticles({count=180,className='' }){
  const ref=useRef(null);

  useEffect(()=>{
    const canvas=ref.current;
    const ctx=canvas?.getContext('2d');
    if(!ctx)return;

    let frame=0,size=fit(canvas,ctx),start=performance.now();
    const rnd=seeded(1741);
    const parts=Array.from({length:count},()=>({
      angle:rnd()*Math.PI*2,
      speed:170+rnd()*820,
      life:.65+rnd()*1.65,
      delay:rnd()*.12,
      size:.8+rnd()*4.8,
      spin:rnd()*Math.PI*2,
      tangent:(rnd()-.5)*115,
    }));

    const resize=()=>{size=fit(canvas,ctx)};
    addEventListener('resize',resize,{passive:true});

    function loop(now){
      const t=(now-start)/1000;
      ctx.clearRect(0,0,size.w,size.h);
      const cx=size.w/2,cy=size.h/2;
      for(const p of parts){
        const local=t-p.delay;
        if(local<0||local>p.life)continue;
        const q=local/p.life;
        const dist=p.speed*local*(1-.22*q);
        const tx=-Math.sin(p.angle)*p.tangent*local;
        const ty=Math.cos(p.angle)*p.tangent*local;
        const x=cx+Math.cos(p.angle)*dist+tx;
        const y=cy+Math.sin(p.angle)*dist+ty;
        const a=(1-q)*(.35+.65*Math.sin(Math.min(1,q*3)*Math.PI*.5));
        ctx.save();
        ctx.translate(x,y);
        ctx.rotate(p.spin+local*4);
        ctx.fillStyle='rgba(235,243,255,'+a+')';
        ctx.shadowColor='rgba(160,195,255,'+(a*.6)+')';
        ctx.shadowBlur=14;
        ctx.fillRect(-p.size*.5,-p.size*2,p.size,p.size*4);
        ctx.restore();
      }
      if(t<3.2)frame=requestAnimationFrame(loop);
    }

    frame=requestAnimationFrame(loop);
    return()=>{
      cancelAnimationFrame(frame);
      removeEventListener('resize',resize);
    };
  },[count]);

  return <canvas ref={ref} className={'impact-particles '+className} aria-hidden="true"/>;
}
