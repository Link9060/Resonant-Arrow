import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canonicalCenterPath,gatewayRedirect} from '../gateway/center-routes.mjs';
test('center roots normalize before proxying and preserve existing nested routes',()=>{
 for(const center of ['orbit','relay','ravin','atlas','waypoint'])assert.equal(canonicalCenterPath('/'+center),'/'+center+'/');
 assert.equal(canonicalCenterPath('/relay/chats'),null);
});
test('upstream directory redirects stay in the active center',()=>{
 assert.equal(gatewayRedirect('/chats/?id=123','https://relay.onrender.com','/chats','relay'),'/relay/chats/?id=123');
 assert.equal(gatewayRedirect('https://relay.onrender.com/login/','https://relay.onrender.com','/','relay'),'/relay/login/');
 assert.equal(gatewayRedirect('../notes/','https://relay.onrender.com','/chats/room/','relay'),'/relay/chats/notes/');
});
test('Atlas Pages redirects retain gateway origin and strip repository prefix',()=>{
 assert.equal(gatewayRedirect('https://link9060.github.io/Resonant-Field/','https://link9060.github.io','/Resonant-Field','atlas','/Resonant-Field'),'/atlas/');
 assert.equal(gatewayRedirect('/Resonant-Field/assets/x.svg','https://link9060.github.io','/Resonant-Field/','atlas','/Resonant-Field'),'/atlas/assets/x.svg');
});
test('external authentication destinations and already scoped redirects are preserved',()=>{
 const login='https://accounts.google.com/o/oauth2?state=opaque';assert.equal(gatewayRedirect(login,'https://relay.onrender.com','/','relay'),login);
 assert.equal(gatewayRedirect('/relay/login/?next=%2Frelay%2F','https://relay.onrender.com','/','relay'),'/relay/login/?next=%2Frelay%2F');
});
