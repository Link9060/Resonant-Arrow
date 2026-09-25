import React,{useEffect,useMemo,useRef,useState}from'react';
import{ArrowMark}from'./ArrowMark';
import{WaypointMark}from'./WaypointMark';
import{OrbitPlanet}from'./OrbitPlanet';
import{AmbientCanvas,LostArrowField}from'./MotionField';
import{PixelField}from'./PixelField';

const TIMELINE=[
  [0,1],
  [6400,2],
  [13800,3],
  [22000,4],
  [30000,5],
  [37000,6],
  [44500,7],
  [51000,8],
  [57500,9],
  [65000,10],
  [73500,11],
  [80500,12],
];

function seeded(seed){
  let s=seed|0;
  return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296};
}

function AtlasVisual(){
  const anchors=[
    {id:'files',label:'FILES',x:19,y:27},
    {id:'projects',label:'PROJECTS',x:70,y:23},
    {id:'links',label:'LINKS',x:24,y:67},
    {id:'accounts',label:'ACCOUNTS',x:74,y:67},
    {id:'media',label:'MEDIA',x:50,y:45},
  ];

  const nodes=useMemo(()=>{
    const rnd=seeded(232);
    return Array.from({length:54},(_,i)=>{
      const group=i%anchors.length;
      const a=anchors[group];
      return{
        id:i,
        group,
        x:Math.max(4,Math.min(96,a.x+(rnd()-.5)*30)),
        y:Math.max(5,Math.min(93,a.y+(rnd()-.5)*25)),
        s:2+rnd()*4.8,
        d:rnd()*2.8,
        halo:.2+rnd()*.8
      };
    });
  },[]);

  const edges=useMemo(()=>{
    const out=[];
    nodes.forEach((n,i)=>{
      const a=anchors[n.group];
      out.push({a:{x:n.x,y:n.y},b:a,key:'a'+i});
      if(i>4&&i%2===0){
        const p=nodes[i-5];
        out.push({a:{x:n.x,y:n.y},b:{x:p.x,y:p.y},key:'p'+i});
      }
    });
    return out;
  },[nodes]);

  return <div className="v3AtlasField v6AtlasField" aria-hidden="true">
    <div className="v4AtlasGrid"/>
    <div className="v4AtlasRing ar1"/><div className="v4AtlasRing ar2"/>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {edges.map(e=><line key={e.key} x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y}/>)}
    </svg>
    {nodes.map(n=><i key={n.id} className={'atlasParticle group-'+n.group} style={{
      left:n.x+'%',top:n.y+'%',width:n.s+'px',height:n.s+'px','--d':n.d+'s','--halo':n.halo
    }}/>)}
    {anchors.map((a,i)=><div key={a.id} className={'v6AtlasAnchor anchor-'+i} style={{left:a.x+'%',top:a.y+'%'}}>
      <b/><span>{a.label}</span>
    </div>)}
    <div className="v6AtlasLegend"><i/> ONE POINT = SOMETHING IN YOUR DIGITAL WORLD <em/> LINES = RELATIONSHIPS</div>
  </div>;
}

function RavinVisual(){
  return <div className="v3RavinCore" aria-hidden="true">
    <div className="v4CoreMesh"/>
    <div className="v3CoreHalo h1"/><div className="v3CoreHalo h2"/><div className="v3CoreHalo h3"/>
    <div className="v3CoreOrb"/>
    {Array.from({length:28},(_,i)=><i key={i} style={{'--i':i}}/>)}
    <div className="v4CoreBits">
      {Array.from({length:34},(_,i)=><span key={i} style={{
        '--i':i,'--x':((i*37)%92)+'%','--y':((i*61)%84+8)+'%','--d':((i*23)%17)/10+'s'
      }}/>)}
    </div>
    <div className="v6RavinThoughts">
      <span>CONTEXT</span><span>REASON</span><span>ACT</span>
    </div>
  </div>;
}

function RelayVisual(){
  const packets=useMemo(()=>{
    const rnd=seeded(404);
    return Array.from({length:28},(_,i)=>({
      id:i,x:6+rnd()*88,y:10+rnd()*78,delay:-rnd()*4.2,dur:2.8+rnd()*2.6,size:3+rnd()*4
    }));
  },[]);

  return <div className="v3RelayWorld" aria-hidden="true">
    <div className="v4RelayGrid"/>
    <div className="v3Tower"><i/><i/><i/><b/><b/><b/></div>
    <div className="v3Signal s1"/><div className="v3Signal s2"/><div className="v3Signal s3"/>
    <div className="v4RelayArc a1"/><div className="v4RelayArc a2"/>
    {packets.map(p=><span key={p.id} className="v3Packet" style={{
      '--x':p.x+'%','--y':p.y+'%','--delay':p.delay+'s','--dur':p.dur+'s','--size':p.size+'px'
    }}/>)}
    <div className="v6RelayLabels"><span>YOU</span><span>FRIENDS</span><span>GROUPS</span></div>
  </div>;
}

