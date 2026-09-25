import React,{useEffect,useRef,useState}from'react';
import{ArrowMark}from'./ArrowMark';
import{OrbitPlanet}from'./OrbitPlanet';
import{AmbientCanvas,LostArrowField}from'./MotionField';
import{PixelField}from'./PixelField';

const TIMELINE=[
  [0,1],[5400,2],[11200,3],[19200,4],[27500,5],
  [36000,6],[48000,7],[59000,8],[66000,9]
];

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
    clearTimers();setRunning(true);setScene(1);
    TIMELINE.slice(1).forEach(([ms,s])=>{
      timers.current.push(setTimeout(()=>setScene(s),ms));
    });
  }
  function skip(){clearTimers();setRunning(true);setScene(9)}
  function replay(){clearTimers();setRunning(false);setScene(0)}

  const chaos=['MESSAGES','FILES','PROJECTS','PEOPLE','EVENTS','IDEAS','TASKS','MUSIC','NOTES','AI','CALENDAR','MEMORIES'];
  const modules=[
    ['01','ATLAS','Your files, ideas, knowledge, and the things you own — mapped into one connected world.'],
    ['02','RAVIN','An intelligence layer that can understand the context surrounding everything else.'],
    ['03','RELAY','Communication, planning, and coordination without breaking the rest of your flow.'],
    ['04','ORBIT','The place you return to. A living map of the entire ARROW system.']
  ];

  return <main className={'app scene-'+scene+(running?' is-running':'')}>
    <AmbientCanvas scene={scene}/>
    <div className="grain"/><div className="vignette"/><div className="edgeGlow"/>
    <div className="brandLockup">RESONANT ASSIST <i>/</i> PROJECT ARROW</div>
    {running&&scene<9?<button className="skip" onClick={skip}>SKIP EXPERIENCE</button>:null}

    {scene===0&&<section className="introScene">
      <LostArrowField/>
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
      <LostArrowField converging/>
      <div className="convergeWord"><span>A</span><span>R</span><span>R</span><span>O</span><span>W</span></div>
      <div className="convergeCore"><ArrowMark size={72} className="upright"/></div>
      <div className="cinematicCaption"><span>SCATTERED.</span><span>UNCONNECTED.</span><b>UNTIL NOW.</b></div>
    </section>}

    {scene===2&&<section className="energyScene">
      <div className="splitWord" aria-hidden="true">{['A','R','R','O','W'].map((l,i)=><span key={i}>{l}</span>)}</div>
      <PixelField/>
      <div className="lightColumn columnCore"/><div className="lightColumn columnSoft"/>
      <div className="energyGlow"/>
      <div className="waveRing wr1"/><div className="waveRing wr2"/><div className="waveRing wr3"/>
      <div className="risingCraft"><ArrowMark size={78} className="upright"/></div>
      <div className="energyLabel">DIRECTION LOCKED</div>
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
      <div className="chaosWords" aria-hidden="true">
        {chaos.map((w,i)=><span key={w} className={'cw cw'+i}>{w}</span>)}
      </div>
      <div className="chaosCraft"><ArrowMark size={54} className="upright"/></div>
      <div className="storyCopy">
        <small>YOUR LIFE ISN'T ONE THING.</small>
        <h2>So why does it live in<br/><b>separate places?</b></h2>
      </div>
    </section>}

    {scene>=5&&scene<=7?<div className={'persistentPlanet pstate-'+scene}><OrbitPlanet active introMix={scene===5 ? .74 : 1}/></div>:null}

    {scene===5&&<section className="orderScene">
      <div className="orderSweep"/>
      <div className="orderCopy">
        <small>ARROW CONNECTS THE PIECES</small>
        <h2>Scattered becomes <b>navigable.</b></h2>
        <p>The same information. The same people. The same projects. Now moving as one system.</p>
      </div>
    </section>}

    {scene===6&&<section className="moduleScene">
      <div className="moduleEyebrow">FOUR WORLDS · ONE SYSTEM</div>
      <div className="moduleStories">
        {modules.map((m,i)=><article key={m[1]} className={'moduleStory ms'+i}>
          <em>{m[0]}</em><h2>{m[1]}</h2><p>{m[2]}</p>
        </article>)}
      </div>
    </section>}

    {scene===7&&<section className="orbitReveal">
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
        <div className="landingActions">
          <button>EXPLORE ARROW <span>→</span></button>
          <button onClick={replay}>REPLAY EXPERIENCE</button>
        </div>
      </div>
    </section>}
  </main>;
}
