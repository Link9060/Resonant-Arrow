import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ARROW_MARK_PATH } from './ArrowMark';

const TAU=Math.PI*2;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const p=clamp(v);return p*p*(3-2*p);};
const mix=(a,b,p)=>a+(b-a)*p;
const fract=v=>v-Math.floor(v);
function randomSource(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;};}
function bezier(points,p){const q=1-p;return{x:q*q*q*points[0][0]+3*q*q*p*points[1][0]+3*q*p*p*points[2][0]+p*p*p*points[3][0],y:q*q*q*points[0][1]+3*q*q*p*points[1][1]+3*q*p*p*points[2][1]+p*p*p*points[3][1]};}

// A single, persistent, pixel-budgeted canvas. All particles and glow textures
// are allocated before activation, never at the impact. Every position is a
// function of time and seed, so skipped frames and replay cannot change a scene.
export const CinematicStage=forwardRef(function CinematicStage({slotRef},ref){
  const canvasRef=useRef(null),drawRef=useRef(()=>{});
  useImperativeHandle(ref,()=>({draw:state=>drawRef.current(state)}),[]);
  useEffect(()=>{
    const canvas=canvasRef.current,ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx)return;
    const rnd=randomSource(9060);
    const path=new Path2D(ARROW_MARK_PATH);
    const particles=Array.from({length:140},(_,i)=>({x:rnd(),y:rnd(),a:rnd()*TAU,r:.18+rnd()*.8,s:.5+rnd()*1.5,phase:rnd()*TAU,i}));
    const sphere=Array.from({length:1600},(_,i)=>{
      const y=1-2*(i+.5)/1600,r=Math.sqrt(1-y*y),a=i*2.399963;
      return{x:Math.cos(a)*r,y,z:Math.sin(a)*r,s:.65+rnd()*.8};
    });
    const glow=document.createElement('canvas');glow.width=glow.height=128;
    const g=glow.getContext('2d'),gradient=g.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,'rgba(240,247,255,1)');gradient.addColorStop(.1,'rgba(199,224,255,.8)');gradient.addColorStop(.32,'rgba(110,155,240,.25)');gradient.addColorStop(1,'rgba(70,110,220,0)');
    g.fillStyle=gradient;g.fillRect(0,0,128,128);
    const plume=document.createElement('canvas');plume.width=24;plume.height=128;
    const pc=plume.getContext('2d'),pg=pc.createLinearGradient(0,0,0,128);
    pg.addColorStop(0,'rgba(216,237,255,.8)');pg.addColorStop(.22,'rgba(140,186,255,.32)');pg.addColorStop(1,'rgba(100,150,255,0)');
    pc.fillStyle=pg;pc.beginPath();pc.moveTo(0,0);pc.lineTo(24,0);pc.lineTo(12,128);pc.fill();
    // Sample real letter silhouettes once. Shards originate inside ARROW.
    const mask=document.createElement('canvas');mask.width=500;mask.height=100;
    const m=mask.getContext('2d',{willReadFrequently:true});m.font='800 88px sans-serif';m.textAlign='center';m.fillText('ARROW',250,80);
    const pixels=m.getImageData(0,0,500,100).data,shards=[];
    for(let y=8;y<90;y+=5)for(let x=30;x<470;x+=5){if(pixels[(y*500+x)*4+3]>100&&rnd()>.55)shards.push({x:x/500,y:y/100,a:rnd()*TAU,r:rnd(),s:1+rnd()*2});}
    let introTime=0;
    let w=1,h=1,area={x:0,y:0,w:1,h:1},mobile=false,dpr=1;
    function fit(){
      const b=canvas.parentElement.getBoundingClientRect();w=Math.max(1,b.width);h=Math.max(1,b.height);
      mobile=w<700||matchMedia('(pointer:coarse)').matches;
      dpr=Math.min(devicePixelRatio||1,mobile?1.25:1.5,Math.sqrt((mobile?1100000:2500000)/(w*h)));
      const width=Math.round(w*dpr),height=Math.round(h*dpr);
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;ctx.setTransform(dpr,0,0,dpr,0,0);}
      const r=slotRef.current.getBoundingClientRect();area={x:r.left-b.left,y:r.top-b.top,w:r.width,h:r.height};
    }
    const observer=new ResizeObserver(fit);observer.observe(canvas.parentElement);observer.observe(slotRef.current);fit();
    function light(x,y,size,alpha=1){ctx.globalAlpha=clamp(alpha);ctx.drawImage(glow,x-size/2,y-size/2,size,size);ctx.globalAlpha=1;}
    function line(x1,y1,x2,y2,alpha=.5,width=1){ctx.globalAlpha=clamp(alpha);ctx.strokeStyle='#c9dcff';ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.globalAlpha=1;}
    function craft(x,y,angle=-Math.PI/2,size=42,trail=0,alpha=1){
      // Rotation belongs only here. No CSS or parent transform can compete.
      light(x,y,size*2.5,.24*alpha);
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=alpha;
      if(trail>0){ctx.strokeStyle='#b9d3ff';for(let i=0;i<6;i++){ctx.globalAlpha=alpha*(1-i/6)*.3;ctx.lineWidth=Math.max(.6,3-i*.4);ctx.beginPath();ctx.moveTo(-size*.3-i*trail/6,0);ctx.lineTo(-size*.3-(i+1)*trail/6,0);ctx.stroke();}}
      ctx.globalAlpha=alpha;ctx.scale(size/24,size/24);ctx.translate(-12,-12);ctx.fillStyle='#f8fbff';ctx.fill(path);ctx.restore();
    }
    function globe(t,alpha=1,scale=1){
      const cx=area.x+area.w*.5,cy=area.y+area.h*.48,r=Math.min(area.w*.31,area.h*.39)*scale;
      light(cx,cy,r*2.9,.34*alpha);
      const yaw=t*.16,co=Math.cos(yaw),si=Math.sin(yaw),step=mobile?2:1;
      ctx.fillStyle='#dbe8ff';
      for(let i=0;i<sphere.length;i+=step){const p=sphere[i],x=p.x*co+p.z*si,z=-p.x*si+p.z*co,projection=1/(1-z*.12),s=p.s*(mobile?1.25:1.2);ctx.globalAlpha=alpha*(.34+.54*(z+1)/2);ctx.fillRect(cx+x*r*projection,cy+p.y*r*projection,s,s);}
      ctx.globalAlpha=alpha*.28;ctx.strokeStyle='#9abfff';ctx.lineWidth=.8;
      ctx.beginPath();ctx.ellipse(cx,cy,r*1.28,r*.36,-.22,0,TAU);ctx.stroke();ctx.globalAlpha=1;
      return{cx,cy,r};
    }
    function speedTunnel(t,strength){
      const fade=smooth((t-.22)/.4)*strength;
      if(fade<.005)return;
      const diagonal=Math.hypot(w,h),cx=w/2,cy=h*.43;
      for(let i=0;i<(mobile?30:52);i++){
        const p=particles[i],q=fract(p.r+t*(.85+p.s*.28));
        const distance=(.14+q*q*.95)*diagonal;
        const length=(.025+q*q*.18)*diagonal;
        const ux=Math.cos(p.a),uy=Math.sin(p.a);
        const x=cx+ux*distance,y=cy+uy*distance;
        // During text reveal keep the full streak outside the text region.
        if(t>=2.2&&x>w*.06&&x<w*.94&&y>h*.24&&y<h*.76)continue;
        line(x,y,x+ux*length,y+uy*length,fade*Math.sin(q*Math.PI)*(.28+p.r*.52),i%7===0?2:1);
      }
    }
    drawRef.current=({scene,local:t,elapsed,idle,reduced})=>{
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;ctx.fillStyle='#030509';ctx.fillRect(0,0,w,h);
      const cx=w/2,cy=h/2,ax=p=>area.x+area.w*p,ay=p=>area.y+area.h*p;
      const landscape=h<=520&&w>h;
      const introX=landscape?w*.65:cx,introY=landscape?h*.4:cy;
      light(cx,h*.4,Math.min(w,h)*1.4,.08);
      const time=reduced?0:(scene===0||scene===12?idle:elapsed);
      // Quiet fixed-size star field; no blur, filters, readback or layout reads.
      if(scene!==2){ctx.fillStyle='#bed1f0';for(let i=0;i<(mobile?36:70);i++){const p=particles[i];ctx.globalAlpha=.12+p.r*.2;ctx.fillRect(fract(p.x+time*.001*p.r)*w,fract(p.y+time*.002*p.r)*h,1,1);}ctx.globalAlpha=1;}
      if(scene===0)introTime=time;
      if(scene===0||scene===1){
        const p=scene===1?smooth(t/2.62):0;
        const hx=mix(introX,cx,p),hy=mix(introY,cy,p);
        for(let i=0;i<(mobile?34:62);i++){
          const a=particles[i],motion=reduced?0:(scene===0?time:introTime+t);
          // Independent orbit, drift and full rotation; freeze neither position
          // nor orientation at activation. Convergence inherits the idle phase.
          const orbit=a.a+motion*(i%2?1:-1)*(.055+a.s*.04);
          const radius=.23+a.r*.43;
          const x=Math.cos(orbit)*w*radius+Math.sin(motion*.38+a.phase)*w*.055;
          const y=Math.sin(orbit)*h*radius+Math.cos(motion*.3+a.phase)*h*.045;
          const r=Math.hypot(x,y)*(1-p),angle=Math.atan2(y,x)+p*1.5;
          const px=cx+Math.cos(angle)*r,py=cy+Math.sin(angle)*r;
          ctx.save();ctx.translate(px,py);ctx.rotate(mix(a.phase+motion*(i%2?1:-1)*(.35+a.s*.32),angle+Math.PI,p));const size=(.45+a.r*.55)*(1-p*.6);ctx.scale(size,size);ctx.translate(-12,-12);ctx.globalAlpha=(.22+a.r*.32)*(1-p);ctx.fillStyle='#b4c5e5';ctx.fill(path);ctx.restore();
        }
        light(hx,hy,120+80*p-(scene===1?130*smooth((t-2.2)/.4):0),.35+.38*p);
        craft(hx,hy,-Math.PI/2,scene===0?52:52-14*smooth((t-1.9)/.7),0);
        if(scene===1){
          const q=clamp((t-.5)/1.55),fade=(1-q)*smooth(q*9),titleW=Math.min(w*.8,500),titleH=titleW*.2;
          ctx.fillStyle='#dce8ff';
          for(let i=0;i<shards.length;i+=(mobile?2:1)){const s=shards[i],sx=(landscape?w*.24:cx)+(s.x-.5)*titleW,sy=h*(landscape?.25:.21)+(s.y-.5)*titleH,x=mix(sx,cx,q*q)+Math.cos(s.a)*s.r*80*Math.sin(q*Math.PI),y=mix(sy,cy,q*q)+Math.sin(s.a)*s.r*60*Math.sin(q*Math.PI);ctx.globalAlpha=fade*.8;ctx.fillRect(x,y,s.s,s.s);}
          ctx.globalAlpha=1;
          const r=140*(1-smooth(t/2.55));if(r>3){ctx.strokeStyle='#98bcff';ctx.globalAlpha=.4;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();ctx.globalAlpha=1;}
        }
      } else if(scene===2){
        // Large apparent scale without adding surfaces or particle allocations.
        // One centered pulse: no detached flare, flickering secondary flash,
        // or permanent vertical beam competing with the launch.
        const kick=Math.exp(-t*11)*Math.sin(t*52)*(mobile?4:10);
        ctx.save();ctx.translate(kick,-kick*.45);
        const diagonal=Math.hypot(w,h),peak=Math.exp(-t*4.8);
        light(cx,cy,diagonal*(.8+.5*smooth(t/.16)),peak);
        ctx.fillStyle='#dfebff';ctx.globalAlpha=.42*Math.exp(-t*12);ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
        const pressure=t/.68;
        if(pressure<1){
          const radius=(1-Math.pow(1-pressure,3))*diagonal*.78;
          ctx.beginPath();ctx.arc(cx,cy,radius,0,TAU);ctx.lineWidth=1.4;
          ctx.strokeStyle='#edf5ff';ctx.globalAlpha=(1-pressure)*.86;ctx.stroke();ctx.globalAlpha=1;
        }
        const count=mobile?48:90;
        for(let i=0;i<count;i++){
          const p=particles[i],q=clamp(t/(.55+p.r*.45));
          const dist=diagonal*(.12+p.r*.65)*(1-Math.pow(1-q,2));
          const len=(i%8===0?.25:.075)*diagonal*p.s*Math.sin(q*Math.PI);
          line(cx+Math.cos(p.a)*dist,cy+Math.sin(p.a)*dist,cx+Math.cos(p.a)*(dist+len),cy+Math.sin(p.a)*(dist+len),(1-q)*.88,i%8===0?2.2:.9);
        }
        // The camera enters a continuous tunnel immediately after impact.
        // Same seeded rays continue into scene 3; no unrelated point lights.
        speedTunnel(t,1);
        const beamAlpha=Math.exp(-t*9);line(cx,0,cx,cy,beamAlpha,3);
        const launch=clamp((t-.12)/1.02),y=cy-Math.pow(launch,2.1)*(cy+150);
        if(launch<1){
          const tail=Math.min(h*.78,40+launch*h*.9);
          ctx.globalAlpha=launch*.6;ctx.drawImage(plume,cx-9,y+12,18,tail);ctx.globalAlpha=1;
          craft(cx,y,-Math.PI/2,38+launch*22,tail);
        }
        ctx.restore();
      } else if(scene===3){
        // Carry the launch velocity into the next shot, then settle for reading.
        speedTunnel(t+2.2,1-smooth(t/2.1));
        const q=clamp(t/.8);if(q<1)craft(w*.94,h*(1.15-q*1.55),-Math.PI/2,34,Math.min(h*.6,460),1-q*.5);
      } else if(scene===4||scene===5){
        const q=scene===5?smooth(t/4.5):0;
        craft(ax(.5),ay(.48),-Math.PI/2+q*Math.PI/2,42,0);
      } else if(scene>=6&&scene<=9){
        const curves={
          6:[[.5,.48],[.64,.48],[.74,.18],[.82,.38]],
          7:[[.82,.38],[.9,.58],[.26,.68],[.18,.48]],
          8:[[.18,.48],[.1,.28],[.74,.25],[.82,.45]],
          9:[[.82,.45],[.9,.65],[.08,.48],[.22,.48]],
        };
        let p=clamp(t/5),points=curves[scene],a,b;
        if(scene===9&&t>2){p=smooth((t-2)/3);a={x:mix(.22,.82,p),y:.48};b={x:a.x+.002,y:a.y};}
        else {if(scene===9)p=smooth(t/2);a=bezier(points,p);b=bezier(points,Math.min(1,p+.001));if(p===1){b=a;a=bezier(points,.999);}}
        const angle=Math.atan2((b.y-a.y)*area.h,(b.x-a.x)*area.w);
        craft(ax(a.x),ay(a.y),angle,mobile?28:34,35);
        if(scene===7){const q=fract(t/2.2),sx=ax(mix(.12,.88,q)),sy=ay(q<.5?mix(.28,.48,q*2):mix(.48,.68,(q-.5)*2));light(sx,sy,30,.9);}
      } else if(scene===10){
        const reveal=smooth(t/.8),pull=1-.14*smooth((t-5.4)/1.6);
        const {cx:gx,cy:gy,r}=globe(t,reveal,pull);
        const destinations=[[.15,.21],[.85,.21],[.15,.76],[.85,.76]];
        destinations.forEach(([x,y],i)=>{const a=smooth((t-.7-i*.35)/.8);line(gx,gy,ax(x),ay(y),a*.3);light(ax(x),ay(y),32,a*.7);});
        const q=smooth(t/.6),angle=t*.8,x=gx+Math.cos(angle)*r*1.18,y=gy+Math.sin(angle)*r*.5;
        craft(mix(ax(.82),x,q),mix(ay(.48),y,q),mix(0,Math.atan2(Math.cos(angle)*.5,-Math.sin(angle)),q),30,30,(1-smooth((t-6)/1)));
      } else if(scene===11){light(cx,h*.42,Math.min(w,h)*1.1,.2*(1-smooth(t/4)));}
      // End on a quiet title card; no sphere behind readable text.
      ctx.globalAlpha=1;
    };
    return()=>{observer.disconnect();drawRef.current=()=>{};canvas.width=1;canvas.height=1;};
  },[slotRef]);
  return <canvas ref={canvasRef} className="ax-canvas" aria-hidden="true"/>;
});
