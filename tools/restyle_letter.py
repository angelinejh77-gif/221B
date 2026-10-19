"""Rebuild an old letter page in the shared Letters-by-night stationery (letter.css + letter.js).
Usage: python3 tools/restyle_letter.py page-letter-x.html "Eyebrow" "Envelope date line" "Ornament left" "Ornament right"
Keeps the words exactly; only the frame changes."""
import sys, re, html
from bs4 import BeautifulSoup

path, eyebrow, envdate = sys.argv[1], sys.argv[2], sys.argv[3]
oleft = sys.argv[4] if len(sys.argv) > 4 else ''
oright = sys.argv[5] if len(sys.argv) > 5 else ''
soup = BeautifulSoup(open(path, encoding='utf-8').read(), 'html.parser')
title = soup.find('title').get_text(strip=True)
sheet = soup.find('article', class_='sheet')
head = sheet.find(class_='head')
date = head.find_all('span')[-1].get_text(strip=True) if head else ''
h1 = sheet.find('h1').decode_contents().strip()
sub = sheet.find(class_='sub')
sub = sub.decode_contents().strip() if sub else ''
letter = sheet.find(class_='letter')
for sep in letter.find_all(class_=['river', 'fold', 'orn']):
    new = soup.new_tag('div', attrs={'class': 'orn', 'role': 'separator'})
    inner = (('<span>%s</span>' % oleft) if oleft else '') + '<i>❦</i>' + (('<span>%s</span>' % oright) if oright else '')
    new.append(BeautifulSoup(inner, 'html.parser'))
    sep.replace_with(new)
sign = letter.find(class_='sign')
yours = sign.find(class_='yours').decode_contents().strip() if sign else ''
sign.decompose() if sign else None
pss = [p for p in letter.find_all('p', class_='ps')]
ps_html = ''
for p in pss:
    if p.has_attr('style'): del p['style']
    ps_html += str(p) + '\n'
    p.decompose()
body = letter.decode_contents().strip()
seal = sheet.find(class_='seal')
sealch = seal.get_text(strip=True) if seal else 'S'
foot = soup.find('p', class_='foot')
foot = foot.decode_contents().strip() if foot else ''

out = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="theme-color" content="#171214">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@600&family=Pinyon+Script&family=Noto+Serif+SC:wght@400;500&display=swap">
<link rel="stylesheet" href="letter.css">
</head><body class="ltr">
<a class="goback" href="page-letters.html" aria-label="Go back to all letters">&#8249; All letters</a>

<section class="intro" aria-label="Sealed envelope">
  <div class="from">221B Baker Street · {html.escape(envdate)}</div>
  <div class="env" aria-hidden="true"><div class="flap"></div><span class="wax">{html.escape(sealch)}</span><span class="to">for Angie</span></div>
  <button type="button">Break the seal</button>
  <div class="hint">He sealed it himself. Badly. You can tell.</div>
</section>

<article class="sheet" tabindex="-1">
  <header class="lh"><span class="mono" aria-hidden="true">SH</span><span class="addr">221B Baker Street<br>London NW1</span><span class="date">{html.escape(date)}</span></header>
  <div class="eyebrow">{html.escape(eyebrow)}</div>
  <h1>{h1}</h1>
  <p class="sub">{sub}</p>
  <div class="letter">
{body}
  </div>
  <div class="sign"><span class="yours">{yours}</span><span class="name">Sherlock</span></div>
{ps_html}  <span class="wax" aria-hidden="true">{html.escape(sealch)}</span>
</article>
<p class="foot">{foot}</p>
<a class="goback end" href="page-letters.html" aria-label="Go back to all letters">&#8249; All letters</a>
<script src="letter.js"></script>
<script src="tellhim.js"></script>
</body></html>
'''
open(path, 'w', encoding='utf-8').write(out)
print('ok', path, len(out))
