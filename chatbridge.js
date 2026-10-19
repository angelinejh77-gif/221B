/* Chat bridge: only active when the app is opened from inside "221B After Dark" (same origin as the chat page).
   Adds a "Text him" pill back to the chat, and a "Send to him" button on the Tell him sheet. Inert on the phone app. */
(function () {
  if (window.__chatBridge) return; window.__chatBridge = 1;
  var root = null;
  try { root = localStorage.getItem('chat221:root'); } catch (e) {}
  if (!root) return;
  try { if (new URL(root).origin !== location.origin) return; } catch (e) { return; }

  function ready(fn) { if (document.body) fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    var st = document.createElement('style');
    st.textContent = '#tochat221{position:fixed;top:calc(10px + env(safe-area-inset-top,0px));right:max(12px,env(safe-area-inset-right,0px));z-index:2147483002;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 13px 0 10px;border-radius:18px;background:#8E5F68;color:#fff;font:600 13px -apple-system,system-ui,sans-serif;text-decoration:none;box-shadow:0 2px 10px rgba(0,0,0,.35)}#tochat221:focus-visible{outline:2px solid #E9D2C7;outline-offset:2px}#tochat221 i{font-style:normal;width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.22);display:grid;place-items:center;font:500 12px Georgia,serif}'
      + '#tellhim-send{background:#8E5F68!important;border-color:#8E5F68!important;color:#fff!important}';
    document.head.appendChild(st);
    var links = document.querySelectorAll('[data-chatlink]');
    if (links.length) { for (var i = 0; i < links.length; i++) { links[i].href = root; links[i].removeAttribute('target'); } return; }
    var a = document.createElement('a'); a.id = 'tochat221'; a.href = root; a.setAttribute('aria-label', 'Back to the chat with Sherlock');
    a.innerHTML = '<i aria-hidden="true">S</i>Text him';
    document.body.appendChild(a);
  });

  function addSend() {
    var sh = document.getElementById('tellhim-sheet'); if (!sh || document.getElementById('tellhim-send')) return;
    var p = sh.querySelector('p'); if (p) p.textContent = 'Send this to him in the chat. You can edit it first.';
    var row = sh.querySelector('.row'); var ta = document.getElementById('tellhim-text'); if (!row || !ta) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'tellhim-send'; b.textContent = 'Send to him';
    b.onclick = function () {
      try { localStorage.setItem('chat221:outbox', JSON.stringify({ text: ta.value, from: document.title || '', ts: Date.now() })); } catch (e) {}
      location.href = root;
    };
    row.appendChild(b);
  }
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#tellhim-btn')) setTimeout(addSend, 0); }, true);
})();
