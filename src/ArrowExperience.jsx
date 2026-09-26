import React,{useEffect,useMemo,useRef,useState}from'react';
import{ArrowMark}from'./ArrowMark';
import{WaypointMark}from'./WaypointMark';
import{OrbitPlanet}from'./OrbitPlanet';
import{ImpactParticles,LostArrowCanvas,SpaceFieldCanvas}from'./CinematicCanvases';

const SCENES=[
  {id:1,at:0},
  {id:2,at:6500},
  {id:3,at:14000},
  {id:4,at:22500},
  {id:5,at:31500},
  {id:6,at:39500},
  {id:7,at:48500},
  {id:8,at:56500},
  {id:9,at:64500},
  {id:10,at:73000},
  {id:11,at:82000},
  {id:12,at:89500},
];

function seeded(seed){
  let s=seed|0;
  return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296};
}

function ModuleCopy({role,name,children}){
  return <div className="ax-module-copy">
    <div className="ax-role">{role}</div>
    <h2>{name}</h2>
    <p>{children}</p>
  </div>;
}

function TravelCraft({variant='default'}){
  return <div className={'ax-travel-craft ax-travel-'+variant}>
    <ArrowMark size={42}/>
    <i/>
  </div>;
}

function AtlasVisual(){
  const anchors=useMemo(()=>[
    {id:'files',label:'FILES',x:18,y:28},
    {id:'projects',label:'PROJECTS',x:70,y:23},
    {id:'links',label:'LINKS',x:25,y:68},
    {id:'accounts',label:'ACCOUNTS',x:75,y:66},
    {id:'media',label:'MEDIA',x:51,y:46},
  ],[]);

  const nodes=useMemo(()=>{
    const rnd=seeded(232);
    return Array.from({length:64},(_,i)=>{
      const group=i%anchors.length;
      const a=anchors[group];
      return{
        id:i,
        group,
        x:Math.max(5,Math.min(95,a.x+(rnd()-.5)*30)),
        y:Math.max(7,Math.min(91,a.y+(rnd()-.5)*24)),
        size:2+rnd()*4.6,
        delay:rnd()*2.8,
      };
    });
  },[anchors]);

  const edges=useMemo(()=>{
    const list=[];
    nodes.forEach((n,i)=>{
      const a=anchors[n.group];
      list.push({x1:n.x,y1:n.y,x2:a.x,y2:a.y,key:'a'+i});
      if(i>5&&i%3===0){
        const p=nodes[i-5];
        list.push({x1:n.x,y1:n.y,x2:p.x,y2:p.y,key:'p'+i});
      }
    });
    return list;
  },[anchors,nodes]);

  return <div className="ax-atlas-map" aria-hidden="true">
    <div className="ax-atlas-grid"/>
    <div className="ax-atlas-orbit ao1"/><div className="ax-atlas-orbit ao2"/>
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      {edges.map(e=><line key={e.key} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}/>)}
    </svg>
    {nodes.map(n=><i key={n.id} className={'ax-atlas-node g'+n.group} style={{
      left:n.x+'%',top:n.y+'%',width:n.size+'px',height:n.size+'px','--delay':n.delay+'s'
    }}/>)}
    {anchors.map((a,i)=><div key={a.id} className={'ax-atlas-anchor a'+i} style={{left:a.x+'%',top:a.y+'%'}}>
      <b/><span>{a.label}</span>
    </div>)}
    <div className="ax-atlas-legend"><span><i/>POINT = SOMETHING IN YOUR WORLD</span><span><em/>LINE = A RELATIONSHIP</span></div>
  </div>;
}

