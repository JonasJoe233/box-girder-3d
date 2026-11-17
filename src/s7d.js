// ===== s7d: 开场、结尾、声音和显示开关 =====
const ovl=$('#ovl'),ovlIn=$('#ovlIn');
const mins=Math.round(TOTAL_SEC/60);
function showIntro(){
 ovlIn.innerHTML=`<h2>一孔高铁箱梁的一生</h2><p>从绑钢筋到架上桥，再到设备转场。<br>全程约 ${mins} 分钟，有旁白、字幕和现场音效。</p>
 <button class="btn main big" id="goWatch">▶ 开始观看</button><button class="btn big alt" id="goFree">自己逛逛</button>
 <small id="vNote">建议打开声音。观看中随时可以拖动画面、暂停、跳步。</small>`;
 ovl.style.display='flex';
 $('#goWatch').onclick=()=>{ovl.style.display='none';auInit();P=0;DIR.ci=-1;setPlay(true);};
 $('#goFree').onclick=()=>{ovl.style.display='none';auInit();};
 setTimeout(()=>{if(!VOICE&&$('#vNote'))$('#vNote').textContent='这台设备没有找到中文语音，旁白会以字幕显示。音效照常播放。';},1200);}
function showEnd(){
 ovlIn.innerHTML=`<h2>看完了</h2><p>梁场造梁，运梁车送梁，架桥机架梁。<br>一孔接一孔，桥就这样往前长。</p>
 <button class="btn main big" id="goQuiz">做 6 道题自测</button><button class="btn big alt" id="goAgain">再看一遍</button>`;
 ovl.style.display='flex';
 $('#goQuiz').onclick=()=>{ovl.style.display='none';$('#quiz').style.display='flex';};
 $('#goAgain').onclick=()=>{ovl.style.display='none';P=0;DIR.ci=-1;setPlay(true);};}
// 开关
function tog(id,fn){const b=$(id);b.onclick=()=>{const v=!b.classList.contains('on');b.classList.toggle('on',v);fn(v);};}
tog('#tVoice',v=>{AU.on.voice=v;if(!v)hush();else if(playing&&DIR.ci>=0)say(CUES[DIR.ci]);});
tog('#tSfx',v=>{AU.on.sfx=v;});
tog('#tMus',v=>{AU.on.music=v;});
tog('#tCap',v=>document.body.classList.toggle('nocap',!v));
tog('#tPanel',v=>document.body.classList.toggle('nopanel',!v));
// 字幕里的彩色词：鼠标停留时只高亮这个部件
$('#cap').addEventListener('mouseover',e=>{const t=e.target.closest('.tm');DIR.hover=t?t.dataset.k:null;});
$('#cap').addEventListener('mouseleave',()=>{DIR.hover=null;});
if(!/p=/.test(location.hash))showIntro();else ovl.style.display='none';
window.__dbg=()=>({voice:VOICE&&VOICE.name,P,ci:DIR.ci,speaking:DIR.speaking,spoken:DIR.spoken,cap:$('#cap').textContent,au:AU.ctx&&AU.ctx.state,total:TOTAL_SEC,cur,playing});
// 字幕始终在底部控制栏上方
new ResizeObserver(()=>{$('#cap').style.bottom=($('#bar').offsetHeight+26)+'px';}).observe($('#bar'));
