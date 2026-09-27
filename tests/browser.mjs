import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { chromium, webkit } from 'playwright';

const server=await createServer({server:{host:'127.0.0.1',port:5173,strictPort:true}});
await server.listen();
const output='.test-output';await mkdir(output,{recursive:true});
const samples=[['charge',1400,1],['boom',2950,2],['launch',3500,2],['direction',7000,3],['chaos',11500,4],['organize',17000,5],['atlas',21000,6],['ravin',26000,7],['relay',31000,8],['waypoint',36700,9],['orbit',42300,10],['final',47300,11],['landing',49500,12]];
const results=[];
try {
 for(const engine of (process.env.BROWSERS||'chromium,webkit').split(',')) {
  const launch={headless:true};
  // Optional local executable for environments without Playwright's downloads.
  if(engine==='chromium'&&process.env.CHROMIUM_EXECUTABLE){launch.executablePath=process.env.CHROMIUM_EXECUTABLE;launch.args=['--no-sandbox','--no-zygote','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];}
  const browser=await ({chromium,webkit}[engine]).launch(launch);
  try {
   for(const [name,width,height] of [['desktop',1440,900],['phone',390,844],['small',320,568],['landscape',844,390],['tablet',768,1024]]) {
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:name==='phone'?3:1,isMobile:name!=='desktop',hasTouch:name!=='desktop'});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('CRASH'));
    await page.clock.install({time:new Date('2026-09-27T00:00:00Z')});
    await page.goto('http://127.0.0.1:5173/');
    await page.clock.pauseAt(new Date('2026-09-27T00:01:00Z'));
    await page.clock.runFor(32);
    await page.screenshot({path:`${output}/${engine}-${name}-intro.png`});
    await page.getByRole('button',{name:/FIND YOUR DIRECTION/}).click({force:true});
    let elapsed=0;
    for(const [label,at,expected] of samples) {
     await page.clock.fastForward(at-elapsed);await page.clock.runFor(32);elapsed=at+32;
     const data=await page.evaluate(()=>{
      const visual=document.querySelector('.ax-visual-slot').getBoundingClientRect(),copy=document.querySelector('.ax-module-copy,.ax-story-copy')?.getBoundingClientRect();
      const clips=[];
      for(const el of document.querySelectorAll('.ax-module-copy,.ax-story-copy,.ax-direction-copy,.ax-map-anchor,.ax-map-anchor span,.ax-relay-end,.ax-ravin-label,.ax-waypoint-next,.ax-orbit-destination,.ax-actions,.ax-final-copy,.ax-landing-copy')){
       if(Number(getComputedStyle(el).opacity)<.1)continue;
       const r=el.getBoundingClientRect();if(r.left<-.5||r.right>innerWidth+.5||r.top<-.5||r.bottom>innerHeight+.5)clips.push(el.className);
      }
      const portrait=innerWidth<700&&innerHeight>520;
      if(portrait&&Math.abs((visual.left+visual.right)/2-innerWidth/2)>1)clips.push('off-center visual');
      if(portrait&&visual.height>visual.width+1)clips.push('stretched mobile visual');
      const core=document.querySelector('.ax-ravin-core');
      if(core&&Math.abs(core.getBoundingClientRect().x+core.getBoundingClientRect().width/2-(visual.left+visual.right)/2)>1)clips.push('off-center core');
      const canvas=document.querySelector('canvas');
      return{scene:Number(document.querySelector('.ax-scene').dataset.scene),clips,copyOverlap:copy?!(copy.top>=visual.bottom-1||copy.left>=visual.right-1):false,canvasPixels:canvas.width*canvas.height,canvasCount:document.querySelectorAll('canvas').length};
     });
     await page.screenshot({path:`${output}/${engine}-${name}-${label}.png`});
     results.push({engine,name,label,...data,errors:[...errors]});
     assert.equal(data.scene,expected,`${engine}/${name}/${label}: timeline`);
     assert.deepEqual(data.clips,[],`${engine}/${name}/${label}: clipped UI`);
     assert.equal(data.copyOverlap,false,`${engine}/${name}/${label}: copy overlaps visual`);
     assert.equal(data.canvasCount,1,'Exactly one active canvas');
     assert(data.canvasPixels<=(name==='desktop'?2505000:1105000),'Canvas pixel budget');
     assert.deepEqual(errors,[],`${engine}/${name}/${label}: browser error`);
    }
    await page.getByRole('button',{name:'REPLAY EXPERIENCE'}).click({force:true});await page.clock.runFor(32);
    assert.equal(await page.locator('.ax-scene').getAttribute('data-scene'),'0','Replay');
    await page.getByRole('button',{name:/FIND YOUR DIRECTION/}).click({force:true});await page.clock.runFor(3000);
    assert.equal(await page.locator('.ax-scene').getAttribute('data-scene'),'2','Second ignition');
    // Resizing during the boom must keep the sequence alive and in budget.
    await page.setViewportSize({width:height,height:width});await page.clock.runFor(32);
    assert.deepEqual(errors,[],'Resize during impact');
    await page.getByRole('button',{name:/SKIP/}).click({force:true});await page.clock.runFor(32);
    assert.equal(await page.locator('.ax-scene').getAttribute('data-scene'),'12','Skip');
    console.log(`${engine}/${name}: all scenes, replay, resize and skip PASS`);
    await page.close();
   }
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
   await page.goto('http://127.0.0.1:5173/');await page.getByRole('button',{name:/FIND YOUR DIRECTION/}).click();await page.waitForSelector('.scene-12');
   console.log(`${engine}: reduced motion PASS`);await page.close();
  } finally {await browser.close();}
 }
} finally {
 await writeFile(`${output}/browser-results.json`,JSON.stringify(results,null,2));
 await server.close();
}
