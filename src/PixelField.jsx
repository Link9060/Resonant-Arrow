import React,{useMemo}from'react';

function seeded(seed){
  let s=seed|0;
  return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296};
}

export function PixelField({className=''}){
  const items=useMemo(()=>{
    const rnd=seeded(1741);
    return Array.from({length:220},(_,i)=>({
      id:i,
      a:rnd()*Math.PI*2,
      d:120+rnd()*610,
      size:.7+rnd()*4.1,
      delay:rnd()*.5,
      spin:(rnd()-.5)*900,
      stretch:.65+rnd()*2.8,
      opacity:.34+rnd()*.66
    }));
  },[]);

  return <div className={'pixelField '+className} aria-hidden="true">
    {items.map(p=><i key={p.id} style={{
      '--a':p.a+'rad',
      '--d':p.d+'px',
      '--size':p.size+'px',
      '--delay':p.delay+'s',
      '--spin':p.spin+'deg',
      '--stretch':p.stretch,
      '--spark-opacity':p.opacity
    }}/>)}
  </div>;
}
