import React,{useEffect,useMemo,useRef,useState}from'react';
import{createRoot}from'react-dom/client';
import'./style.css';

const timeline=[
  [0,1],
  [2600,2],
  [6900,3],
  [11200,4],
  [16400,5],
  [21600,6],
  [28600,7],
  [34600,8],
  [39600,9],
];

function Arrow({className=''}){return <div className={'arrow '+className}><span/><span/><span/></div>}

function App(){
  const[scene,setScene]=useState(0);
  const[running,setRunning]=useState(false);
  const canvas=useRef(null);
  const timers=useRef([]);
  const mouse=useRef({x:0,y:0});

  const ghosts=useMemo(()=>Array.from({length:56},(_,i)=>({
    x:4+((i*37)%92),
    y:4+((i*61)%90),
    r:((i*47)%220)-110,
    s:.22+((i*29)%70)/100,
    o:.025+((i*17)%8)/100
  })),[]);

  const particles=useMemo(()=>Array.from({length:90},(_,i)=>({
    a:(i*137.5)%360,
    d:70+((i*83)%420),
    s:2+((i*19)%5),
    delay:(i%15)*.035
  })),[]);

  useEffect(()=>{
    const move=e=>{
      mouse.current.x=(e.clientX/innerWidth-.5)*2;
      mouse.current.y=(e.clientY/innerHeight-.5)*2;
      document.documentElement.style.setProperty('--mx',mouse.current.x);
      document.documentElement.style.setProperty('--my',mouse.current.y);
    };
    addEventListener('pointermove',move);
    return()=>removeEventListener('pointermove',move);
  },[]);

  useEffect(()=>{
    const c=canvas.current,ctx=c.getContext('2d');
    let raf,stars=[];
    function resize(){
      const dpr=Math.min(devicePixelRatio||1,1.5);
      c.width=innerWidth*dpr;c.height=innerHeight*dpr;
      c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      stars=Array.from({length:680},()=>({
        x:(Math.random()-.5)*innerWidth*2.1,
        y:(Math.random()-.5)*innerHeight*2.1,
        z:Math.random()*.98+.02,
        w:Math.random()*1.25+.2
      }));
    }
    resize();addEventListener('resize',resize);
    function draw(){
      ctx.clearRect(0,0,innerWidth,innerHeight);
      ctx.save();ctx.translate(innerWidth/2,innerHeight/2);
      const speeds=[.06,.35,.18,4.4,1.1,.45,.7,1.8,.35,.08];
      const speed=speeds[scene]||.08;
      ctx.globalCompositeOperation='lighter';
      for(const p of stars){
        p.z-=speed*.0045;
        if(p.z<.012){p.z=1;p.x=(Math.random()-.5)*innerWidth*2.1;p.y=(Math.random()-.5)*innerHeight*2.1}
        const sx=p.x/p.z,sy=p.y/p.z;
        const prev=Math.min(1,p.z+speed*.03);
        const px=p.x/prev,py=p.y/prev;
        const alpha=Math.min(.82,(1-p.z)*.7+.035);
        ctx.strokeStyle='rgba(210,225,255,'+alpha+')';
        ctx.lineWidth=p.w;
        ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(sx,sy);ctx.stroke();
      }
      ctx.restore();ctx.globalCompositeOperation='source-over';
      raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize)}
  },[scene]);

  function start(){
    if(running)return;
    setRunning(true);
    timeline.forEach(([ms,s])=>timers.current.push(setTimeout(()=>setScene(s),ms)));
  }

  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);

  const chaos=['MESSAGES','FILES','PROJECTS','PEOPLE','EVENTS','IDEAS','TASKS','MUSIC','NOTES','AI','CALENDAR','MEMORIES'];
  const modules=[
    ['ATLAS','Your files, ideas, knowledge, and digital world.'],
    ['RAVIN','Intelligence that understands the context around you.'],
    ['RELAY','Communication designed around the people that matter.'],
    ['ORBIT','One place to move through everything.']
  ];

  return <main className={'scene scene-'+scene+(running?' running':'')}>
    <canvas ref={canvas}/>
    <div className="grain"/>
    <div className="vignette"/>
    <div className="ambientGlow"/>
    <header>RESONANT ASSIST <i>/</i> PROJECT ARROW</header>

    {scene===0&&<>
      <div className="idleWord">ARROW</div>
      <div className="ghostField">{ghosts.map((g,i)=><Arrow key={i} className="ghost" style={g}/>)}</div>
      <button className="initiate" onClick={start} aria-label="Start Project Arrow experience">
        <div className="halo h1"/><div className="halo h2"/>
        <Arrow className="heroArrow"/>
        <span>FIND YOUR DIRECTION</span>
        <small>CLICK TO BEGIN</small>
      </button>
    </>}

    {scene===1&&<>
      <div className="compression">
        <div className="idleWord">ARROW</div>
        <div className="ghostField collapsing">{ghosts.map((g,i)=><Arrow key={i} className="ghost" style={g}/>)}</div>
      </div>
      <div className="chargeCore"><Arrow/></div>
      <div className="chargeText">EVERYTHING IS MOVING.</div>
      <div className="chargeText second">CHOOSE A DIRECTION.</div>
    </>}

    {scene===2&&<>
      <div className="whiteFlash"/>
      <div className="beam"/>
      <div className="beamBloom"/>
      <div className="impactRing r1"/><div className="impactRing r2"/><div className="impactRing r3"/>
      <div className="debris">{particles.map((p,i)=><i key={i} style={{'--a':p.a+'deg','--d':p.d+'px','--s':p.s+'px','--delay':p.delay+'s'}}/>)}</div>
      <div className="launchArrow"><Arrow/></div>
      <div className="impactCaption">IGNITION</div>
    </>}

    {scene===3&&<>
      <div className="speedTunnel"/>
      <div className="travelArrow"><Arrow/></div>
      <div className="statement">
        <span>GIVE YOUR LIFE</span>
        <strong>DIRECTION.</strong>
        <small>One connected system for the things you do, know, build, and share.</small>
      </div>
    </>}

    {scene===4&&<>
      <div className="chaosCloud">
        {chaos.map((w,i)=><div key={w} className={'chaosWord cw'+i}>{w}</div>)}
      </div>
      <div className="centerArrow"><Arrow/></div>
      <div className="sceneCopy"><b>Your life isn't one thing.</b><span>Neither should the tools that organize it be.</span></div>
    </>}

    {scene===5&&<>
      <div className="orderPulse"/>
      <div className="networkLines"/>
      <div className="orderedNodes">
        {chaos.slice(0,8).map((w,i)=><div key={w} className={'orderedNode on'+i}><i/><span>{w}</span></div>)}
      </div>
      <div className="sceneCopy orderCopy"><b>Bring the pieces together.</b><span>ARROW turns scattered tools into one navigable system.</span></div>
    </>}

    {scene===6&&<>
      <div className="moduleWorld">
        <div className="moduleCore"><Arrow/></div>
        {modules.map((m,i)=><article className={'moduleCard mc'+i} key={m[0]}><em>0{i+1}</em><h2>{m[0]}</h2><p>{m[1]}</p></article>)}
      </div>
      <div className="sectionTitle">FOUR WORLDS. <b>ONE DIRECTION.</b></div>
    </>}

    {scene===7&&<>
      <div className="orbitScene">
        <div className="orbitSphere"><div className="lat l1"/><div className="lat l2"/><div className="lat l3"/><div className="long lo1"/><div className="long lo2"/></div>
        <div className="orbitTrail"/>
        <div className="orbitCraft"><Arrow/></div>
        <div className="orbitLabel">
          <small>THE CENTER OF ARROW</small>
          <h2>ORBIT</h2>
          <p>Move between the parts of your digital life like they belong to the same world.</p>
        </div>
      </div>
    </>}

    {scene===8&&<>
      <div className="finalBurst"/>
      <div className="finalMark"><Arrow/></div>
      <div className="finalTitle"><small>RESONANT ASSIST PRESENTS</small><h1>PROJECT<br/>ARROW</h1><p>YOUR LIFE. CONNECTED.</p><b>GIVE IT DIRECTION.</b></div>
    </>}

    {scene>=9&&<section className="landing">
      <div className="landingOrb"/>
      <Arrow className="landingArrow"/>
      <span className="eyebrow">PROJECT ARROW</span>
      <h1>Your digital life.<br/><b>Moving together.</b></h1>
      <p>Atlas. RAVIN. Relay. Orbit. One connected system built to give the moving parts of your life a direction.</p>
      <div className="landingActions"><button>EXPLORE ARROW →</button><button onClick={()=>location.reload()}>REPLAY EXPERIENCE</button></div>
    </section>}
  </main>
}
createRoot(document.getElementById('root')).render(<App/>);