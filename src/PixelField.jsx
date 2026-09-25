import React,{useMemo}from'react';
function seeded(seed){let s=seed|0;return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return(s>>>0)/4294967296}}
export function PixelField(){
  const items=useMemo(()=>{
    const rnd=seeded(1741);
    return Array.from({length:150},(_,i)=>({
      id:i,a:rnd()*Math.PI*2,d:110+rnd()*520,size:.7+rnd()*3.4,
      delay:rnd()*.42,spin:(rnd()-.5)*720
    }));
  },[]);
  return <div className="pixelField" aria-hidden="true">
    {items.map(p=><i key={p.id} style={{
      '--a':p.a+'rad','--d':p.d+'px','--size':p.size+'px',
      '--delay':p.delay+'s','--spin':p.spin+'deg'
    }}/>)}
  </div>;
}
