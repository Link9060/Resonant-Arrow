import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowMark } from './ArrowMark';
import { WaypointMark } from './WaypointMark';
import { CinematicStage } from './CinematicStage';
import { createClock, SCENES, sceneAt, DURATION } from './playback';

const MODULES = ['ATLAS', 'RAVIN', 'RELAY', 'ORBIT', 'WAYPOINT'];
const WORDS = ['MESSAGES', 'FILES', 'PROJECTS', 'PEOPLE', 'EVENTS', 'IDEAS', 'TASKS', 'MUSIC', 'NOTES', 'AI', 'CALENDAR', 'MEMORIES', 'LINKS', 'GOALS'];
const WORD_POS = [[15,14],[70,12],[17,76],[78,74],[44,9],[12,42],[82,42],[42,80],[29,32],[62,60],[62,29],[24,62],[36,52],[65,83]];
const GROUPS = [2,0,0,2,4,1,4,0,0,1,4,0,0,4];
const DEST_POS = [[20,25],[80,25],[20,73],[50,48],[80,73]];

function ModuleCopy({ role, name, children }) {
  return <div className="ax-module-copy"><div className="ax-role">{role}</div><h2>{name}</h2><p>{children}</p></div>;
}
function StoryCopy({ role, title, children }) {
  return <div className="ax-story-copy"><div className="ax-role">{role}</div><h2>{title}</h2><p>{children}</p></div>;
}
function Information({ organized = false }) {
  return <div className={'ax-visual ax-information ' + (organized ? 'is-organized' : '')} aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ax-connect-links">
      {DEST_POS.map(([x,y], i) => <line key={i} x1="50" y1="48" x2={x} y2={y} />)}
    </svg>
    {WORDS.map((word,i) => <span key={word} className="ax-word" style={{ '--x': WORD_POS[i][0]+'%', '--y': WORD_POS[i][1]+'%', '--tx': DEST_POS[GROUPS[i]][0]+'%', '--ty': DEST_POS[GROUPS[i]][1]+'%', '--i':i }}>{word}</span>)}
    {organized && DEST_POS.map(([x,y],i) => <div key={i} className={'ax-destination dest-'+i} style={{left:x+'%',top:y+'%', '--i':i}}><i/>{MODULES[i]}</div>)}
  </div>;
}
function AtlasVisual() {
  const anchors = [[20,24,'FILES'],[76,21,'PROJECTS'],[20,73,'LINKS'],[77,72,'ACCOUNTS'],[50,46,'MEDIA']];
  return <div className="ax-visual ax-atlas-map" aria-hidden="true">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ax-atlas-links">
      {anchors.map(([x,y],i) => <line key={'main'+i} x1="50" y1="46" x2={x} y2={y} className="ax-main-link" style={{'--i':i}} />)}
      {Array.from({length:35},(_,i) => {
        const a = anchors[i%5], angle = i*2.39996, r = 7+(i%4)*2;
        const x=a[0]+Math.cos(angle)*r, y=a[1]+Math.sin(angle)*r;
        return <g key={i} style={{'--i':i%5}}><line x1={a[0]} y1={a[1]} x2={x} y2={y}/><circle cx={x} cy={y} r=".35"/></g>;
      })}
    </svg>
    {anchors.map(([x,y,label],i) => <div key={label} className="ax-map-anchor" style={{left:x+'%',top:y+'%','--i':i}}><i/><span>{label}</span></div>)}
    <div className="ax-visual-caption">Your files. Their connections. One map.</div>
  </div>;
}
function RavinVisual() {
  return <div className="ax-visual ax-ravin-world" aria-hidden="true">
    <svg className="ax-ravin-flow" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M12 28 Q35 28 50 48 Q65 68 88 68"/></svg>
    <div className="ax-ravin-orbit ro1"/><div className="ax-ravin-orbit ro2"/>
    <div className="ax-ravin-core"><i/><b/><em/></div>
    <div className="ax-ravin-label input">CONTEXT</div><div className="ax-ravin-label output">CLEAR NEXT STEP</div>
    <div className="ax-ravin-thoughts"><span>UNDERSTAND</span><span>REASON</span><span>ACT</span></div>
  </div>;
}
function RelayVisual() {
  const endpoints = [[17,23,'SCHOOL'],[83,23,'YOU'],[17,74,'FRIENDS'],[83,74,'GROUPS']];
  return <div className="ax-visual ax-relay-world" aria-hidden="true">
    <svg className="ax-relay-links" viewBox="0 0 100 100" preserveAspectRatio="none">
      {endpoints.map(([x,y,label]) => <line key={label} x1="50" y1="31" x2={x} y2={y}/>)}
    </svg>
    <svg className="ax-tower" viewBox="0 0 140 240" preserveAspectRatio="xMidYMin meet"><path d="M70 0 L26 226 H114 Z M70 0 V226 M56 79 H84 M42 148 H98 M56 79 L98 148 L26 226 M84 79 L42 148 L114 226"/><circle cx="70" cy="0" r="5"/></svg>
    <div className="ax-relay-beacon"><i/><i/><i/></div>
    {endpoints.map(([x,y,label],i) => <React.Fragment key={label}><div className="ax-relay-end" style={{left:x+'%',top:y+'%'}}><i/>{label}</div><span className="ax-packet" style={{'--tx':x+'%','--ty':y+'%','--i':i}}/></React.Fragment>)}
    <div className="ax-visual-caption">A signal becomes a conversation.</div>
  </div>;
}
function WaypointVisual() {
  const inputs = [[15,20,'IDEA'],[70,17,'TASK'],[18,77,'DEADLINE'],[80,75,'GOAL'],[48,86,'LATER']];
  return <div className="ax-visual ax-waypoint-world" aria-hidden="true">
    <div className="ax-waypoint-beacon"><WaypointMark size={124}/></div>
    {inputs.map(([x,y,label],i) => <span className="ax-waypoint-input" key={label} style={{'--x':x+'%','--y':y+'%','--i':i}}>{label}</span>)}
    <div className="ax-waypoint-route"><i/><span className="p1"/><span className="p2"/><span className="p3"/><b>→</b></div>
    <div className="ax-waypoint-next"><small>DESTINATION CHOSEN</small><strong>Take the first clear step.</strong></div>
  </div>;
}
function OrbitVisual() {
  return <div className="ax-visual ax-orbit-world" aria-hidden="true">
    {[[15,21,'ATLAS'],[85,21,'RAVIN'],[15,76,'RELAY'],[85,76,'WAYPOINT']].map(([x,y,label],i) => <div className="ax-orbit-destination" key={label} style={{left:x+'%',top:y+'%','--i':i}}><i/>{label}</div>)}
    <div className="ax-orbit-center">ORBIT<span>ONE CONNECTED WORLD</span></div>
  </div>;
}

