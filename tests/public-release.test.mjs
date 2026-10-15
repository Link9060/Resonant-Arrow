import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('release includes all five centers and matches pinned source',()=>{
 const expected=JSON.parse(fs.readFileSync('gateway/public-release.json','utf8'));
 const actual=JSON.parse(fs.readFileSync('gateway/public/release.json','utf8'));
 assert.equal(actual.channel,'public');assert.equal(actual.relay,expected.relay);
 for(const name of ['orbit','relay','waypoint','atlas','ravin'])assert.ok(fs.existsSync('gateway/public/'+name+'/index.html'));
 const shell=fs.readFileSync('gateway/public/arrow-shell.js','utf8');
 assert.match(shell,/Beta access/);assert.ok(fs.existsSync('gateway/public/autoPlanner.js'));
 for(const center of ['orbit','relay','waypoint'])assert.doesNotMatch(fs.readFileSync('gateway/public/'+center+'/index.html','utf8'),/Resonant-Relay\/arrow\/arrow-beta-guard/);
});
test('public account entry and beta access remain reachable before authentication',()=>{
 const source=fs.readFileSync('gateway/public/arrow-auth-guard.js','utf8');
 assert.match(source,/\/relay\/login\//);assert.match(source,/\/relay\/beta-access\//);
 const home=fs.readFileSync('gateway/public/index.html','utf8');assert.match(home,/Request Beta access/);assert.match(home,/Open Beta site/);
});

test('gateway serves the complete release while keeping RAVIN API proxying intact',async()=>{
 const {createServer}=await import('node:http');const {spawn}=await import('node:child_process');const {once}=await import('node:events');
 const upstream=createServer((req,res)=>{res.setHeader('content-type','application/json');res.end(JSON.stringify({path:req.url}));});
 upstream.listen(0,'127.0.0.1');await once(upstream,'listening');
 const reserve=createServer();reserve.listen(0,'127.0.0.1');await once(reserve,'listening');const port=reserve.address().port;await new Promise(resolve=>reserve.close(resolve));
 const child=spawn(process.execPath,['gateway/server.mjs'],{env:{...process.env,PORT:String(port),ARROW_RAVIN_UPSTREAM:'http://127.0.0.1:'+upstream.address().port},stdio:['ignore','pipe','pipe']});
 let logs='';child.stdout.on('data',chunk=>logs+=chunk);child.stderr.on('data',chunk=>logs+=chunk);
 try{
  let ready=false;for(let attempt=0;attempt<100;attempt++){if(logs.includes('gateway listening')){ready=true;break;}if(child.exitCode!==null)break;await new Promise(resolve=>setTimeout(resolve,50));}
  assert.ok(ready,logs);
  const base='http://127.0.0.1:'+port;
  for(const route of ['/','/orbit/','/orbit/staff/','/relay/','/relay/login/','/relay/beta-access/','/waypoint/','/atlas/','/ravin/','/arrow-shell.js','/autoPlanner.js','/release.json']){const response=await fetch(base+route);assert.equal(response.status,200,route);}
  const response=await fetch(base+'/ravin/api/health');assert.deepEqual(await response.json(),{path:'/api/health'});
 }finally{child.kill();await once(child,'exit');await new Promise(resolve=>upstream.close(resolve));}
});
