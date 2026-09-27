import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ARROW_MARK_PATH } from './ArrowMark';
import { createCloudRenderer } from './orbit-source/particle-renderer';
import { drawOrbitSegments } from './orbit-source/orbit-spatial';

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
    // Upstream Orbit renderer, unchanged. Same balanced density and grain size.
    const orbitRenderer=createCloudRenderer(false,{density:.72,size:1.02});
    const words=['MESSAGES','FILES','PROJECTS','PEOPLE','EVENTS','IDEAS','TASKS','MUSIC','NOTES','AI','CALENDAR','MEMORIES','LINKS','GOALS'];
    const wordSprites=words.map(word=>{
      const tile=document.createElement('canvas');tile.width=360;tile.height=56;
      const text=tile.getContext('2d');text.font='600 32px ui-sans-serif, sans-serif';text.fillStyle='#fff';text.textAlign='center';text.textBaseline='middle';text.fillText(word,180,28);
      return tile;
    });
    const glow=document.createElement('canvas');glow.width=glow.height=128;
    const g=glow.getContext('2d'),gradient=g.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,'rgba(246,246,246,1)');gradient.addColorStop(.1,'rgba(221,221,221,.8)');gradient.addColorStop(.32,'rgba(152,152,152,.25)');gradient.addColorStop(1,'rgba(109,109,109,0)');
    g.fillStyle=gradient;g.fillRect(0,0,128,128);
    const beam=document.createElement('canvas');beam.width=256;beam.height=1;
    const bc=beam.getContext('2d'),bg=bc.createLinearGradient(0,0,256,0);
    for(const [stop,alpha] of [[0,0],[.22,.06],[.4,.28],[.47,.9],[.5,1],[.53,.9],[.6,.28],[.78,.06],[1,0]])bg.addColorStop(stop,`rgba(255,255,255,${alpha})`);
    bc.fillStyle=bg;bc.fillRect(0,0,256,1);
    const plume=document.createElement('canvas');plume.width=24;plume.height=128;
    const pc=plume.getContext('2d'),pg=pc.createLinearGradient(0,0,0,128);
    pg.addColorStop(0,'rgba(234,234,234,.8)');pg.addColorStop(.22,'rgba(181,181,181,.32)');pg.addColorStop(1,'rgba(147,147,147,0)');
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
    function line(x1,y1,x2,y2,alpha=.5,width=1){ctx.globalAlpha=clamp(alpha);ctx.strokeStyle='#dadada';ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.globalAlpha=1;}
    function craft(x,y,angle=-Math.PI/2,size=42,trail=0,alpha=1){
      // Rotation belongs only here. No CSS or parent transform can compete.
      light(x,y,size*2.5,.24*alpha);
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=alpha;
      if(trail>0){ctx.strokeStyle='#d1d1d1';for(let i=0;i<6;i++){ctx.globalAlpha=alpha*(1-i/6)*.3;ctx.lineWidth=Math.max(.6,3-i*.4);ctx.beginPath();ctx.moveTo(-size*.3-i*trail/6,0);ctx.lineTo(-size*.3-(i+1)*trail/6,0);ctx.stroke();}}
      ctx.globalAlpha=alpha;ctx.scale(size/24,size/24);ctx.translate(-12,-12);ctx.fillStyle='#fbfbfb';ctx.fill(path);ctx.restore();
    }
    function globe(t,alpha=1,scale=1){
      const cx=area.x+area.w*.5,cy=area.y+area.h*.48;
      const radius=Math.min(area.w*.29,area.h*.35)*scale;
      const base=Math.min(area.w*.228,h*.258,292);
      const worldScale=radius/base,yaw=t*.052,pitch=Math.sin(t*.14)*.028,roll=Math.sin(t*.09)*.016;
      ctx.save();
      drawOrbitSegments(ctx,'back',yaw,pitch,roll,radius,cx,cy);
      orbitRenderer(ctx,cx,cy,area.w,t,true,{scale:worldScale,alpha,yaw,pitch,roll});
      drawOrbitSegments(ctx,'front',yaw,pitch,roll,radius,cx,cy);
      ctx.restore();return{cx,cy,r:radius};
    }
    function fieldPose(a,i,motion,p=0){
      const orbit=a.a+motion*(i%2?1:-1)*(.055+a.s*.04),radius=.23+a.r*.43;
      const x=Math.cos(orbit)*w*radius+Math.sin(motion*.38+a.phase)*w*.055;
      const y=Math.sin(orbit)*h*radius+Math.cos(motion*.3+a.phase)*h*.045;
      const r=Math.hypot(x,y)*(1-p*.25),angle=Math.atan2(y,x)+p*.35;
      return{x:w/2+Math.cos(angle)*r,y:h/2+Math.sin(angle)*r,angle:mix(a.phase+motion*(i%2?1:-1)*(.35+a.s*.32),angle+Math.PI,p*.7)};
    }
    function wordFlight(t){
      ctx.save();ctx.beginPath();ctx.rect(0,area.y,w,area.h);ctx.clip();
      ctx.textAlign='center';ctx.textBaseline='middle';
      for(let i=0;i<words.length;i++){
        const a=particles[i],phase=fract(i*.173+t*.42),z=1.1-phase;
        const projection=.32/z,angle=i*2.39996;
        const x=area.x+area.w*.5+Math.cos(angle)*area.w*(.18+a.r*.22)*projection;
        const y=area.y+area.h*.48+Math.sin(angle)*area.h*(.22+a.r*.18)*projection;
        const edge=Math.min(y-area.y,area.y+area.h-y);
        const alpha=smooth(phase/.16)*(1-smooth((phase-.86)/.14))*smooth(edge/35);
        ctx.globalAlpha=alpha;const size=Math.max(8,(mobile?15:23)*projection)/32;
        ctx.drawImage(wordSprites[i],x-180*size,y-28*size,360*size,56*size);
      }
      ctx.restore();
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
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.globalAlpha=1;ctx.fillStyle='#000000';ctx.fillRect(0,0,w,h);
      const cx=w/2,cy=h/2,ax=p=>area.x+area.w*p,ay=p=>area.y+area.h*p;
      const landscape=h<=520&&w>h;
      const introX=landscape?w*.65:cx,introY=landscape?h*.4:cy;
      light(cx,h*.4,Math.min(w,h)*1.4,.08);
      const time=reduced?0:(scene===0||scene===12?idle:elapsed);
      // Quiet fixed-size star field; no blur, filters, readback or layout reads.
      if(scene!==2){ctx.fillStyle='#cfcfcf';for(let i=0;i<(mobile?36:70);i++){const p=particles[i];ctx.globalAlpha=.12+p.r*.2;ctx.fillRect(fract(p.x+time*.001*p.r)*w,fract(p.y+time*.002*p.r)*h,1,1);}ctx.globalAlpha=1;}
      if(scene===0)introTime=time;
      if(scene===0||scene===1){
        const p=scene===1?smooth(t/2.62):0;
        const hx=mix(introX,cx,p),hy=mix(introY,cy,p);
        for(let i=0;i<(mobile?34:62);i++){
          const a=particles[i],motion=reduced?0:(scene===0?time:introTime+t);
          const pose=fieldPose(a,i,motion,p);
          ctx.save();ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle);
          const size=(.45+a.r*.55);ctx.scale(size,size);ctx.translate(-12,-12);
          ctx.globalAlpha=(.22+a.r*.32)*(1-p*.25);ctx.fillStyle='#cccccc';ctx.fill(path);ctx.restore();
        }
        light(hx,hy,120+80*p-(scene===1?130*smooth((t-2.2)/.4):0),.35+.38*p);
        craft(hx,hy,-Math.PI/2,scene===0?52:52-14*smooth((t-1.9)/.7),0);
        if(scene===1){
          const q=clamp((t-.5)/1.55),fade=(1-q)*smooth(q*9),titleW=Math.min(w*.8,500),titleH=titleW*.2;
          ctx.fillStyle='#e7e7e7';
          for(let i=0;i<shards.length;i+=(mobile?2:1)){const s=shards[i],sx=(landscape?w*.24:cx)+(s.x-.5)*titleW,sy=h*(landscape?.25:.21)+(s.y-.5)*titleH,x=mix(sx,cx,q*q)+Math.cos(s.a)*s.r*80*Math.sin(q*Math.PI),y=mix(sy,cy,q*q)+Math.sin(s.a)*s.r*60*Math.sin(q*Math.PI);ctx.globalAlpha=fade*.8;ctx.fillRect(x,y,s.s,s.s);}
          ctx.globalAlpha=1;
          const r=140*(1-smooth(t/2.55));if(r>3){ctx.strokeStyle='#b9b9b9';ctx.globalAlpha=.4;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();ctx.globalAlpha=1;}
        }
      } else if(scene===2){
        const diagonal=Math.hypot(w,h),kick=Math.exp(-t*7)*Math.sin(t*43)*(mobile?5:13);
        ctx.save();ctx.translate(kick,-kick*.3);
        const release=1-Math.exp(-t*13),wash=Math.exp(-t*8);
        // One overwhelming impact, a sustained white shaft, then debris clears.
        light(cx,cy,diagonal*(.7+release),wash);
        ctx.fillStyle='#ffffff';ctx.globalAlpha=.9*wash;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
        const wave=diagonal*release*.85;
        ctx.beginPath();ctx.arc(cx,cy,wave,0,TAU);ctx.strokeStyle='#ffffff';ctx.lineWidth=2+7*Math.exp(-t*12);ctx.globalAlpha=Math.exp(-t*3);ctx.stroke();ctx.globalAlpha=1;
        // The surrounding field is still present at impact. Each arrow breaks
        // on arrival of the pressure front, then its fragments leave the frame.
        for(let i=0;i<(mobile?34:62);i++){
          const a=particles[i],pose=fieldPose(a,i,introTime+2.8,1),dx=pose.x-cx,dy=pose.y-cy;
          const distance=Math.hypot(dx,dy),hit=distance/diagonal*.22,age=t-hit;
          if(age<0){ctx.save();ctx.translate(pose.x,pose.y);ctx.rotate(pose.angle);ctx.scale(.7,.7);ctx.translate(-12,-12);ctx.fillStyle='#dddddd';ctx.fill(path);ctx.restore();}
          else for(let j=0;j<3;j++){
            const angle=Math.atan2(dy,dx)+(j-1)*.3,travel=age*diagonal*(1+a.r);
            const x=pose.x+Math.cos(angle)*travel,y=pose.y+Math.sin(angle)*travel+h*age*.6;
            line(x,y,x+Math.cos(angle)*Math.min(100,age*180+8),y+Math.sin(angle)*Math.min(100,age*180+8),Math.exp(-age*3),j===0?2:1);
          }
        }
        const shaft=(1-smooth((t-1.5)/.7)),beamWidth=(mobile?70:150)*Math.exp(-t*3)+12;
        ctx.globalAlpha=shaft;ctx.drawImage(beam,cx-beamWidth*3,0,beamWidth*6,h);
        ctx.globalAlpha=1;
        for(let i=0;i<(mobile?42:78);i++){
          const a=particles[i],q=fract(a.y+t*(.8+a.s*.5)),x=cx+(a.x-.5)*w*(1+t*.8);
          line(x,q*h,x,q*h+(mobile?80:180)*a.s,shaft*.55,1);
        }
        const launch=clamp((t-.16)/1.85),y=cy-Math.pow(launch,1.6)*(cy+100);
        if(launch<1){
          const tail=Math.min(h,90+launch*h);ctx.globalAlpha=.6;ctx.drawImage(plume,cx-14,y+18,28,tail);ctx.globalAlpha=1;
          // Dark edge separates the white craft from the white beam.
          ctx.save();ctx.translate(cx,y);ctx.rotate(-Math.PI/2);ctx.scale(2.6,2.6);ctx.translate(-12,-12);ctx.strokeStyle='#000000';ctx.lineWidth=1.8;ctx.stroke(path);ctx.fillStyle='#ffffff';ctx.fill(path);ctx.restore();
        }
        ctx.restore();
      } else if(scene===3){
        // Carry the launch velocity into the next shot, then settle for reading.
        speedTunnel(t+2.2,1-smooth(t/2.1));
        const q=clamp(t/.65);if(q<1)craft(cx,-30-q*100,-Math.PI/2,54,Math.min(h*.7,500),1-q);
      } else if(scene===4||scene===5){
        if(scene===4)wordFlight(t);
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

      } else if(scene===10){
        const reveal=smooth(t/.8),pull=1-.14*smooth((t-5.4)/1.6);
        const {cx:gx,cy:gy,r}=globe(t,reveal,pull);

        const q=smooth(t/.6),angle=t*.8,x=gx+Math.cos(angle)*r*1.18,y=gy+Math.sin(angle)*r*.5;
        craft(mix(ax(.82),x,q),mix(ay(.48),y,q),mix(0,Math.atan2(Math.cos(angle)*.5,-Math.sin(angle)),q),30,30,(1-smooth((t-6)/1)));
      } else if(scene===11){light(cx,h*.42,Math.min(w,h)*1.1,.2*(1-smooth(t/4)));}
      // End on a quiet title card; no sphere behind readable text.
      if(scene>=4&&scene<=11){
        const duration=scene===4||scene===11?4:scene===5?4.5:scene===10?7:5;
        const envelope=smooth(t/.35)*(1-smooth((t-duration+.3)/.3));
        ctx.fillStyle='#000000';ctx.globalAlpha=1-envelope;ctx.fillRect(0,0,w,h);
      }
      ctx.globalAlpha=1;
    };
    return()=>{observer.disconnect();drawRef.current=()=>{};canvas.width=1;canvas.height=1;};
  },[slotRef]);
  return <canvas ref={canvasRef} className="ax-canvas" aria-hidden="true"/>;
});
