// ===== s6: 交互、相机、标签、讲解卡、自测、主循环 =====
let P=0,playing=false,speed=1,cur=-1,camTw=null,follow=null,userMoved=false;
const stepAt=p=>{for(let i=STEPS.length-1;i>=0;i--)if(p>=STEPS[i].a-1e-6)return i;return 0;};
// 底部步骤按钮与刻度
const chips=$('#chips'),ticks=$('#ticks');
STEPS.forEach((s,i)=>{const b=document.createElement('button');b.textContent=s.n+' '+s.name;b.onclick=()=>jump(i);chips.appendChild(b);
 if(i){const t=document.createElement('div');t.className='tick';t.style.left=(s.a*10)+'%';ticks.appendChild(t);}});
// 标签 DOM
const lbBox=$('#labels');LB.forEach(l=>{const d=document.createElement('div');d.className='lb';d.textContent=l[0];lbBox.appendChild(d);l.el=d;});
// 强度/张拉读数
const hud=document.createElement('div');hud.id='hud';hud.style.cssText='position:absolute;left:16px;top:62px;background:rgba(255,255,255,.94);border:1px solid #e2dfd6;border-radius:10px;padding:8px 12px;font-size:12px;line-height:1.8;display:none;min-width:190px';
view.appendChild(hud);
const TLV=['未张拉','预张拉完成','初张拉完成','终张拉完成','压浆完成'];
function bar(v,c){return `<span style="display:inline-block;width:90px;height:6px;border-radius:3px;background:#ebe8e0;vertical-align:middle;margin:0 6px"><span style="display:block;height:100%;width:${v}%;background:${c};border-radius:3px"></span></span>`;}
function updHud(){const i=cur;if(i<3||i>6||W.strength==null){hud.style.display='none';return;}hud.style.display='block';
 const tl=Math.floor(W.tlevel+1e-3);
 hud.innerHTML=`混凝土强度${bar(W.strength,'#185fa5')}<b>${W.strength}%</b><br>张拉状态 <b style="color:${['#8a8a8a','#b08a00','#d26a00','#c8321e','#3f6fa5'][Math.min(4,tl)]}">${TLV[Math.min(4,tl)]}</b><br>梁体上拱 <b>${(W.camber*40).toFixed(0)} mm</b>${(i===4||i===6)&&W.tlevel>0&&W.tlevel<3.01?dual(W.tlevel):''}<br><span style="color:#999">示意值，已放大显示</span>`;}
function dual(tl){const f=tl<1?tl*.2:tl<2?.2+(tl-1)*.3:.5+(tl-2)*.5,dv=(Math.sin(tl*7)*1.6+1.2).toFixed(1);
 return `<br>张拉力${bar(f*100,'#c8321e')}<b>${Math.round(f*100)}%</b><br>伸长量${bar(f*100*(1+dv/100),'#d26a00')}<b>偏差 ${dv>0?'+':''}${dv}%</b> <span style="color:#0f6e56">±6% 内 ✓</span>`;}
// 讲解卡
function renderCard(i){const s=STEPS[i];
 $('#card').innerHTML=`<h2>${s.n==='→'?'':'第 '+s.n+' 步　'}${s.name}</h2><div class="one">${s.one}</div>
 <div class="sec">正在发生</div><ul class="ph">${s.ph.map((p,k)=>`<li data-p="${p[0]}">${p[1]}</li>`).join('')}</ul>
 <div class="sec">关键数字</div><div class="nums">${s.nums.map(x=>`<span>${x}</span>`).join('')}</div>
 <div class="pro-only"><div class="sec">专业细节</div><div class="box pro">${s.pro}</div></div>
 <div class="sec">常见误区</div><div class="box myth">${s.myth}</div>`;
 $('#card').querySelectorAll('.ph li').forEach(li=>li.onclick=()=>{P=+li.dataset.p+.001;});
 const c=C[s.c];$('#stNo').textContent=s.n;$('#stNo').style.background=c;$('#stName').textContent=s.name;$('#stWhere').textContent=s.where;
 [...chips.children].forEach((b,k)=>{b.classList.toggle('on',k===i);b.style.background=k===i?C[STEPS[k].c]:'';});}
