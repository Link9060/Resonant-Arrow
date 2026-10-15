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
