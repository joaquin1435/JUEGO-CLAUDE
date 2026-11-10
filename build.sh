#!/bin/sh
# Une src/ en un solo HTML jugable (arena16-completo.html) + index.html para Netlify
cd "$(dirname "$0")"
python3 - <<'PY'
s=open('src/shell.html').read()
css=open('src/style.css').read()
js='\n'.join(open('src/'+f).read() for f in ['audio.js','data.js','art.js','ui.js','game.js','scenes.js','combat.js','main.js'])
s=s.replace('/*CSS*/',css).replace('/*JS*/',js)
open('arena16-completo.html','w').write(s); open('index.html','w').write(s)
PY
echo ok
