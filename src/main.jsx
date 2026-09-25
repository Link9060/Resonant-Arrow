import React,{useEffect,useMemo,useRef,useState}from'react';
import{createRoot}from'react-dom/client';
import{ArrowMark}from'./ArrowMark';
import{OrbitPlanet}from'./OrbitPlanet';
import'./style.css';

const TIMELINE=[
  [0,1],
  [5400,2],
  [11200,3],
  [19200,4],
  [27500,5],
  [36000,6],
  [48000,7],
  [59000,8],
  [66000,9],
];

function seeded(seed){
  let s=seed|0;
  return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296};
}

function App(){
  const[scene,setScene]=useState(0);
  const[running,setRunning]=useState(false);
  const canvasRef=useRef(null);
  const timers=useRef([]);

  const lostArrows=useMemo(()=>{
    const rnd=seeded(9060);
    return Array.from({length:68},(_,i)=>{
      const depth=rnd();
      const size=9+depth*21;
      return{
        id:i,
        left:rnd()*100,
        top:rnd()*100,
        size,
        opacity:.035+depth*.13,
        blur:(1-depth)*1.15,
        dx1:(rnd()-.5)*150,
        dy1:(rnd()-.5)*130,
        dx2:(rnd()-.5)*190,
        dy2:(rnd()-.5)*160,
        r0:rnd()*360,
        r1:(rnd()-.5)*900,
        r2:(rnd()-.5)*1200,
        dur:7+rnd()*12,
        delay:-rnd()*14,
      };
    });
  },[]);

  const burstParticles=useMemo(()=>{
    const rnd=seeded(1741);
    return Array.from({length:150},(_,i)=>({
      id:i,
      a:rnd()*Math.PI*2,
      d:110+rnd()*520,
      size:.7+rnd()*3.4,
      delay:rnd()*.42,
      spin:(rnd()-.5)*720,
    }));
  },[]);

  useEffect(()=>{
    const c=canvasRef.current,ctx=c.getContext('2d');
    if(!ctx)return;
    let frame=0,w=innerWidth,h=innerHeight,dpr=1,last=performance.now();
    const rnd=seeded(5005);
    let dust=Array.from({length:360},()=>({
      x:(rnd()-.5)*2,
      y:(rnd()-.5)*2,
      z:rnd()*.98+.02,
      s:.25+rnd()*1.15,
      drift:(rnd()-.5)*.001,
    }));
    const resize=()=>{
      w=innerWidth;h=innerHeight;
      dpr=Math.min(devicePixelRatio||1,1.5);
      c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
      c.style.width=w+'px';c.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();addEventListener('resize',resize);

    const draw=now=>{
      const dt=Math.min(.05,(now-last)/1000);last=now;
      ctx.clearRect(0,0,w,h);
      ctx.save();ctx.translate(w/2,h/2);
      const travel=scene===3?1:scene===2?.42:scene===4?.18:scene===8?.08:.025;
      const alphaBase=scene===3?.36:scene===2?.24:.12;

      for(const p of dust){
        p.z-=travel*dt*.44;
        p.x+=p.drift*dt*18;
        if(p.z<.018){p.z=1;p.x=(rnd()-.5)*2;p.y=(rnd()-.5)*2}
        const scale=1/p.z;
        const x=p.x*w*.52*scale;
        const y=p.y*h*.54*scale;
        const prev=Math.min(1,p.z+travel*.05);
        const px=p.x*w*.52/prev;
        const py=p.y*h*.54/prev;
        const a=Math.min(.72,alphaBase+(1-p.z)*.34);
        if(scene===3||scene===2){
          ctx.strokeStyle='rgba(220,232,255,'+a+')';
          ctx.lineWidth=p.s;
          ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(x,y);ctx.stroke();
        }else{
          ctx.globalAlpha=a;
          ctx.fillStyle='#eaf1ff';
          ctx.fillRect(x,y,p.s,p.s);
        }
      }
      ctx.globalAlpha=1;ctx.restore();
      frame=requestAnimationFrame(draw);
    };
    frame=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(frame);removeEventListener('resize',resize)};
  },[scene]);

  useEffect(()=>{
    const move=e=>{
      const mx=(e.clientX/innerWidth-.5)*2;
      const my=(e.clientY/innerHeight-.5)*2;
      document.documentElement.style.setProperty('--mx',mx.toFixed(3));
      document.documentElement.style.setProperty('--my',my.toFixed(3));
    };
    addEventListener('pointermove',move);
    return()=>removeEventListener('pointermove',move);
  },[]);

  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);

  function clearTimers(){timers.current.forEach(clearTimeout);timers.current=[]}
  function start(){
    if(running)return;
    clearTimers();setRunning(true);setScene(1);
    TIMELINE.slice(1).forEach(([ms,s])=>timers.current.push(setTimeout(()=>setScene(s),ms)));
  }
  function skip(){clearTimers();setRunning(true);setScene(9)}
  function replay(){clearTimers();setRunning(false);setScene(0)}

  const chaos=['MESSAGES','FILES','PROJECTS','PEOPLE','EVENTS','IDEAS','TASKS','MUSIC','NOTES','AI','CALENDAR','MEMORIES'];
  const modules=[
    ['01','ATLAS','Your files, ideas, knowledge, and the things you own — mapped into one connected world.'],
    ['02','RAVIN','An intelligence layer that can understand the context surrounding everything else.'],
    ['03','RELAY','Communication, planning, and coordination without breaking the rest of your flow.'],
    ['04','ORBIT','The place you return to. A living map of the entire ARROW system.'],
  ];

  return <main className={'app scene-'+scene+(running?' is-running':'')}>
    <canvas ref={canvasRef} className="ambientCanvas"/>
    <div className="grain"/><div className="vignette"/><div className="edgeGlow"/>
    <div className="brandLockup">RESONANT ASSIST <i>/</i> PROJECT ARROW</div>
    {running&&scene<9?<button className="skip" onClick={skip}>SKIP EXPERIENCE</button>:null}

    {scene===0&&<section className="introScene">
      <div className="lostField" aria-hidden="true">
        {lostArrows.map(a=><ArrowMark key={a.id} size={a.size} className="lostArrow" style={{
          left:a.left+'%',top:a.top+'%',opacity:a.opacity,filter:'blur('+a.blur+'px)',
          '--dx1':a.dx1+'px','--dy1':a.dy1+'px','--dx2':a.dx2+'px','--dy2':a.dy2+'px',
          '--r0':a.r0+'deg','--r1':a.r1+'deg','--r2':a.r2+'deg',
          '--dur':a.dur+'s','--delay':a.delay+'s'
        }}/>)}
      </div>
      <div className="introWord">ARROW</div>
      <button className="startCore" onClick={start}>
        <span className="coreAura a1"/><span className="coreAura a2"/><span className="coreAura a3"/>
        <ArrowMark size={62} className="mainMark upright"/>
        <b>FIND YOUR DIRECTION</b>
        <small>CLICK TO INITIATE</small>
      </button>
      <p className="introHint">Everything is moving. Most of it is moving separately.</p>
    </section>}

    {scene===1&&<section className="convergeScene">
      <div className="lostField convergence" aria-hidden="true">
        {lostArrows.map(a=><ArrowMark key={a.id} size={a.size} className="lostArrow" style={{
          left:a.left+'%',top:a.top+'%',opacity:Math.min(.24,a.opacity*1.35),
          '--dx1':a.dx1+'px','--dy1':a.dy1+'px','--dx2':a.dx2+'px','--dy2':a.dy2+'px',
          '--r0':a.r0+'deg','--r1':a.r1+'deg','--r2':a.r2+'deg','--dur':a.dur+'s','--delay':a.delay+'s'
        }}/>)}
      </div>
      <div className="convergeWord"><span>A</span><span>R</span><span>R</span><span>O</span><span>W</span></div>
      <div className="convergeCore"><ArrowMark size={72} className="upright"/></div>
      <div className="cinematicCaption"><span>SCATTERED.</span><span>UNCONNECTED.</span><b>UNTIL NOW.</b></div>
    </section>}

    {scene===2&&<section className="ignitionScene">
      <div className="burstWord" aria-hidden="true">{['A','R','R','O','W'].map((l,i)=><span key={i}>{l}</span>)}</div>
      <div className="burstParticles">{burstParticles.map(p=><i key={p.id} style={{
        '--a':p.a+'rad','--d':p.d+'px','--size':p.size+'px','--delay':p.delay+'s','--spin':p.spin+'deg'
      }}/>)}</div>
      <div className="beam beamCore"/><div className="beam beamSoft"/><div className="impactBloom"/>
      <div className="impactRing ir1"/><div className="impactRing ir2"/><div className="impactRing ir3"/>
      <div className="launchCraft"><ArrowMark size={78} className="upright"/></div>
      <div className="ignitionLabel">DIRECTION LOCKED</div>
    </section>}

    {scene===3&&<section className="directionScene">
      <div className="radialTunnel"/>
      <div className="directionCopy">
        <span>GIVE YOUR LIFE</span>
        <strong>DIRECTION.</strong>
        <p>One connected system for the things you do, know, build, remember, and share.</p>
      </div>
      <div className="flightCraft"><ArrowMark size={58} className="upright"/></div>
      <div className="horizonLine"/>
    </section>}

    {scene===4&&<section className="chaosScene">
      <div className="chaosWords" aria-hidden="true">{chaos.map((w,i)=><span key={w} className={'cw cw'+i}>{w}</span>)}</div>
      <div className="chaosCraft"><ArrowMark size={54} className="upright"/></div>
      <div className="storyCopy">
        <small>YOUR LIFE ISN'T ONE THING.</small>
        <h2>So why does it live in<br/><b>separate places?</b></h2>
      </div>
    </section>}

    {scene===5&&<section className="orderScene">
      <div className="formingPlanet"><OrbitPlanet active introMix={.74}/></div>
      <div className="orderSweep"/>
      <div className="orderCopy">
        <small>ARROW CONNECTS THE PIECES</small>
        <h2>Scattered becomes <b>navigable.</b></h2>
        <p>The same information. The same people. The same projects. Now moving as one system.</p>
      </div>
    </section>}

    {scene===6&&<section className="moduleScene">
      <OrbitPlanet active introMix={1}/>
      <div className="moduleEyebrow">FOUR WORLDS · ONE SYSTEM</div>
      <div className="moduleStories">
        {modules.map((m,i)=><article key={m[1]} className={'moduleStory ms'+i}>
          <em>{m[0]}</em><h2>{m[1]}</h2><p>{m[2]}</p>
        </article>)}
      </div>
    </section>}

    {scene===7&&<section className="orbitReveal">
      <OrbitPlanet active introMix={1}/>
      <div className="orbitRevealCopy">
        <small>THE CENTER OF ARROW</small>
        <h2>ORBIT</h2>
        <p>Not a dashboard. A world you move through.</p>
      </div>
    </section>}

    {scene===8&&<section className="finalScene">
      <div className="finalLight"/>
      <ArrowMark size={74} className="finalArrow upright"/>
      <div className="finalCopy">
        <small>RESONANT ASSIST PRESENTS</small>
        <h1>PROJECT<br/><b>ARROW</b></h1>
        <p>YOUR LIFE. CONNECTED.</p>
        <strong>GIVE IT DIRECTION.</strong>
      </div>
    </section>}

    {scene===9&&<section className="landingScene">
      <div className="landingPlanet"><OrbitPlanet active introMix={1}/></div>
      <div className="landingShade"/>
      <div className="landingContent">
        <ArrowMark size={46} className="upright landingMark"/>
        <small>PROJECT ARROW</small>
        <h1>Your digital life.<br/><b>Moving together.</b></h1>
        <p>Atlas. RAVIN. Relay. Orbit. One connected system built to give the moving parts of your life a direction.</p>
        <div className="landingActions"><button>EXPLORE ARROW <span>→</span></button><button onClick={replay}>REPLAY EXPERIENCE</button></div>
      </div>
    </section>}
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);