function WaypointVisual(){
  const inputs=[
    ['IDEA','-34vw','-18vh','-8deg'],
    ['TASK','31vw','-20vh','11deg'],
    ['DEADLINE','-30vw','20vh','7deg'],
    ['GOAL','33vw','18vh','-10deg'],
  ];

  return <div className="v6WaypointWorld" aria-hidden="true">
    <div className="v6WaypointGrid"/>
    <div className="v6WaypointRoute">
      <i className="routeLine"/>
      <i className="routeDot d1"/><i className="routeDot d2"/><i className="routeDot d3"/>
      <b className="routeArrow">→</b>
    </div>
    <div className="v6Beacon">
      <div className="beaconGlow"/>
      <WaypointMark size={170} active/>
    </div>
    <div className="v6WaypointInputs">
      {inputs.map(([label,x,y,r],i)=><span key={label} className={'wi wi'+i} style={{'--x':x,'--y':y,'--r':r}}>{label}</span>)}
    </div>
    <div className="v6NextMove">NEXT MOVE</div>
  </div>;
}

export function CinematicApp(){
  const[scene,setScene]=useState(0);
  const[running,setRunning]=useState(false);
  const[reducedMotion,setReducedMotion]=useState(false);
  const timers=useRef([]);

  useEffect(()=>{
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReducedMotion(motion.matches);
    update();
    motion.addEventListener?.('change',update);
    return()=>motion.removeEventListener?.('change',update);
  },[]);

  useEffect(()=>{
    const move=e=>{
      const mx=(e.clientX/innerWidth-.5)*2;
      const my=(e.clientY/innerHeight-.5)*2;
      document.documentElement.style.setProperty('--mx',mx.toFixed(3));
      document.documentElement.style.setProperty('--my',my.toFixed(3));
    };
    addEventListener('pointermove',move,{passive:true});
    return()=>removeEventListener('pointermove',move);
  },[]);

  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
  const clearTimers=()=>{timers.current.forEach(clearTimeout);timers.current=[]};

  function start(){
    if(running)return;
    clearTimers();
    setRunning(true);
    if(reducedMotion){setScene(12);return;}
    setScene(1);
    TIMELINE.slice(1).forEach(([ms,s])=>timers.current.push(setTimeout(()=>setScene(s),ms)));
  }

  function skip(){clearTimers();setRunning(true);setScene(12)}
  function replay(){clearTimers();setRunning(false);setScene(0)}

  const chaos=['MESSAGES','FILES','PROJECTS','PEOPLE','EVENTS','IDEAS','TASKS','MUSIC','NOTES','AI','CALENDAR','MEMORIES'];

  return <main className={'app v3 v4 v5 v6 scene-'+scene+(running?' is-running':'')}>
    <AmbientCanvas scene={scene}/>
    <div className="grain"/><div className="vignette"/><div className="edgeGlow"/>
    <div className="brandLockup">RESONANT ASSIST <i>/</i> PROJECT ARROW</div>
    {running&&scene<12?<button className="skip" onClick={skip}>SKIP EXPERIENCE</button>:null}
    {running&&scene>0&&scene<12?<div key={'scene-'+scene} className={'v4SceneVeil v4SceneVeil-'+scene} aria-hidden="true"/>:null}
    {scene>=6&&scene<=10?<div key={'seam-'+scene} className="v4ModuleSeam" aria-hidden="true"><ArrowMark size={26}/></div>:null}

    {scene===0&&<section className="v3Intro">
      <LostArrowField/>
      <div className="v3GhostTitle">ARROW</div>
      <button className="v3Start" onClick={start}>
        <span className="v3Halo h1"/><span className="v3Halo h2"/>
        <ArrowMark size={68} className="v3ArrowUp v3HeroMark"/>
        <b>FIND YOUR DIRECTION</b>
        <small>CLICK TO BEGIN</small>
      </button>
      <div className="v4IntroMicrocopy">Surrounded by motion. Waiting for a direction.</div>
    </section>}

    {scene===1&&<section className="v3Prelude">
      <LostArrowField converging/>
      <div className="v3WordBreak">{['A','R','R','O','W'].map((l,i)=><span key={i}>{l}</span>)}</div>
      <PixelField className="v5TitleParticles"/>
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
      <div className="v3ChaosDepth" aria-hidden="true">{chaos.map((w,i)=><span key={w} className={'d'+i}>{w}</span>)}</div>
      <div className="v3ChaosCraft"><ArrowMark size={55} className="v3ArrowUp"/></div>
      <div className="v3ChaosCopy v4CopyPlate">
        <small>YOUR LIFE IS EVERYWHERE.</small>
        <h2>Messages. Files. Ideas. People.<br/><b>All moving separately.</b></h2>
      </div>
    </section>}

    {scene===5&&<section className="v3Organize">
      <div className="v3OrganizePulse"/>
      <div className="v3FlowLines" aria-hidden="true">{Array.from({length:26},(_,i)=><i key={i}/>)}</div>
      <div className="v4ConvergeDots" aria-hidden="true">{Array.from({length:32},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>
      <div className="v3OrganizeArrow"><ArrowMark size={58} className="v3ArrowUp"/></div>
      <div className="v3OrganizeCopy v4CopyPlate">
        <small>ARROW CONNECTS THE PIECES</small><h2>Chaos becomes <b>direction.</b></h2><p>Separate motion resolves into one system.</p>
      </div>
    </section>}

    {scene===6&&<section className="v3World v3Atlas">
      <AtlasVisual/>
      <div className="v3WorldCraft"><ArrowMark size={46} className="v3ArrowUp"/></div>
      <div className="v3WorldCopy v4CopyPlate">
        <small>PERSONAL LIFE MAP</small>
        <h2>ATLAS</h2>
        <p>Each point is something in your digital world. The lines show how your files, projects, links, accounts, and media connect.</p>
      </div>
    </section>}

    {scene===7&&<section className="v3World v3Ravin">
      <RavinVisual/>
      <div className="v3WorldCraft ravinCraft"><ArrowMark size={46} className="v3ArrowUp"/></div>
      <div className="v3WorldCopy v4CopyPlate">
        <small>INTELLIGENCE CORE</small>
        <h2>RAVIN</h2>
        <p>Understands the context around your world, helps you reason through it, and can act with permission.</p>
      </div>
    </section>}

    {scene===8&&<section className="v3World v3Relay">
      <RelayVisual/>
      <div className="v3WorldCraft relayCraft"><ArrowMark size={46} className="v3ArrowUp"/></div>
      <div className="v3WorldCopy v4CopyPlate">
        <small>COMMUNICATIONS CENTER</small>
        <h2>RELAY</h2>
        <p>Keeps conversations, groups, and coordination connected without pulling you out of the rest of ARROW.</p>
      </div>
    </section>}

    {scene===9&&<section className="v3World v6Waypoint">
      <WaypointVisual/>
      <div className="v6WaypointCraft"><ArrowMark size={44} className="v3ArrowUp"/></div>
      <div className="v3WorldCopy v4CopyPlate">
        <small>INTENTION &amp; EXECUTION</small>
        <h2>WAYPOINT</h2>
        <p>Turns messy thoughts, goals, tasks, and time into a clear direction — and a realistic next move.</p>
      </div>
    </section>}

    {scene===10&&<section className="v3Orbit">
      <div className="v3OrbitCamera">
        <OrbitPlanet active introMix={1} showDestinations={false} showCore={false} showCraft={true}/>
      </div>
      <div className="v3OrbitCopy v4CopyPlate">
        <small>CENTRAL NAVIGATION</small>
        <h2>ORBIT</h2>
        <p>The place you return to — a living center for moving between every part of ARROW.</p>
      </div>
    </section>}

    {scene===11&&<section className="v3Final">
      <div className="v3FinalSun"/>
      <ArrowMark size={76} className="v3ArrowUp v3FinalMark"/>
      <div className="v3FinalCopy">
        <small>RESONANT ASSIST PRESENTS</small>
        <h1>PROJECT<br/><b>ARROW</b></h1>
        <p>YOUR LIFE. CONNECTED.</p>
        <strong>GIVE IT DIRECTION.</strong>
      </div>
    </section>}

    {scene===12&&<section className="v3Landing">
      <div className="v3LandingPlanet"><OrbitPlanet active introMix={1} showDestinations={false} showCore={false} showCraft={true}/></div>
      <div className="v3LandingShade"/>
      <div className="v3LandingContent">
        <ArrowMark size={46} className="v3ArrowUp"/>
        <small>PROJECT ARROW</small>
        <h1>Your digital life.<br/><b>Moving together.</b></h1>
        <p>Atlas. RAVIN. Relay. Waypoint. Orbit. One connected system designed to give the moving parts of your life a direction.</p>
        <div><button>EXPLORE ARROW →</button><button onClick={replay}>REPLAY EXPERIENCE</button></div>
      </div>
    </section>}
  </main>;
}
