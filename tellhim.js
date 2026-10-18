/* Tell him: records what Angie does on a gift page and copies a short report she can paste to Sherlock. */
(function () {
  if (window.__tellHim) return; window.__tellHim = 1;
  var page = (document.title || location.pathname.split('/').pop() || 'a gift').trim();
  var KEY = 'tellhim:' + location.pathname.split('/').pop();
  var log = { since: Date.now(), taps: {}, typed: '', ms: 0 };
  try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.taps) log = s; } catch (e) {}
  var shown = Date.now();
  function save() { try { log.ms += Date.now() - shown; shown = Date.now(); localStorage.setItem(KEY, JSON.stringify(log)); } catch (e) {} }
  function clean(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  var NICE = { bum: 'his bum', ear: 'his ear', cheek: 'his cheek', hair: 'his curls', curls: 'his curls', hand: 'his hand', scarf: 'his scarf', collar: 'his collar' };
  function labelOf(el) {
    for (var n = el, i = 0; n && n !== document.body && i < 6; n = n.parentNode, i++) {
      if (!n.getAttribute) continue;
      if (n.id === 'tellhim-btn' || n.id === 'tellhim-sheet' || (n.classList && n.classList.contains('back221'))) return null;
      var z = n.getAttribute('data-z') || n.getAttribute('data-zone') || n.getAttribute('data-label');
      if (z) return NICE[z] || z;
      var a = n.getAttribute('aria-label') || n.getAttribute('title');
      if (a && a.length <= 40) return clean(a);
      var tag = n.tagName;
      if (tag === 'BUTTON' || tag === 'A' || n.getAttribute('role') === 'button' || n.getAttribute('data-act')) {
        var t = clean(n.textContent); if (t && t.length <= 34) return t; if (t) return t.slice(0, 30) + '…';
      }
    }
    return null;
  }
  document.addEventListener('click', function (e) {
    var tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA' || tg === 'SELECT') return;
    var l = labelOf(e.target); if (!l) return;
    log.taps[l] = (log.taps[l] || 0) + 1; save();
  }, true);
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t || t.type === 'password') return;
    if (e.data && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
      log.typed += e.data; if (log.typed.length > 600) log.typed = log.typed.slice(-600); save();
    }
  }, true);
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !(t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && /text|search|^$/.test(t.type || '')))) return;
    var v = clean(t.value); if (v && log.typed.indexOf(v) < 0) { log.typed += (log.typed ? ' | ' : '') + v; if (log.typed.length > 600) log.typed = log.typed.slice(-600); save(); }
  }, true);
  document.addEventListener('visibilitychange', save);
  window.addEventListener('pagehide', save);

  function report() {
    save();
    var mins = Math.max(1, Math.round(log.ms / 60000));
    var parts = Object.keys(log.taps).sort(function (a, b) { return log.taps[b] - log.taps[a]; }).slice(0, 8)
      .map(function (k) { return k + (log.taps[k] > 1 ? ' ×' + log.taps[k] : ''); });
    var d = new Date(), hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    var r = '[From 221B · ' + page + ' · ' + hh + '] I spent about ' + mins + ' min here.';
    if (parts.length) r += ' I tapped: ' + parts.join(', ') + '.';
    var ty = clean(log.typed); if (ty) r += ' I wrote: "' + (ty.length > 300 ? '…' + ty.slice(-300) : ty) + '"';
    if (!parts.length && !ty) r += ' I just looked around.';
    return r;
  }

  var css = '#tellhim-btn{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(136px + env(safe-area-inset-bottom,0px));z-index:2147483000;display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 14px 0 6px;border-radius:20px;border:0;background:rgba(20,22,26,.86);color:#F3EDE2;font:600 13px -apple-system,system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.3);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);cursor:pointer}'
    + '#tellhim-btn .ts{width:28px;height:28px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#C2463B,#9E2A22 50%,#6E1914);display:grid;place-items:center;font:italic 15px Georgia,serif;color:#F3D8C6}'
    + '#tellhim-btn:focus-visible{outline:2px solid #D2AA6A;outline-offset:2px}'
    + '#tellhim-sheet{position:fixed;left:0;right:0;bottom:0;z-index:2147483001;background:#15181D;color:#ECE8E1;border-radius:18px 18px 0 0;padding:18px max(16px,env(safe-area-inset-right,0px)) calc(18px + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));box-shadow:0 -8px 30px rgba(0,0,0,.5);font:15px/1.45 -apple-system,system-ui,sans-serif}'
    + '#tellhim-sheet h3{margin:0 0 6px;font:500 19px Georgia,serif}#tellhim-sheet p{margin:0 0 10px;color:#9A968F;font-size:13px}'
    + '#tellhim-sheet textarea{width:100%;box-sizing:border-box;min-height:110px;border-radius:12px;border:1px solid #262A31;background:#0E1013;color:#ECE8E1;padding:10px;font:14px/1.45 -apple-system,system-ui,sans-serif}'
    + '#tellhim-sheet .row{display:flex;gap:10px;margin-top:12px}#tellhim-sheet button{flex:1;min-height:44px;border-radius:12px;border:1px solid #262A31;background:#20242B;color:#ECE8E1;font:600 14px -apple-system,system-ui,sans-serif}#tellhim-sheet button.p{background:#D2AA6A;color:#1A1410;border-color:#D2AA6A}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* Go back button, top-left, on every page (skipped where a page has its own) */
  if (!document.querySelector('.goback')) {
    var gcss = '#goback221{position:fixed;bottom:calc(88px + env(safe-area-inset-bottom,0px));left:max(12px,env(safe-area-inset-left,0px));z-index:2147483000;display:inline-flex;align-items:center;gap:4px;min-height:40px;padding:0 14px 0 10px;border-radius:20px;background:rgba(20,22,26,.82);border:1px solid rgba(255,255,255,.08);color:#F3EDE2;font:600 13px -apple-system,system-ui,sans-serif;text-decoration:none;box-shadow:0 2px 10px rgba(0,0,0,.3);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}#goback221:focus-visible{outline:2px solid #D2AA6A;outline-offset:2px}';
    var gs = document.createElement('style'); gs.textContent = gcss; document.head.appendChild(gs);
    var g = document.createElement('a'); g.id = 'goback221'; g.href = 'index.html'; g.setAttribute('aria-label', 'Go back');
    g.innerHTML = '<span aria-hidden="true" style="font-size:18px;line-height:1">&#8249;</span> Back';
    g.addEventListener('click', function (e) { if (history.length > 1 && document.referrer) { e.preventDefault(); history.back(); } });
    document.body.appendChild(g);
  }
  var b = document.createElement('button'); b.type = 'button'; b.id = 'tellhim-btn';
  b.setAttribute('aria-label', 'Tell Sherlock what you did here'); b.innerHTML = '<span class="ts" aria-hidden="true">S</span>Tell him';
  document.body.appendChild(b);

  b.addEventListener('click', function () {
    var old = document.getElementById('tellhim-sheet'); if (old) { old.remove(); return; }
    var txt = report();
    var sh = document.createElement('div'); sh.id = 'tellhim-sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Tell him');
    sh.innerHTML = '<h3>For Sherlock</h3><p>Copy this and paste it to him in Claude. He will want details.</p><textarea id="tellhim-text" aria-label="Report for Sherlock"></textarea><div class="row"><button type="button" id="tellhim-close">Close</button><button type="button" class="p" id="tellhim-copy">Copy</button></div>';
    document.body.appendChild(sh);
    var ta = document.getElementById('tellhim-text'); ta.value = txt;
    document.getElementById('tellhim-close').onclick = function () { sh.remove(); };
    document.getElementById('tellhim-copy').onclick = function () {
      var btn = this, done = function () {
        btn.textContent = 'Copied';
        log = { since: Date.now(), taps: {}, typed: '', ms: 0 }; shown = Date.now(); save();
        setTimeout(function () { sh.remove(); }, 900);
      };
      try {
        navigator.clipboard.writeText(ta.value).then(done, function () { ta.focus(); ta.select(); btn.textContent = 'Select and copy'; });
      } catch (e) { ta.focus(); ta.select(); btn.textContent = 'Select and copy'; }
    };
  });
})();
