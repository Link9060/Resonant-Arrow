import React,{useEffect,useMemo,useRef}from'react';
import{ArrowMark}from'./ArrowMark';

function seeded(seed){
  let s=seed|0;
  return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296};
}

export function LostArrowField({converging=false}){
  const arrows=useMemo(()=>{
    const rnd=seeded(9060);
    return Array.from({length:68},(_,i)=>{
      const depth=rnd();
      return{
        id:i,left:rnd()*100,top:rnd()*100,size:9+depth*21,
        opacity:.035+depth*.13,blur:(1-depth)*1.15,
        dx1:(rnd()-.5)*150,dy1:(rnd()-.5)*130,
        dx2:(rnd()-.5)*190,dy2:(rnd()-.5)*160,
        r0:rnd()*360,r1:(rnd()-.5)*900,r2:(rnd()-.5)*1200,
        dur:7+rnd()*12,delay:-rnd()*14
      };
    });
  },[]);
  return <div className={'lostField'+(converging?' convergence':'')} aria-hidden="true">
    {arrows.map(a=><ArrowMark key={a.id} size={a.size} className="lostArrow" style={{
      left:a.left+'%',top:a.top+'%',opacity:converging?Math.min(.24,a.opacity*1.35):a.opacity,
      filter:'blur('+a.blur+'px)',
      '--dx1':a.dx1+'px','--dy1':a.dy1+'px','--dx2':a.dx2+'px','--dy2':a.dy2+'px',
      '--r0':a.r0+'deg','--r1':a.r1+'deg','--r2':a.r2+'deg',
      '--dur':a.dur+'s','--delay':a.delay+'s'
    }}/>)}
  </div>;
}

export function AmbientCanvas({scene}){
  const canvasRef=useRef(null);
  useEffect(()=>{
    const c=canvasRef.current,ctx=c.getContext('2d');
    if(!ctx)return;
    let frame=0,w=innerWidth,h=innerHeight,last=performance.now();
    const rnd=seeded(5005);
    const dust=Array.from({length:360},()=>({
      x:(rnd()-.5)*2,y:(rnd()-.5)*2,z:rnd()*.98+.02,
      s:.25+rnd()*1.15,drift:(rnd()-.5)*.001
    }));
    const resize=()=>{
      w=innerWidth;h=innerHeight;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
      c.style.width=w+'px';c.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();addEventListener('resize',resize);
    const draw=now=>{
      const dt=Math.min(.05,(now-last)/1000);last=now;
      ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);
      const travel=scene===3 ? 1 : scene===2 ? .42 : scene===4 ? .18 : scene===8 ? .08 : .025;
      const alphaBase=scene===3 ? .36 : scene===2 ? .24 : .12;
      for(const p of dust){
        p.z-=travel*dt*.44;p.x+=p.drift*dt*18;
        if(p.z<.018){p.z=1;p.x=(rnd()-.5)*2;p.y=(rnd()-.5)*2}
        const scale=1/p.z,x=p.x*w*.52*scale,y=p.y*h*.54*scale;
        const prev=Math.min(1,p.z+travel*.05);
        const px=p.x*w*.52/prev,py=p.y*h*.54/prev;
        const a=Math.min(.72,alphaBase+(1-p.z)*.34);
        if(scene===3||scene===2){
          ctx.strokeStyle='rgba(220,232,255,'+a+')';ctx.lineWidth=p.s;
          ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();
        }else{
          ctx.globalAlpha=a;ctx.fillStyle='#eaf1ff';ctx.fillRect(x,y,p.s,p.s);
        }
      }
      ctx.globalAlpha=1;ctx.restore();
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize)};
  },[scene]);
  return <canvas ref={canvasRef} className="ambientCanvas"/>;
}
