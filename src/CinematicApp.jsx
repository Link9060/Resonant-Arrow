import React,{useEffect,useMemo,useRef,useState}from'react';
import{ArrowMark}from'./ArrowMark';
import{OrbitPlanet}from'./OrbitPlanet';
import{AmbientCanvas,LostArrowField}from'./MotionField';
import{PixelField}from'./PixelField';

const TIMELINE=[
  [0,1],
  [5200,2],
  [10800,3],
  [18400,4],
  [26000,5],
  [32500,6],
  [38500,7],
  [44500,8],
  [50500,9],
  [58500,10],
  [65000,11],
];

function seeded(seed){
  let s=seed|0;
  return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296};
}

function AtlasVisual(){
  const nodes=useMemo(()=>{
    const rnd=seeded(232);
    return Array.from({length:23},(_,i)=>({
      id:i,x:10+rnd()*80,y:12+rnd()*72,s:2+rnd()*5,d:rnd()*2.4
    }));
  },[]);
  return <div className="v3AtlasField" aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {nodes.slice(1).map((n,i)=>{
        const p=nodes[Math.max(0,Math.floor(i*.55))];
        return <line key={n.id} x1={p.x} y1={p.y} x2={n.x} y2={n.y}/>;
      })}
    </svg>
    {nodes.map(n=><i key={n.id} style={{left:n.x+'%',top:n.y+'%',width:n.s+'px',height:n.s+'px','--d':n.d+'s'}}/>)}
  </div>;
}

function RavinVisual(){
  return <div className="v3RavinCore" aria-hidden="true">
    <div className="v3CoreHalo h1"/><div className="v3CoreHalo h2"/><div className="v3CoreHalo h3"/>
    <div className="v3CoreOrb"/>
    {Array.from({length:18},(_,i)=><i key={i} style={{'--i':i}}/>)}
  </div>;
}

function RelayVisual(){
  return <div className="v3RelayWorld" aria-hidden="true">
    <div className="v3Tower"><i/><i/><i/></div>
    <div className="v3Signal s1"/><div className="v3Signal s2"/><div className="v3Signal s3"/>
    {Array.from({length:12},(_,i)=><span key={i} className={'v3Packet p'+i}/>)}
  </div>;
}

