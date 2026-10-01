import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

test('gateway serves and redirects centers without exposing an upstream origin',async(t)=>{
 const upstream=http.createServer((req,res)=>{
  if(req.url==='/chats'){res.writeHead(301,{location:'/chats/'});return res.end();}
  if(req.url==='/Resonant-Field'){res.writeHead(301,{location:'http://127.0.0.1:'+upstream.address().port+'/Resonant-Field/'});return res.end();}
  res.setHeader('content-type','text/plain');res.end(req.url);
 });upstream.listen(0,'127.0.0.1');await once(upstream,'listening');
 const target='http://127.0.0.1:'+upstream.address().port;
 const port=41000+Math.floor(Math.random()*10000);
 const child=spawn(process.execPath,['gateway/server.mjs'],{env:{...process.env,PORT:String(port),ARROW_ORBIT_UPSTREAM:target,ARROW_RELAY_UPSTREAM:target,ARROW_WAYPOINT_UPSTREAM:target,ARROW_ATLAS_UPSTREAM:target,ARROW_RAVIN_UPSTREAM:target},stdio:['ignore','pipe','pipe']});
 t.after(()=>{child.kill();upstream.close();});
 await Promise.race([new Promise((resolve,reject)=>{child.stdout.on('data',data=>{if(String(data).includes('listening'))resolve();});child.once('exit',code=>reject(Error('Gateway exited '+code)));}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Gateway did not start')),10000).unref())]);
 const request=async(path)=>{const response=await fetch('http://127.0.0.1:'+port+path,{redirect:'manual'});return {status:response.status,location:response.headers.get('location'),text:await response.text()};};
 for(const center of ['orbit','relay','waypoint','atlas','ravin']){const root=await request('/'+center+'?item=123');assert.equal(root.status,308);assert.equal(root.location,'/'+center+'/?item=123');}
 const relay=await request('/relay/chats');assert.equal(relay.status,301);assert.equal(relay.location,'/relay/chats/');
 const ravin=await request('/ravin/api/health');assert.equal(ravin.text,'/api/health');
 const atlas=await request('/atlas/');assert.equal(atlas.text,'/Resonant-Field/');
});
