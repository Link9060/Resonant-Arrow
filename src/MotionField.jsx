import React,{useEffect,useMemo,useRef}from'react';
import{ArrowMark}from'./ArrowMark';

function seeded(seed){
  let s=seed|0;
  return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296};
}

export function LostArrowField({converging=false}){
  const arrows=useMemo(()=>{
    const rnd=seeded(9060);
    return Array.from({length:84},(_,i)=>{
      const depth=rnd();
      return{
        id:i,
        left:3+rnd()*94,
        top:4+rnd()*90,
        size:11+depth*27,
        opacity:.07+depth*.18,
        blur:(1-depth)*.72,
        dx1:(rnd()-.5)*105,
        dy1:(rnd()-.5)*90,
        dx2:(rnd()-.5)*125,
        dy2:(rnd()-.5)*105,
        r0:rnd()*360,
        r1:(rnd()-.5)*760,
        r2:(rnd()-.5)*980,
        scale0:.72+depth*.42,
        scale1:.82+depth*.5,
        dur:6.2+rnd()*10.5,
        delay:-rnd()*16,
        pullDelay:rnd()*.55
      };
    });
  },[]);

  return <div className={'lostField'+(converging?' convergence':'')} aria-hidden="true">
    {arrows.map(a=><ArrowMark key={a.id} size={a.size} className="lostArrow" style={{
      left:a.left+'%',
      top:a.top+'%',
      opacity:converging?Math.min(.38,a.opacity*1.28):a.opacity,
      '--blur':a.blur+'px',
      '--dx1':a.dx1+'px','--dy1':a.dy1+'px',
      '--dx2':a.dx2+'px','--dy2':a.dy2+'px',
      '--r0':a.r0+'deg','--r1':a.r1+'deg','--r2':a.r2+'deg',
      '--s0':a.scale0,'--s1':a.scale1,
      '--to-x':(50-a.left)+'vw','--to-y':(50-a.top)+'vh',
      '--pull-delay':a.pullDelay+'s',
      '--dur':a.dur+'s','--delay':a.delay+'s'
    }}/>)}
  </div>;
}

export function AmbientCanvas({scene}){
  const canvasRef=useRef(null);

  useEffect(()=>{
    const c=canvasRef.current,ctx=c.getContext('2d');
    if(!ctx)return;

    let frame=0,w=innerWidth,h=innerHeight,last=performance.now(),paused=document.hidden;
    const rnd=seeded(5005);
    const dust=Array.from({length:430},()=>({
      x:(rnd()-.5)*2,
      y:(rnd()-.5)*2,
      z:rnd()*.98+.02,
      s:.3+rnd()*1.35,
      drift:(rnd()-.5)*.0012
    }));

    const resize=()=>{
      w=innerWidth;h=innerHeight;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      c.width=Math.round(w*dpr);
      c.height=Math.round(h*dpr);
      c.style.width=w+'px';
      c.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };

    const onVisibility=()=>{
      paused=document.hidden;
      last=performance.now();
      if(!paused&&!frame)frame=requestAnimationFrame(draw);
    };

    const draw=now=>{
      frame=0;
      if(paused)return;

      const dt=Math.min(.05,Math.max(0,(now-last)/1000));
      last=now;
      ctx.clearRect(0,0,w,h);
      ctx.save();
      ctx.translate(w/2,h/2);

      const travel=
        scene===3?1:
        scene===2?.46:
        scene===4?.2:
        scene>=6&&scene<=9?.07:
        scene===10?.05:.028;
      const alphaBase=scene===3?.4:scene===2?.27:scene===4?.16:.13;

      for(const p of dust){
        p.z-=travel*dt*.44;
        p.x+=p.drift*dt*18;
        if(p.z<.018){
          p.z=1;
          p.x=(rnd()-.5)*2;
          p.y=(rnd()-.5)*2;
        }

        const scale=1/p.z;
        const x=p.x*w*.52*scale;
        const y=p.y*h*.54*scale;
        const prev=Math.min(1,p.z+travel*.05);
        const px=p.x*w*.52/prev;
        const py=p.y*h*.54/prev;
        const a=Math.min(.78,alphaBase+(1-p.z)*.36);

        if(scene===3||scene===2){
          ctx.strokeStyle='rgba(220,232,255,'+a+')';
          ctx.lineWidth=p.s;
          ctx.beginPath();
          ctx.moveTo(px,py);
          ctx.lineTo(x,y);
          ctx.stroke();
        }else{
          ctx.globalAlpha=a;
          ctx.fillStyle='#eaf1ff';
          ctx.fillRect(x,y,p.s,p.s);
        }
      }

      ctx.globalAlpha=1;
      ctx.restore();
      frame=requestAnimationFrame(draw);
    };

    resize();
    addEventListener('resize',resize);
    document.addEventListener('visibilitychange',onVisibility);
    frame=requestAnimationFrame(draw);

    return()=>{
      if(frame)cancelAnimationFrame(frame);
      removeEventListener('resize',resize);
      document.removeEventListener('visibilitychange',onVisibility);
    };
  },[scene]);

  return <canvas ref={canvasRef} className="ambientCanvas"/>;
}