export function CinematicApp(){
  const[scene,setScene]=useState(0);
  const[running,setRunning]=useState(false);
  const timers=useRef([]);

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
  const clearTimers=()=>{timers.current.forEach(clearTimeout);timers.current=[]};

  function start(){
    if(running)return;
    clearTimers();
    setRunning(true);
    setScene(1);
    TIMELINE.slice(1).forEach(([ms,s])=>timers.current.push(setTimeout(()=>setScene(s),ms)));
  }
  function skip(){clearTimers();setRunning(true);setScene(11)}
  function replay(){clearTimers();setRunning(false);setScene(0)}

  const chaos=['MESSAGES','FILES','PROJECTS','PEOPLE','EVENTS','IDEAS','TASKS','MUSIC','NOTES','AI','CALENDAR','MEMORIES'];

  return <main className={'app v3 scene-'+scene+(running?' is-running':'')}>
    <AmbientCanvas scene={scene}/>
    <div className="grain"/><div className="vignette"/><div className="edgeGlow"/>
    <div className="brandLockup">RESONANT ASSIST <i>/</i> PROJECT ARROW</div>
    {running&&scene<11?<button className="skip" onClick={skip}>SKIP EXPERIENCE</button>:null}

    {scene===0&&<section className="v3Intro">
      <LostArrowField/>
      <div className="v3GhostTitle">ARROW</div>
      <button className="v3Start" onClick={start}>
        <span className="v3Halo h1"/><span className="v3Halo h2"/>
        <ArrowMark size={68} className="v3ArrowUp v3HeroMark"/>
        <b>FIND YOUR DIRECTION</b>
        <small>CLICK TO BEGIN</small>
      </button>
    </section>}

    {scene===1&&<section className="v3Prelude">
      <LostArrowField converging/>
      <div className="v3WordBreak">
        {['A','R','R','O','W'].map((l,i)=><span key={i}>{l}</span>)}
      </div>
      <div className="v3PreArrow"><ArrowMark size={74} className="v3ArrowUp"/></div>
      <div className="v3PreCopy"><span>EVERYTHING MOVES.</span><b>NOTHING MOVES TOGETHER.</b></div>
    </section>}

    {scene===2&&<section className="v3Ignition">
      <PixelField/>
      <div className="v3Beam soft"/><div className="v3Beam core"/>
      <div className="v3HitGlow"/>
      <div className="v3Ring r1"/><div className="v3Ring r2"/><div className="v3Ring r3"/>
      <div className="v3LaunchCraft"><ArrowMark size={80} className="v3ArrowUp"/></div>
      <span className="v3Lock">DIRECTION LOCKED</span>
    </section>}

    {scene===3&&<section className="v3Direction">
      <div className="v3Tunnel"/>
      <div className="v3DirectionCopy">
        <span>GIVE YOUR LIFE</span>
        <strong>DIRECTION.</strong>
        <p>One connected system for the things you do, know, build, remember, and share.</p>
      </div>
      <div className="v3PassCraft"><ArrowMark size={60} className="v3ArrowUp"/></div>
      <div className="v3DirectionShards" aria-hidden="true">{Array.from({length:18},(_,i)=><i key={i}/>)}</div>
    </section>}

    {scene===4&&<section className="v3Chaos">
      <div className="v3ChaosDepth" aria-hidden="true">
        {chaos.map((w,i)=><span key={w} className={'d'+i}>{w}</span>)}
      </div>
      <div className="v3ChaosCraft"><ArrowMark size={55} className="v3ArrowUp"/></div>
      <div className="v3ChaosCopy">
        <small>YOUR LIFE IS EVERYWHERE.</small>
        <h2>Messages. Files. Ideas. People.<br/><b>All moving separately.</b></h2>
      </div>
    </section>}

    {scene===5&&<section className="v3Organize">
      <div className="v3OrganizePulse"/>
      <div className="v3FlowLines" aria-hidden="true">{Array.from({length:26},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>
      <div className="v3OrganizeArrow"><ArrowMark size={58} className="v3ArrowUp"/></div>
      <div className="v3OrganizeCopy"><small>ARROW CONNECTS THE PIECES</small><h2>Chaos becomes <b>direction.</b></h2></div>
    </section>}

    {scene===6&&<section className="v3World v3Atlas">
      <AtlasVisual/>
      <div className="v3WorldCraft"><ArrowMark size={46} className="v3ArrowUp"/></div>
      <div className="v3WorldCopy"><small>01 / YOUR WORLD</small><h2>ATLAS</h2><p>Files, ideas, knowledge, and the things you own — connected as one navigable map.</p></div>
    </section>}

    {scene===7&&<section className="v3World v3Ravin">
      <RavinVisual/>
      <div className="v3WorldCraft ravinCraft"><ArrowMark size={46} className="v3ArrowUp"/></div>
      <div className="v3WorldCopy"><small>02 / INTELLIGENCE</small><h2>RAVIN</h2><p>An intelligence layer that understands the context surrounding your world.</p></div>
    </section>}

    {scene===8&&<section className="v3World v3Relay">
      <RelayVisual/>
      <div className="v3WorldCraft relayCraft"><ArrowMark size={46} className="v3ArrowUp"/></div>
      <div className="v3WorldCopy"><small>03 / CONNECTION</small><h2>RELAY</h2><p>Communication and coordination without breaking the rest of your flow.</p></div>
    </section>}

    {scene===9&&<section className="v3Orbit">
      <div className="v3OrbitCamera">
        <OrbitPlanet active introMix={1} showDestinations={false} showCore={false} showCraft={true}/>
      </div>
      <div className="v3OrbitCopy"><small>04 / THE CENTER</small><h2>ORBIT</h2><p>Not another dashboard. The place the whole system comes back to.</p></div>
    </section>}

    {scene===10&&<section className="v3Final">
      <div className="v3FinalSun"/>
      <ArrowMark size={76} className="v3ArrowUp v3FinalMark"/>
      <div className="v3FinalCopy"><small>RESONANT ASSIST PRESENTS</small><h1>PROJECT<br/><b>ARROW</b></h1><p>YOUR LIFE. CONNECTED.</p><strong>GIVE IT DIRECTION.</strong></div>
    </section>}

    {scene===11&&<section className="v3Landing">
      <div className="v3LandingPlanet"><OrbitPlanet active introMix={1} showDestinations={false} showCore={false} showCraft={true}/></div>
      <div className="v3LandingShade"/>
      <div className="v3LandingContent">
        <ArrowMark size={46} className="v3ArrowUp"/>
        <small>PROJECT ARROW</small>
        <h1>Your digital life.<br/><b>Moving together.</b></h1>
        <p>Atlas. RAVIN. Relay. Orbit. One connected system designed to give the moving parts of your life a direction.</p>
        <div><button>EXPLORE ARROW →</button><button onClick={replay}>REPLAY EXPERIENCE</button></div>
      </div>
    </section>}
  </main>;
}
