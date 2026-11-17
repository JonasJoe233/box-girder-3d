// ===== s7c: 导演：旁白驱动时间轴、字幕、术语高亮、镜头漂移 =====
let VOICE=null,UTT=null;
function pickVoice(){if(!('speechSynthesis' in window))return;const vs=speechSynthesis.getVoices();
 const zh=vs.filter(v=>/^zh/i.test(v.lang)&&!/TW|HK|yue/i.test(v.lang));
 for(const r of [/Google.*普通话/,/Tingting|婷婷/i,/Xiaoxiao|晓晓|Yunxi/i,/Yaoyao|Huihui|Lili|Yu-shu/i]){const v=zh.find(x=>r.test(x.name));if(v){VOICE=v;return;}}
 VOICE=zh[0]||null;}
if('speechSynthesis' in window){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
const DIR={ci:-1,ct:0,spoken:true,speaking:false,lastP:-1,ended:false,tok:0,custom:false,capI:-1,hover:null};
const cueAt=p=>{for(let i=CUES.length-1;i>=0;i--)if(p>=CUES[i].a-1e-6)return i;return 0;};
function say(c){
 const tok=++DIR.tok;DIR.speaking=false;
 if(!('speechSynthesis' in window)){DIR.spoken=true;return;}
 speechSynthesis.cancel();
 if(!AU.on.voice||!VOICE){DIR.spoken=true;return;}
 const u=new SpeechSynthesisUtterance(c.plain.replace(/「|」/g,''));
 u.voice=VOICE;u.lang=VOICE.lang;u.rate=clamp(1.08*speed,.5,2);
 u.onstart=()=>{if(tok===DIR.tok)DIR.speaking=true;};
 u.onend=u.onerror=()=>{if(tok===DIR.tok){DIR.spoken=true;DIR.speaking=false;}};
 UTT=u;DIR.spoken=false;speechSynthesis.speak(u);}
function hush(){DIR.tok++;DIR.speaking=false;if('speechSynthesis' in window)speechSynthesis.cancel();}
function flyCam(c,d){camTw={t:0,d:d||1.6,p0:camera.position.clone(),t0:controls.target.clone(),p1:V3(c[0],c[1],c[2]),t1:V3(c[3],c[4],c[5])};userMoved=false;}
function showCap(i){if(i===DIR.capI)return;DIR.capI=i;const el=$('#cap');el.innerHTML=capHTML(CUES[i].t);el.classList.remove('in');void el.offsetWidth;el.classList.add('in');}
function startCue(i,frac){
 const prevStep=DIR.ci>=0?stepAt(CUES[DIR.ci].a):-1;
 DIR.ci=i;const c=CUES[i];DIR.ct=(frac||0)*estDur(c);showCap(i);
 const st=stepAt(c.a);
 if(c.cam){flyCam(c.cam);DIR.custom=true;}
 else if(DIR.custom&&st===prevStep){flyTo(st,1.6);DIR.custom=false;}
 else DIR.custom=false;
 if(st!==prevStep&&prevStep>=0)oneShot('chime');
 if(playing)say(c);else DIR.spoken=true;}
// 每帧推进 P：画面按估计时长走，走到头还要等语音念完
function dirTick(dt,p){
 if(DIR.ci<0||Math.abs(p-DIR.lastP)>1e-4){const i=cueAt(p),c=CUES[i];startCue(i,clamp((p-c.a)/(c.b-c.a),0,.98));}
 const c=CUES[DIR.ci],D=estDur(c);DIR.ct+=dt*speed;
 let np=mix(c.a,c.b,Math.min(1,DIR.ct/D));
 if(DIR.ct>=D&&(DIR.spoken||DIR.ct>D*2+4)){
  if(DIR.ci>=CUES.length-1){DIR.ended=true;np=10;}
  else{startCue(DIR.ci+1,0);np=CUES[DIR.ci].a+1e-5;}}
 const fired=EV.filter(e=>p<e[0]&&np>=e[0]&&np-p<.05);fired.forEach(e=>oneShot(e[1]));
 DIR.lastP=np;return np;}
function dirPlay(v){
 if(v){auInit();DIR.ended=false;if(DIR.ci>=0&&Math.abs(P-DIR.lastP)<1e-4)say(CUES[DIR.ci]);}
 else hush();}
// 高亮：字幕里出现的部件发光，对应标签换成同色
const HLM=new Map(),KEYM={};
PICK.forEach(m=>{const k=m.userData.key;(KEYM[k]=KEYM[k]||[]).push(m);});
[['fleg',frontLeg],['ftroll',TF.t],['rtroll',TR.t],['duct',ducts],['shed',shed]].forEach(([k,o])=>{KEYM[k]=[];o.traverse(m=>{if(m.isMesh)KEYM[k].push(m);});});
let hlOn=[];
function hlMat(orig,col){const id=orig.uuid+col;let h=HLM.get(id);if(!h){h=orig.clone();h.emissive=new THREE.Color(col);HLM.set(id,h);}
 h.color.copy(orig.color);h.opacity=orig.opacity;h.transparent=orig.transparent;h.depthWrite=orig.depthWrite;h.visible=orig.visible;return h;}
function dirPre(){hlOn.forEach(m=>{if(m.userData.hb)m.material=m.userData.hb;});hlOn=[];}
function dirPost(dt){
 const i=playing&&DIR.ci>=0?DIR.ci:cueAt(P);if(!playing)showCap(i);
 const keys=DIR.hover?[DIR.hover]:CUES[i].keys;
 const pulse=.45+.3*Math.sin(performance.now()/180);
 keys.forEach(k=>(KEYM[k]||[]).forEach(m=>{const o=m.material;if(!o||!o.isMeshStandardMaterial)return;m.userData.hb=o;const h=hlMat(o,KCOL[k]);h.emissiveIntensity=pulse;m.material=h;hlOn.push(m);}));
 const lbs=new Set(keys.map(k=>KLB[k]));
 LB.forEach(l=>{const on=lbs.has(l[0]);l.el.classList.toggle('hl',on);l.el.style.background=on?KCOL[KEYS_BY_LB[l[0]]]:'';l.el.style.color=on?'#141412':'';});
 // 播放时镜头缓慢环绕，像纪录片的运镜
 if(playing&&!camTw&&!userMoved){const a=.018*dt*speed,o=camera.position.clone().sub(controls.target);
  o.applyAxisAngle(V3(0,1,0),(cur%2?-1:1)*a);camera.position.copy(controls.target).add(o);}
 auFrame(dt,P,playing,DIR.speaking);}
const KEYS_BY_LB={};Object.keys(KLB).forEach(k=>{if(!(KLB[k] in KEYS_BY_LB))KEYS_BY_LB[KLB[k]]=k;});
