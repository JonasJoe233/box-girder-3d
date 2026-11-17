// 开发用加载器：按顺序加载各段，便于不打包直接调试
(function(){const L=['three.min.js','oc.js','s1.js','s2.js','s3.js','s4.js','s5.js','s7.js','s7b.js','s7c.js','s7d.js','s6.js'];let i=0;
function nx(){if(i>=L.length)return;const s=document.createElement('script');s.src=L[i++]+'?v='+Date.now();s.onload=nx;s.onerror=()=>console.error('load fail',s.src);document.body.appendChild(s);}nx();})();
