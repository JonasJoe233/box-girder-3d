import sys
import os
d=os.path.dirname(os.path.abspath(__file__))+'/'
h=open(d+'p1.html',encoding='utf-8').read()
app='\n'.join(open(d+f's{i}.js',encoding='utf-8').read() for i in ['1','2','3','4','5','7','7b','7c','7d','6'])
app="(function(){try{\n"+app+"\n}catch(e){document.body.insertAdjacentHTML('afterbegin','<pre style=\"position:fixed;z-index:99;background:#fff;color:red\">'+e.stack+'</pre>');throw e;}})();"
h=h.replace('/*THREE*/',open(d+'three.min.js',encoding='utf-8').read()).replace('/*OC*/',open(d+'oc.js',encoding='utf-8').read()).replace('/*APP*/',app)
out=sys.argv[1] if len(sys.argv)>1 else d+'../index.html'
open(out,'w',encoding='utf-8').write(h);print(out,len(h)//1024,'KB')