function RavinVisual(){
  const bits=useMemo(()=>{
    const rnd=seeded(811);
    return Array.from({length:44},(_,i)=>({
      id:i,x:7+rnd()*86,y:9+rnd()*82,d:rnd()*2.6,s:2+rnd()*3.2
    }));
  },[]);

  return <div className="ax-ravin-world" aria-hidden="true">
    <div className="ax-ravin-mesh"/>
    <div className="ax-ravin-ring rr1"/><div className="ax-ravin-ring rr2"/><div className="ax-ravin-ring rr3"/>
    <div className="ax-ravin-core"><span>CONTEXT</span><b>→</b><span>DECISION</span></div>
    <div className="ax-ravin-rays">{Array.from({length:20},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>
    <div className="ax-ravin-bits">{bits.map(b=><i key={b.id} style={{left:b.x+'%',top:b.y+'%',width:b.s+'px',height:b.s+'px','--d':b.d+'s'}}/>)}</div>
    <div className="ax-ravin-steps"><span>UNDERSTAND</span><span>REASON</span><span>ACT</span></div>
    <div className="ax-ravin-inputs"><span>FILES</span><span>MESSAGES</span><span>PLANS</span></div>
  </div>;
}

function RelayVisual(){
  const endpoints=useMemo(()=>[
    {id:'you',label:'YOU',x:50,y:10},
    {id:'friends',label:'FRIENDS',x:14,y:72},
    {id:'groups',label:'GROUPS',x:86,y:72},
    {id:'school',label:'SCHOOL',x:14,y:18},
  ],[]);
  const hub=useMemo(()=>({x:50,y:31}),[]);

  const packets=useMemo(()=>{
    const rnd=seeded(404);
    return Array.from({length:32},(_,i)=>{
      const endpoint=endpoints[i%endpoints.length];
      return{
        id:i,
        x:endpoint.x,
        y:endpoint.y,
        delay:-rnd()*4.8,
        dur:2.8+rnd()*2.7,
        size:3+rnd()*3.5,
        outbound:i%4===0,
      };
    });
  },[endpoints]);

  return <div className="ax-relay-world" aria-hidden="true">
    <div className="ax-relay-grid"/><div className="ax-relay-status">SIGNAL ROUTING THROUGH RELAY</div>
    <svg className="ax-relay-links" viewBox="0 0 100 100" preserveAspectRatio="none">
      {endpoints.map(e=><line key={e.id} x1={e.x} y1={e.y} x2={hub.x} y2={hub.y}/>)}
    </svg>
    <div className="ax-relay-tower">
      <span className="ax-relay-beacon"/>
      <span className="ax-relay-mast"/>
      <span className="ax-relay-leg left"/>
      <span className="ax-relay-leg right"/>
      <i/><i/><i/><b/><b/><b/>
    </div>
    {endpoints.map(e=><div key={e.id} className="ax-relay-end" style={{left:e.x+'%',top:e.y+'%'}}><i/>{e.label}</div>)}
    {packets.map(p=><span key={p.id} className={'ax-relay-packet'+(p.outbound?' outbound':'')} style={{
      '--sx':p.x+'%','--sy':p.y+'%','--hx':hub.x+'%','--hy':hub.y+'%',
      '--delay':p.delay+'s','--dur':p.dur+'s','--size':p.size+'px'
    }}/>)}
  </div>;
}

function WaypointVisual(){
  const inputs=[
    ['IDEA','-34vw','-17vh','-7deg'],
    ['TASK','31vw','-19vh','9deg'],
    ['DEADLINE','-31vw','20vh','6deg'],
    ['GOAL','33vw','18vh','-9deg'],
    ['MAYBE LATER','-4vw','27vh','4deg'],
  ];

  return <div className="ax-waypoint-world" aria-hidden="true">
    <div className="ax-waypoint-grid"/>
    <div className="ax-waypoint-beacon">
      <div className="ax-beacon-glow"/>
      <WaypointMark size={178} active/>
    </div>
    <div className="ax-waypoint-inputs">
      {inputs.map(([label,x,y,r],i)=><span key={label} className={'w'+i} style={{'--x':x,'--y':y,'--r':r}}>{label}</span>)}
    </div>
    <div className="ax-waypoint-route">
      <i className="route"/>
      <i className="point p1"/><i className="point p2"/><i className="point p3"/>
      <b>→</b>
    </div>
    <div className="ax-waypoint-next"><span>DESTINATION CHOSEN</span><strong>NEXT → DO THE FIRST CLEAR THING</strong></div>
  </div>;
}

function Intro({onStart}){
  return <section className="ax-scene ax-intro">
    <LostArrowCanvas mode="wander"/>
    <div className="ax-intro-title">ARROW</div>
    <button className="ax-start" onClick={onStart}>
      <span className="ax-hero-ring r1"/><span className="ax-hero-ring r2"/>
      <ArrowMark size={84} className="ax-hero-mark"/>
      <strong>FIND YOUR DIRECTION</strong>
      <small>CLICK TO BEGIN</small>
    </button>
    <p className="ax-intro-note">Everything is moving. Not everything is moving together.</p>
  </section>;
}

function Converge(){
  return <section className="ax-scene ax-converge">
    <LostArrowCanvas mode="converge"/>
    <div className="ax-title-shatter" aria-hidden="true">{['A','R','R','O','W'].map((x,i)=><span key={i}>{x}</span>)}</div>
    <div className="ax-charge"><ArrowMark size={88}/></div>
    <div className="ax-converge-copy"><span>SCATTERED.</span><span>UNCONNECTED.</span><b>CHOOSE A DIRECTION.</b></div>
  </section>;
}

function Ignition(){
  const mobile=typeof window!=='undefined'&&matchMedia('(max-width: 700px)').matches;
  return <section className="ax-scene ax-ignition">
    <ImpactParticles count={mobile?110:420} lightweight={mobile}/><div className="ax-impact-flash"/><div className="ax-impact-core"/><div className="ax-impact-ring ir1"/><div className="ax-impact-ring ir2"/>
    <div className="ax-beam soft"/><div className="ax-beam core"/>
    <div className="ax-hit-glow"/>
    <div className="ax-shock s1"/><div className="ax-shock s2"/><div className="ax-shock s3"/>
    <div className="ax-launch"><ArrowMark size={82}/></div>
    <div className="ax-lock">DIRECTION LOCKED</div>
  </section>;
}

function Direction(){
  return <section className="ax-scene ax-direction">
    <div className="ax-speed-tunnel"/>
    <div className="ax-direction-copy">
      <span>GIVE YOUR LIFE</span>
      <strong>DIRECTION.</strong>
      <p>One connected system for the things you do, know, build, remember, and share.</p>
    </div>
    <div className="ax-direction-craft"><ArrowMark size={72}/><i/></div>
  </section>;
}

function Chaos(){
  const words=['MESSAGES','FILES','PROJECTS','PEOPLE','EVENTS','IDEAS','TASKS','MUSIC','NOTES','AI','CALENDAR','MEMORIES','LINKS','GOALS'];
  return <section className="ax-scene ax-chaos">
    <div className="ax-chaos-words" aria-hidden="true">{words.map((w,i)=><span key={w} className={'c'+i}>{w}</span>)}</div>
    <div className="ax-chaos-craft"><ArrowMark size={72}/></div>
    <div className="ax-story-copy">
      <div className="ax-role">YOUR LIFE IS EVERYWHERE</div>
      <h2>Messages. Files. Ideas. People.<br/><b>All moving separately.</b></h2>
      <p>Different parts of your life stay distinct — ARROW gives them one shared direction.</p>
    </div>
  </section>;
}

function Organize(){
  return <section className="ax-scene ax-organize">
    <div className="ax-organize-lines">{Array.from({length:28},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>
    <div className="ax-organize-dots">{Array.from({length:36},(_,i)=><i key={i} style={{'--i':i}}/>)}</div>
    <div className="ax-organize-arrow"><ArrowMark size={78}/></div>
    <div className="ax-story-copy">
      <div className="ax-role">ARROW CONNECTS THE PIECES</div>
      <h2>Chaos becomes <b>direction.</b></h2>
      <p>Nothing disappears. It resolves into focused places — each with one clear job.</p>
    </div>
  </section>;
}

function Atlas(){
  return <section className="ax-scene ax-module ax-atlas">
    <AtlasVisual/>
    <TravelCraft variant="atlas"/>
    <ModuleCopy role="PERSONAL LIFE MAP" name="ATLAS">
      Your digital world becomes a map: things become points, relationships become lines, and connected context becomes visible.
    </ModuleCopy>
  </section>;
}

function Ravin(){
  return <section className="ax-scene ax-module ax-ravin">
    <RavinVisual/>
    <TravelCraft variant="ravin"/>
    <ModuleCopy role="INTELLIGENCE CORE" name="RAVIN">
      Your intelligence layer: understand context, reason across your world, then help turn an answer into action.
    </ModuleCopy>
  </section>;
}

function Relay(){
  return <section className="ax-scene ax-module ax-relay">
    <RelayVisual/>
    <TravelCraft variant="relay"/>
    <ModuleCopy role="COMMUNICATIONS CENTER" name="RELAY">
      Your communications center: people, groups, and coordination stay connected to the rest of your system.
    </ModuleCopy>
  </section>;
}

function Waypoint(){
  return <section className="ax-scene ax-module ax-waypoint">
    <WaypointVisual/>
    <TravelCraft variant="waypoint"/>
    <ModuleCopy role="INTENTION & EXECUTION" name="WAYPOINT">
      Your execution layer: capture the mess, choose the destination, and turn it into the next clear move.
    </ModuleCopy>
  </section>;
}

function Orbit(){
  return <section className="ax-scene ax-module ax-orbit">
    <div className="ax-orbit-stage"><OrbitPlanet active introMix={1} showDestinations={false} showCore={false} showCraft={true}/></div>
    <ModuleCopy role="CENTRAL NAVIGATION" name="ORBIT">
      Your central world — the place you return to and navigate outward from, without module labels pinned onto the sphere.
    </ModuleCopy>
  </section>;
}

function Final(){
  return <section className="ax-scene ax-final">
    <div className="ax-final-sun"/>
    <ArrowMark size={96} className="ax-final-mark"/>
    <div className="ax-final-copy">
      <small>RESONANT ASSIST PRESENTS</small>
      <h1>PROJECT<br/><b>ARROW</b></h1>
      <p>YOUR LIFE. CONNECTED.</p>
      <strong>GIVE IT DIRECTION.</strong>
    </div>
  </section>;
}

function Landing({onReplay}){
  return <section className="ax-scene ax-landing">
    <div className="ax-landing-orbit"><OrbitPlanet active introMix={1} showDestinations={false} showCore={false} showCraft={true}/></div>
    <div className="ax-landing-shade"/>
    <div className="ax-landing-copy">
      <ArrowMark size={54}/>
      <small>PROJECT ARROW</small>
      <h1>Your digital life.<br/><b>Moving together.</b></h1>
      <p>Atlas. RAVIN. Relay. Orbit. Waypoint. One connected system designed to give the moving parts of your life a direction.</p>
      <div className="ax-actions"><button onClick={()=>{window.location.href="https://link9060.github.io/Resonant-Orbit/"}}>EXPLORE ARROW <span>→</span></button><button onClick={onReplay}>REPLAY EXPERIENCE</button></div>
    </div>
  </section>;
}

export function ArrowExperience(){
  const[scene,setScene]=useState(0);
  const[running,setRunning]=useState(false);
  const[reduced,setReduced]=useState(false);
  const timers=useRef([]);

  useEffect(()=>{
    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(mq.matches);
    update();
    mq.addEventListener?.('change',update);
    return()=>mq.removeEventListener?.('change',update);
  },[]);

  useEffect(()=>{
    const move=e=>{
      const mx=(e.clientX/innerWidth-.5)*2;
      const my=(e.clientY/innerHeight-.5)*2;
      document.documentElement.style.setProperty('--mx',mx.toFixed(3));
      document.documentElement.style.setProperty('--my',my.toFixed(3));
      document.documentElement.style.setProperty('--mxp',(mx*3).toFixed(2)+'%');
      document.documentElement.style.setProperty('--myp',(my*3).toFixed(2)+'%');
    };
    addEventListener('pointermove',move,{passive:true});
    return()=>removeEventListener('pointermove',move);
  },[]);

  useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);

  function clear(){
    timers.current.forEach(clearTimeout);
    timers.current=[];
  }

  function begin(){
    if(running)return;
    document.documentElement.requestFullscreen?.().catch(()=>{});
    clear();
    setRunning(true);
    if(reduced){setScene(12);return;}
    setScene(1);
    for(const item of SCENES.slice(1)){
      timers.current.push(setTimeout(()=>setScene(item.id),item.at));
    }
  }

  function skip(){
    clear();
    setRunning(true);
    setScene(12);
  }

  function replay(){
    clear();
    setRunning(false);
    setScene(0);
  }

  const progress=scene===0?0:scene>=12?100:Math.round((scene/12)*100);
  const sceneNames=['READY','ALIGN','IGNITION','DIRECTION','CHAOS','CONNECT','ATLAS','RAVIN','RELAY','WAYPOINT','ORBIT','ARROW','EXPLORE'];

  const views=[<Intro onStart={begin}/>,<Converge/>,<Ignition/>,<Direction/>,<Chaos/>,<Organize/>,<Atlas/>,<Ravin/>,<Relay/>,<Waypoint/>,<Orbit/>,<Final/>,<Landing onReplay={replay}/>];

  return <main className={'arrow-experience scene-'+scene}>
    <SpaceFieldCanvas scene={scene}/>
    <div className="ax-grain"/><div className="ax-vignette"/><div className="ax-ambient"/>
    <header className="ax-brand">RESONANT ASSIST <i>/</i> PROJECT ARROW</header>
    {running&&scene<12?<button className="ax-skip" onClick={skip}>SKIP EXPERIENCE</button>:null}
    {running&&scene>0&&scene<12?<div className="ax-progress" aria-hidden="true"><i style={{width:progress+'%'}}/><span>{sceneNames[scene]}</span></div>:null}
    <div key={scene} className={'ax-scene-transition t'+scene} aria-hidden="true"/>
    {views[scene]}
  </main>;
}