function updPhases(){const li=$('#card').querySelectorAll('.ph li');let k=-1;li.forEach((e,j)=>{if(P>=+e.dataset.p-1e-6)k=j;});
 li.forEach((e,j)=>{e.classList.toggle('done',j<k);e.classList.toggle('cur',j===k);});}
// 相机
function flyTo(i,dur){const c=STEPS[i].cam;camTw={t:0,d:dur||1.4,p0:camera.position.clone(),t0:controls.target.clone(),p1:V3(c[0],c[1],c[2]),t1:V3(c[3],c[4],c[5])};userMoved=false;}
const FOLLOW={8:()=>V3(trG.position.x,trG.position.y+4,0),10:()=>V3(erG.position.x+186,14,0)};
controls.addEventListener('start',()=>{camTw=null;userMoved=true;});
$('#cam').onclick=()=>flyTo(cur);
function setStep(i,fly){if(i===cur)return;cur=i;renderCard(i);if(fly!==false)flyTo(i);follow=FOLLOW[i]?FOLLOW[i]().clone():null;}
function jump(i){P=STEPS[i].a+.001;setStep(i);}
// 播放控制
function setPlay(v){if(v&&P>=9.999){P=0;DIR.ci=-1;}playing=v;if(v)ovl.style.display='none';$('#play').textContent=v?'❚❚ 暂停':'▶ 播放';dirPlay(v);}
$('#play').onclick=()=>setPlay(!playing);
$('#prev').onclick=()=>jump(Math.max(0,(P-STEPS[cur].a>.3?cur:cur-1)));
$('#next').onclick=()=>jump(Math.min(STEPS.length-1,cur+1));
$('#speed').onchange=e=>{speed=+e.target.value;if(playing&&DIR.ci>=0)say(CUES[DIR.ci]);};
const scrub=$('#scrub');scrub.oninput=()=>{P=scrub.value/1000;};
document.addEventListener('keydown',e=>{if(e.target.tagName==='SELECT')return;if(e.code==='Space'){e.preventDefault();setPlay(!playing);}
 if(e.key==='ArrowRight')$('#next').onclick();if(e.key==='ArrowLeft')$('#prev').onclick();});
// 小白 / 专业
$('#mode').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('#mode').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));document.body.classList.toggle('pro',b.dataset.m==='1');});
// 点设备看介绍
const ray=new THREE.Raycaster(),mv=new THREE.Vector2();let down=null;
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
 const r=renderer.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mv,camera);
 const hit=ray.intersectObjects(PICK.filter(m=>{let o=m;while(o){if(!o.visible)return false;o=o.parent;}return true;}),false)[0];
 if(hit&&INFO[hit.object.userData.key]){const f=INFO[hit.object.userData.key];$('#infoT').textContent=f[0];$('#infoD').textContent=f[1];$('#info').style.display='block';}});
$('#infoX').onclick=()=>$('#info').style.display='none';
// 自测
const QZ=[
 ['箱梁是在哪里造出来的？',['在桥墩上现场浇筑','在梁场的制梁台座上预制','在钢厂里轧出来'],1,'高铁简支箱梁大多在梁场整孔预制，再运上桥架设。'],
 ['钢绞线张拉后，梁会怎样？',['微微往下垂','微微往上拱','完全不变形'],1,'钢绞线想缩回去，把梁底压紧，梁就预先上拱。'],
 ['为什么初张拉后就要把梁搬走？',['梁在台座上会变形','制梁台座要空出来造下一孔','提梁机只能在这时候用'],1,'台座数量少，周转越快，梁场产能越高。'],
 ['运梁车平时走在哪里？',['普通公路','已经架好的桥面','临时修的铁轨'],1,'运梁车在梁场和已架好的桥面上跑，桥就是它的路。'],
 ['架桥机怎样移到下一跨？',['用大吊车整体吊过去','靠自身支腿交替受力往前挪','拆开再装'],1,'这个动作叫过孔，架桥机像迈步一样自己往前走。'],
 ['「提梁机转场」指什么？',['提梁机在梁场里换个位置','梁场的活干完，提梁机拆开搬到下一个梁场','提梁机把梁转个方向'],1,'提梁机太大不能整机上路，要拆成大件运走，到新梁场再装好验收。']];
