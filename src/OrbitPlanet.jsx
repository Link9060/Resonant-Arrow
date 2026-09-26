import React,{useEffect,useMemo,useRef}from'react';
import{ArrowMark}from'./ArrowMark';
import{createCloudRenderer,drawOrbitSegments,fitCanvas,projectAnchor,projectPoint}from'./orbit-system';

export const ARROW_DESTINATIONS=[
  {id:'atlas',name:'ATLAS',code:'NAVIGATION',anchor:[-0.82,-0.42,0.38]},
  {id:'ravin',name:'RAVIN',code:'INTELLIGENCE',anchor:[0.48,-0.7,0.52]},
  {id:'relay',name:'RELAY',code:'COMMUNICATION',anchor:[0.76,0.5,0.34]},
  {id:'waypoint',name:'WAYPOINT',code:'INTENTION',anchor:[-0.62,0.56,-0.55]},
];

export function OrbitPlanet({
  active=true,
  introMix=1,
  showDestinations=false,
  showCore=false,
  showCraft=true,
  className=''
}){
  const canvasRef=useRef(null);
  const shellRef=useRef(null);
  const craftRef=useRef(null);
  const nodeRefs=useRef({});
  const linkRefs=useRef({});

  // Matches Orbit's default "balanced" render profile.
  const renderer=useMemo(()=>createCloudRenderer(false,{density:.72,size:1.02}),[]);

  useEffect(()=>{
    const canvas=canvasRef.current,shell=shellRef.current;
    if(!canvas||!shell)return;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;

    let frame=0,running=true,width=1,height=1,last=performance.now(),paused=document.hidden;
    let yaw=0,craftAngle=-.8;
    const pointer={x:0,y:0,inside:false};

    const move=e=>{
      const r=shell.getBoundingClientRect();
      pointer.x=e.clientX-r.left;
      pointer.y=e.clientY-r.top;
      pointer.inside=true;
    };
    const leave=()=>{pointer.inside=false};
    shell.addEventListener('pointermove',move);
    shell.addEventListener('pointerleave',leave);
    const onVisibility=()=>{paused=document.hidden;last=performance.now();if(!paused&&!frame)frame=requestAnimationFrame(draw)};
    document.addEventListener('visibilitychange',onVisibility);

    const resize=()=>{
      const b=shell.getBoundingClientRect();
      width=Math.max(1,b.width);
      height=Math.max(1,b.height);
      fitCanvas(canvas,ctx,width,height);
    };
    const observer=new ResizeObserver(resize);
    observer.observe(shell);
    resize();

    const draw=now=>{
      frame=0;
      if(!running||paused)return;
      const dt=Math.min(.05,Math.max(0,(now-last)/1000));
      last=now;
      const time=now/1000;
      yaw+=dt*.052;
      craftAngle+=dt*.24;
      ctx.clearRect(0,0,width,height);

      const centerX=width*.5;
      const centerY=height*.5;
      const nx=pointer.inside?(pointer.x-centerX)/Math.max(1,width*.5):0;
      const ny=pointer.inside?(pointer.y-centerY)/Math.max(1,height*.5):0;
      const hover=pointer.inside?1:0;
      const worldPitch=Math.sin(time*.14)*.028;
      const worldRoll=Math.sin(time*.09)*.016;
      const worldScale=(width<720?.9:1.12)*(0.94+introMix*.06);
      const sphereRadius=Math.min(width*.228,height*.258,292)*worldScale;

      drawOrbitSegments(ctx,'back',yaw,worldPitch,worldRoll,sphereRadius,centerX,centerY);
      renderer(ctx,centerX,centerY,width,time,true,{
        mx:nx,my:ny,hover,
        pointerX:pointer.x-centerX,
        pointerY:pointer.y-centerY,
        scale:worldScale,
        alpha:active?1:.35,
        yaw,pitch:worldPitch,roll:worldRoll,
      });
      drawOrbitSegments(ctx,'front',yaw,worldPitch,worldRoll,sphereRadius,centerX,centerY);

      if(showDestinations){
        for(const d of ARROW_DESTINATIONS){
          const p=projectAnchor(d.anchor,yaw,worldPitch,worldRoll,sphereRadius,centerX,centerY);
          const depth=Math.max(0,Math.min(1,p.depth));
          const node=nodeRefs.current[d.id];
          const link=linkRefs.current[d.id];

          if(node){
            node.style.transform='translate3d('+p.x+'px,'+p.y+'px,0) translate(-50%,-50%) scale('+(0.72+depth*.36)+')';
            node.style.opacity=String(active?(.18+depth*.78):0);
            node.style.zIndex=String(15+Math.round(depth*7));
            node.dataset.back=p.z<-.1?'true':'false';
          }
          if(link){
            const dx=p.x-centerX,dy=p.y-centerY;
            link.setAttribute('x1',String(centerX+dx*.2));
            link.setAttribute('y1',String(centerY+dy*.2));
            link.setAttribute('x2',String(centerX+dx*.84));
            link.setAttribute('y2',String(centerY+dy*.84));
            link.style.opacity=String(p.z>.02?.09+depth*.18:0);
          }
        }
      }

      if(showCraft&&craftRef.current){
        const craftAnchor=[
          Math.cos(craftAngle)*1.32,
          Math.sin(craftAngle*.7)*.23,
          Math.sin(craftAngle)*1.32,
        ];
        const nextAnchor=[
          Math.cos(craftAngle+.025)*1.32,
          Math.sin((craftAngle+.025)*.7)*.23,
          Math.sin(craftAngle+.025)*1.32,
        ];
        const cp=projectPoint(craftAnchor,yaw,worldPitch,worldRoll,sphereRadius,centerX,centerY);
        const np=projectPoint(nextAnchor,yaw,worldPitch,worldRoll,sphereRadius,centerX,centerY);
        const rot=Math.atan2(np.y-cp.y,np.x-cp.x)*180/Math.PI;
        const dist=Math.hypot(cp.x-centerX,cp.y-centerY);
        const behind=cp.z<0&&dist<sphereRadius*1.015;
        const occ=behind?Math.max(0,Math.min(1,(cp.z+.02)/.14)):1;

        craftRef.current.style.transform='translate3d('+cp.x+'px,'+cp.y+'px,0) translate(-50%,-50%) rotate('+rot+'deg) scale('+(0.76+cp.depth*.32)+')';
        craftRef.current.style.opacity=String(active?occ*(.55+cp.depth*.45):0);
        craftRef.current.style.zIndex=String(cp.z>=0?28:5);
      }

      frame=requestAnimationFrame(draw);
    };

    frame=requestAnimationFrame(draw);
    return()=>{
      running=false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      shell.removeEventListener('pointermove',move);
      shell.removeEventListener('pointerleave',leave);
      document.removeEventListener('visibilitychange',onVisibility);
    };
  },[active,introMix,renderer,showCraft,showDestinations]);

  return <div ref={shellRef} className={'orbitExactShell '+className}>
    <canvas ref={canvasRef} className="orbitExactCanvas"/>

    {showDestinations?<svg className="orbitExactLinks" aria-hidden="true">
      {ARROW_DESTINATIONS.map(d=><line key={d.id} ref={el=>linkRefs.current[d.id]=el}/>)}
    </svg>:null}

    {showCraft?<div className="orbitExactCraft" ref={craftRef}><ArrowMark size={22}/></div>:null}

    {showCore?<div className="orbitExactCore"><span>YOU ARE HERE</span><strong>Orbit</strong></div>:null}

    {showDestinations?<div className="orbitExactNodes">
      {ARROW_DESTINATIONS.map(d=><div key={d.id} ref={el=>nodeRefs.current[d.id]=el} className="orbitExactNode">
        <i/><span><small>{d.code}</small><b>{d.name}</b></span>
      </div>)}
    </div>:null}
  </div>;
}
