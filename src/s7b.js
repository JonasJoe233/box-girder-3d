// ===== s7b: 音效引擎（WebAudio 合成，不依赖外部文件） =====
const AU={on:{voice:true,sfx:true,music:true},ctx:null};
function auInit(){
 if(AU.ctx){AU.ctx.resume();return;}
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 const c=new AC();AU.ctx=c;
 const m=c.createGain();m.gain.value=.9;m.connect(c.destination);
 AU.sfx=c.createGain();AU.sfx.connect(m);AU.mus=c.createGain();AU.mus.gain.value=0;AU.mus.connect(m);
 const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=nb.getChannelData(0);
 let last=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=w*.6+last*3;}AU.nb=nb;
 const noise=()=>{const s=c.createBufferSource();s.buffer=nb;s.loop=true;s.start();return s;};
 const mk=(src,ft,f,q)=>{const fl=c.createBiquadFilter();fl.type=ft;fl.frequency.value=f;fl.Q.value=q||1;const g=c.createGain();g.gain.value=0;src.connect(fl);fl.connect(g);g.connect(AU.sfx);return{g,fl};};
 // 发动机：两路低频振荡器
 const o1=c.createOscillator();o1.type='sawtooth';o1.frequency.value=46;
 const o2=c.createOscillator();o2.type='square';o2.frequency.value=69;
 const em=c.createGain();em.gain.value=.5;o1.connect(em);o2.connect(em);o1.start();o2.start();
 AU.eng=mk(em,'lowpass',240,.7);AU.eo=[o1,o2];
 AU.hyd=mk(noise(),'bandpass',1100,1.4);   // 液压
 AU.pump=mk(noise(),'lowpass',170,.8);     // 混凝土泵、压浆泵
 AU.steam=mk(noise(),'highpass',3600,.5);  // 蒸汽
 AU.amb=mk(noise(),'lowpass',380,.3);      // 环境风声
 const bo=c.createOscillator();bo.type='square';bo.frequency.value=1040;bo.start();AU.beep=mk(bo,'lowpass',2600,.5); // 倒车提示
 // 背景音乐：柔和的和弦铺底
 const ml=c.createBiquadFilter();ml.type='lowpass';ml.frequency.value=900;ml.connect(AU.mus);
 AU.pad=[];for(let i=0;i<6;i++){const o=c.createOscillator();o.type='triangle';o.detune.value=i%2?-7:7;const g=c.createGain();g.gain.value=.022;o.connect(g);g.connect(ml);o.start();AU.pad.push(o);}
 AU.chord=-1;
}
const CHORDS=[[130.8,164.8,196],[110,130.8,164.8],[87.3,110,130.8],[98,123.5,146.8]];
function tgt(p,v,tc){if(AU.ctx)p.setTargetAtTime(v,AU.ctx.currentTime,tc||.08);}
function oneShot(type,v){
 const c=AU.ctx;if(!c||!AU.on.sfx)return;const t=c.currentTime;v=v||1;
 if(type==='thud'){
  const o=c.createOscillator();o.frequency.setValueAtTime(95,t);o.frequency.exponentialRampToValueAtTime(36,t+.4);
  const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.55*v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.7);
  o.connect(g);g.connect(AU.sfx);o.start(t);o.stop(t+.8);
  const n=c.createBufferSource();n.buffer=AU.nb;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=700;
  const gn=c.createGain();gn.gain.setValueAtTime(.3*v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+.3);
  n.connect(f);f.connect(gn);gn.connect(AU.sfx);n.start(t);n.stop(t+.35);
 }else if(type==='clank'){
  [[520,.5],[1390,.35],[2210,.25],[3170,.15]].forEach(([fq,dc])=>{const o=c.createOscillator();o.frequency.value=fq*(1+Math.random()*.02);
   const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.07*v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dc);
   o.connect(g);g.connect(AU.sfx);o.start(t);o.stop(t+dc+.05);});
 }else if(type==='chime'){
  [[659,0],[988,.09]].forEach(([fq,dl])=>{const o=c.createOscillator();o.type='sine';o.frequency.value=fq;const g=c.createGain();
   g.gain.setValueAtTime(.0001,t+dl);g.gain.exponentialRampToValueAtTime(.05,t+dl+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dl+.9);
   o.connect(g);g.connect(AU.mus);o.start(t+dl);o.stop(t+dl+1);});
 }
}
// 每帧根据场景状态调整持续音
const MOV=[];let auPrev=null,auTL=0,auIn=0,auLeg=1;
function auFrame(dt,T,playing,speaking){
 if(!AU.ctx)return;
 if(!MOV.length)MOV.push(G[0].g,G[1].g,G[0].hook,G[1].hook,trG,erG,crG,TK[0],cageG,beamG);
 const now=performance.now()/1000;
 let v=0;const ps=MOV.map(o=>{const p=new THREE.Vector3();o.getWorldPosition(p);return p;});
 if(auPrev&&dt>0)ps.forEach((p,i)=>v+=p.distanceTo(auPrev[i])/dt);auPrev=ps;v=Math.min(v,40);
 const dtl=W.tlevel-auTL;auTL=W.tlevel;const din=Math.abs(innerG.position.x-auIn);auIn=innerG.position.x;
 const dleg=Math.abs(frontLeg.scale.y-auLeg);auLeg=frontLeg.scale.y;
 const on=playing?1:0;
 tgt(AU.sfx.gain,AU.on.sfx?(speaking?.6:1):0,.2);
 tgt(AU.mus.gain,AU.on.music&&playing?(speaking?.55:.9):0,.6);
 const eg=v>.05?Math.min(.15,.03+v*.006):0;tgt(AU.eng.g.gain,eg*on);
 AU.eo[0].frequency.value=40+Math.min(v,25)*1.1;AU.eo[1].frequency.value=60+Math.min(v,25)*1.6;
 const tens=dtl>1e-5&&((T>=3.5&&T<3.9)||(T>=4.55&&T<4.8));
 tgt(AU.hyd.g.gain,on*(tens?.09:(din>1e-4||dleg>1e-5)?.06:0));
 if(tens)AU.hyd.fl.frequency.value=800+600*(W.tlevel%1);
 const pulse=.5+.5*Math.sin(now*Math.PI*2.2);
 tgt(AU.pump.g.gain,on*((T>=2.25&&T<2.9)?.22*pulse*pulse:(T>=4.8&&T<4.95)?.13*pulse*pulse:0),.03);
 tgt(AU.steam.g.gain,on*((T>=2.95&&T<3.32)?.07:0),.3);
 const bp=(T>=4.95&&T<5.05)||(T>=7.45&&T<7.75);tgt(AU.beep.g.gain,on*(bp&&(now%1)<.45?.022:0),.01);
 tgt(AU.amb.g.gain,on*.03,.5);
 const ch=Math.floor(now/6)%4;if(ch!==AU.chord){AU.chord=ch;CHORDS[ch].forEach((f,i)=>{tgt(AU.pad[i*2].frequency,f,.8);tgt(AU.pad[i*2+1].frequency,f*2,.8);});}
}