export function ArrowExperience() {
  const [scene,setScene] = useState(0);
  const [reduced,setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const clock = useRef(createClock());
  const sceneRef = useRef(0);
  const canvas = useRef(null);
  const visualSlot = useRef(null);
  const sceneElement = useRef(null);
  const animations = useRef([]);
  const progress = useRef(null);
  const [run,setRun] = useState(0);

  // CSS animations are scrubbed by the same elapsed time as the canvas. No
  // independent timers, animation delays on a default-facing craft, or catch-up
  // jumps after a hidden tab. New scene markup catches up before its first paint.
  useLayoutEffect(() => {
    animations.current = sceneElement.current?.getAnimations({subtree:true}) || [];
    const local = scene === 0 ? 0 : clock.current.elapsed - SCENES[scene-1].at;
    for (const animation of animations.current) { animation.pause(); animation.currentTime = Math.max(0,local); }
  },[scene,run]);

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(mq.matches); if (mq.matches) { clock.current.finish(); sceneRef.current=12; setScene(12); } };
    mq.addEventListener('change',update);
    return () => mq.removeEventListener('change',update);
  },[]);

  useEffect(() => {
    let frame=0, idle=0, last=performance.now();
    function draw(now) {
      frame=0;
      if(document.hidden) return;
      idle += Math.min(50,Math.max(0,now-last)); last=now;
      const elapsed=clock.current.tick(now);
      const next=sceneRef.current===0?0:sceneAt(elapsed).id;
      if(next!==sceneRef.current) { sceneRef.current=next; setScene(next); }
      const local=next===0?idle:elapsed-SCENES[next-1].at;
      // Don't scrub outgoing DOM with the new scene's local time.
      if (Number(sceneElement.current?.dataset.scene)===next) {
        for (const animation of animations.current) animation.currentTime=reduced?100000:local;
      }
      if(progress.current) progress.current.style.transform=`scaleX(${elapsed/DURATION})`;
      canvas.current?.draw({scene:next, local:local/1000, elapsed:elapsed/1000, idle:idle/1000, reduced});
      if(!reduced || clock.current.running) frame=requestAnimationFrame(draw);
    }
    const resume = () => {
      clock.current.pause(); last=performance.now();
      cancelAnimationFrame(frame); frame=0;
      if(!document.hidden) frame=requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange',resume);
    window.addEventListener('pageshow',resume);
    window.addEventListener('resize',resume);
    if(!document.hidden) frame=requestAnimationFrame(draw);
    return () => {cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resume);window.removeEventListener('pageshow',resume);window.removeEventListener('resize',resume);};
  },[reduced,run]);

  function begin() {
    if(sceneRef.current!==0) return;
    if(reduced) { skip(); return; }
    clock.current.start(performance.now()); sceneRef.current=1; setScene(1);
  }
  function skip() { clock.current.finish(); sceneRef.current=12; setScene(12);setRun(v=>v+1); }
  function replay() {clock.current.reset();sceneRef.current=0;setScene(0);setRun(v=>v+1);}

  const scenes = [
    <><div className="ax-intro-title">ARROW</div><button className="ax-start" onClick={begin}><span className="ax-start-target"/><strong>FIND YOUR DIRECTION</strong><small>{reduced?'EXPLORE ARROW':'TAP OR CLICK TO BEGIN'}</small></button><p className="ax-intro-note">Everything is moving.<br/>Not everything is moving together.</p></>,
    <><div className="ax-title-shatter">ARROW</div><p className="ax-lock">SCATTERED. UNCONNECTED.<br/><b>CHOOSE A DIRECTION.</b></p></>,
    <p className="ax-lock ignition-lock">DIRECTION LOCKED</p>,
    <div className="ax-direction-copy"><span>GIVE YOUR LIFE</span><h1>DIRECTION.</h1><p>One connected system for the things you do,<br className="desktop-break"/> know, create, and share.</p></div>,
    <><Information/><StoryCopy role="YOUR LIFE IS EVERYWHERE" title={<>Messages. Files. Ideas. People.<br/><b>All moving separately.</b></>}>Everything matters. Nothing connects.</StoryCopy></>,
    <><Information organized/><StoryCopy role="ARROW CONNECTS THE PIECES" title={<>Chaos becomes <b>direction.</b></>}>Five focused places. One connected system.</StoryCopy></>,
    <><AtlasVisual/><ModuleCopy role="PERSONAL LIFE MAP" name="ATLAS">Files, ideas, and projects — connected in one living map.</ModuleCopy></>,
    <><RavinVisual/><ModuleCopy role="INTELLIGENCE CORE" name="RAVIN">Connect the context. Understand the problem. Find your next move.</ModuleCopy></>,
    <><RelayVisual/><ModuleCopy role="COMMUNICATION CENTER" name="RELAY">Your people, conversations, and plans — moving together.</ModuleCopy></>,
    <><WaypointVisual/><ModuleCopy role="INTENTION & EXECUTION" name="WAYPOINT">Capture the mess. Choose a direction. Take the next step.</ModuleCopy></>,
    <><OrbitVisual/><ModuleCopy role="CENTRAL NAVIGATION" name="ORBIT">Your whole world, connected. A place to return. A way forward.</ModuleCopy></>,
    <div className="ax-final-copy"><ArrowMark size={70} className="ax-up"/><small>RESONANT ASSIST PRESENTS</small><h1>PROJECT<br/><b>ARROW</b></h1><p>YOUR LIFE. CONNECTED.</p><strong>GIVE IT DIRECTION.</strong></div>,
    <div className="ax-landing-copy"><ArrowMark size={48} className="ax-up"/><small>PROJECT ARROW</small><h1>Your digital life.<br/><b>Moving together.</b></h1><p>Atlas. RAVIN. Relay. Orbit. Waypoint.<br/>One connected system to give your life direction.</p><div className="ax-actions"><a href="https://link9060.github.io/Resonant-Orbit/">EXPLORE ARROW <span>↗</span></a><button onClick={replay}>REPLAY EXPERIENCE</button></div></div>,
  ];

  return <main className={'arrow-experience scene-'+scene} data-build="cinematic-49">
    <div className="ax-visual ax-visual-slot" ref={visualSlot} aria-hidden="true"/>
    <CinematicStage ref={canvas} slotRef={visualSlot}/>
    <header className="ax-brand">RESONANT ASSIST <span>/ PROJECT ARROW</span></header>
    {scene>0&&scene<12&&<button className="ax-skip" onClick={skip}>SKIP <span>EXPERIENCE</span> ↗</button>}
    <section ref={sceneElement} key={scene+'-'+run} data-scene={scene} className={'ax-scene ax-scene-'+scene} aria-label={scene===0?'Start ARROW':SCENES[scene-1].name}>{scenes[scene]}</section>
    {scene>0&&scene<12&&<div className="ax-progress" aria-hidden="true"><span>{String(scene).padStart(2,'0')} / {SCENES[scene-1].name}</span><div><i ref={progress}/></div></div>}
  </main>;
}