$('#qs').innerHTML=QZ.map((q,i)=>`<div class="q"><p>${i+1}. ${q[0]}</p>${q[1].map((o,j)=>`<button data-q="${i}" data-o="${j}">${o}</button>`).join('')}<div class="why">${q[3]}</div></div>`).join('');
const ans={};
$('#qs').querySelectorAll('button').forEach(b=>b.onclick=()=>{const i=+b.dataset.q,j=+b.dataset.o;if(i in ans)return;ans[i]=j===QZ[i][2];
 b.classList.add(ans[i]?'ok':'no');b.parentNode.querySelectorAll('button')[QZ[i][2]].classList.add('ok');b.parentNode.querySelector('.why').style.display='block';
 const n=Object.keys(ans).length,ok=Object.values(ans).filter(Boolean).length;$('#score').textContent=n===QZ.length?`答对 ${ok} / ${QZ.length}。${ok===QZ.length?'整条流水线你已经懂了。':'答错的题，回到对应步骤再看一遍。'}`:'';});
$('#quizBtn').onclick=()=>{$('#quiz').style.display='flex';setPlay(false);};$('#quizX').onclick=()=>$('#quiz').style.display='none';
// 尺寸
function resize(){const w=view.clientWidth,h=view.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(view);resize();
// 测试钩子：#p=4.2 直接跳到某一刻
const hp=location.hash.match(/p=([\d.]+)/);if(hp)P=+hp[1];
window.__go=v=>{P=v;setWorld(P);setStep(stepAt(P),false);const c=STEPS[cur].cam;camera.position.set(c[0],c[1],c[2]);controls.target.set(c[3],c[4],c[5]);camTw=null;follow=FOLLOW[cur]?FOLLOW[cur]().clone():null;controls.update();renderer.render(scene,camera);return cur;};
// 主循环
const clock=new THREE.Clock(),pv=new THREE.Vector3();
function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.1);
 let i=stepAt(P);if(playing){P=dirTick(dt,P);if(DIR.ended){P=10;setPlay(false);showEnd();}i=stepAt(P);}
 setStep(i);dirPre();setWorld(P);dirPost(dt);
 if(camTw){camTw.t+=dt;const k=ease(clamp(camTw.t/camTw.d,0,1));camera.position.lerpVectors(camTw.p0,camTw.p1,k);controls.target.lerpVectors(camTw.t0,camTw.t1,k);if(k>=1)camTw=null;}
 else if(follow&&FOLLOW[cur]){const f=FOLLOW[cur]();const d=f.clone().sub(follow);camera.position.add(d);controls.target.add(d);follow.copy(f);}
 if(camTw&&FOLLOW[cur])follow=FOLLOW[cur]().clone();
 controls.update();
 scrub.value=Math.round(P*1000);$('#fill').style.width=(P*10)+'%';updPhases();updHud();
 const w=view.clientWidth,h=view.clientHeight;
 LB.forEach(l=>{const show=l[2].includes(cur);if(!show){l.el.style.opacity=0;return;}pv.copy(l[1]()).project(camera);
  if(pv.z>1){l.el.style.opacity=0;return;}l.el.style.opacity=1;l.el.style.left=((pv.x+1)/2*w)+'px';l.el.style.top=((1-pv.y)/2*h-10)+'px';});
 renderer.render(scene,camera);}
setWorld(P);setStep(stepAt(P));
if(hp){const c=STEPS[cur].cam;camera.position.set(c[0],c[1],c[2]);controls.target.set(c[3],c[4],c[5]);camTw=null;follow=FOLLOW[cur]?FOLLOW[cur]().clone():null;}
loop();
