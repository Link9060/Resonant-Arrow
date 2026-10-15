import {execFileSync} from 'node:child_process';
import {cpSync,existsSync,mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.dirname(fileURLToPath(import.meta.url));
const release=JSON.parse(readFileSync(path.join(root,'public-release.json'),'utf8'));
const work=path.join(root,'.public-release');
const output=path.join(root,'public');
const run=(command,args,cwd,env={})=>execFileSync(command,args,{cwd,env:{...process.env,...env},stdio:'inherit'});
rmSync(work,{recursive:true,force:true});mkdirSync(work,{recursive:true});
function source(repo,sha){
 if(!/^[a-f0-9]{40}$/.test(sha))throw Error('Invalid release commit for '+repo);
 const dir=path.join(work,repo);mkdirSync(dir,{recursive:true});
 run('git',['init',dir],root);run('git',['remote','add','origin','https://github.com/Link9060/'+repo+'.git'],dir);
 run('git',['fetch','--depth=1','--no-tags','origin',sha],dir);run('git',['checkout','--detach','FETCH_HEAD'],dir);
 return dir;
}
function copy(from,to){rmSync(to,{recursive:true,force:true});cpSync(from,to,{recursive:true});}
const relayRoot=source('Resonant-Relay',release.relay),relay=path.join(relayRoot,'relay');
const relayEnv={NEXT_PUBLIC_RELAY_DEPLOY_TARGET:'arrow',NEXT_PUBLIC_RELAY_CHANNEL:'public',NEXT_PUBLIC_SITE_URL:'https://enterarrow.com/relay',NEXT_PUBLIC_ARROW_AUTH_ENTRY_URL:'https://enterarrow.com/',NEXT_PUBLIC_ARROW_ORBIT_URL:'/orbit/',NEXT_PUBLIC_ARROW_SHELL_BASE_URL:'/orbit',NEXT_PUBLIC_ARROW_SHELL_REVISION:release.relay.slice(0,12)};
run('npm',['ci','--no-audit','--no-fund'],relay);
run('npm',['run','typecheck'],relay,relayEnv);run('npm',['run','test:motion'],relay,relayEnv);run('npm',['run','build'],relay,relayEnv);
copy(path.join(relay,'out'),path.join(output,'relay'));
function compile(repo,sha,center,key){
 const dir=source(repo,sha);run('npm',['ci','--no-audit','--no-fund'],dir);
 const layout=path.join(dir,'src/app/layout.tsx');
 writeFileSync(layout,readFileSync(layout,'utf8').replaceAll('v=review-20261006','v='+release.relay.slice(0,12)));
 const env={[key]:'/'+center,NEXT_PUBLIC_ARROW_SHELL_BASE:'/orbit'};
 run('npm',['run','typecheck'],dir,env);run('npm',['run','build'],dir,env);
 copy(path.join(dir,'out'),path.join(output,center));return dir;
}
const orbit=compile('Resonant-Orbit',release.orbit,'orbit','NEXT_PUBLIC_ORBIT_BASE_PATH');
run(process.execPath,['--test','tests/arrow-shell.test.cjs','tests/entertainment.test.cjs','tests/auth-gate.test.cjs','tests/orbit-refinement.test.cjs','tests/module-routing.test.cjs'],orbit,{ARROW_SHELL_SOURCE:path.join(relay,'public/arrow-shell.js')});
const waypoint=compile('Resonant-Waypoint',release.waypoint,'waypoint','NEXT_PUBLIC_WAYPOINT_BASE_PATH');
run(process.execPath,['--test','tests/account-safety.test.cjs','tests/daily-plan.test.cjs'],waypoint);
run(process.execPath,['--test','tests/waypoint-workflow.test.cjs'],relay,{ARROW_WAYPOINT_SOURCE:waypoint});
const atlas=source('Resonant-Field',release.atlas);run(process.execPath,['--test','tests/account-safety.test.mjs'],atlas);copy(path.join(atlas,'apps/explorer'),path.join(output,'atlas'));
const ravin=source('Project-R.A.V.I.N.-1.1',release.ravin);run(process.execPath,['--test','tests/arrow-account-safety.test.cjs'],ravin);run(process.execPath,['--test','tests/ravin-layout.test.cjs'],relay,{ARROW_RAVIN_SOURCE:ravin});copy(path.join(ravin,'ravin/public'),path.join(output,'ravin'));
for(const name of ['arrow-shell.js','arrow-shell.css']){
 cpSync(path.join(relay,'public',name),path.join(output,name));
 cpSync(path.join(relay,'public',name),path.join(output,'orbit',name));
}
cpSync(path.join(ravin,'ravin/src/nextMove.js'),path.join(output,'next-move.js'));
cpSync(path.join(ravin,'ravin/src/autoPlanner.js'),path.join(output,'autoPlanner.js'));
function revisionHtml(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){
 const file=path.join(dir,entry.name);if(entry.isDirectory())revisionHtml(file);else if(entry.name.endsWith('.html')){
  const route=path.relative(output,file).split(path.sep).join('/');
  let html=readFileSync(file,'utf8');
  html=html.replace(/(<(?:script|link)\b[^>]*(?:src|href)=)(["'])([^"']+)\2/g,(match,start,quote,href)=>{
   const url=new URL(href,'https://enterarrow.com/'+route);
   if(url.origin!=='https://enterarrow.com'||! /\.(?:js|css)$/.test(url.pathname)||url.pathname.includes('/_next/'))return match;
   const asset=path.join(output,decodeURIComponent(url.pathname));
   if(!existsSync(asset))throw Error('Missing public release asset: '+url.pathname);
   url.searchParams.set('v',createHash('sha256').update(readFileSync(asset)).digest('hex').slice(0,12));
   return start+quote+url.pathname+url.search+url.hash+quote;
  });writeFileSync(file,html);
 }
}}
revisionHtml(output);
writeFileSync(path.join(output,'release.json'),JSON.stringify({channel:'public',...release},null,2));
for(const center of ['orbit','relay','waypoint','atlas','ravin'])if(!existsSync(path.join(output,center,'index.html')))throw Error('Missing public center '+center);
console.log('Public ARROW release prepared:',release.relay);
