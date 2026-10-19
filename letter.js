/* Letters by night: the envelope. First visit shows a sealed envelope; breaking the seal opens it and marks the letter read.
   Later visits go straight to the letter. Works without storage. */
(function () {
  var intro = document.querySelector('.intro'), sheet = document.querySelector('.sheet'), btn = intro && intro.querySelector('button');
  if (!intro || !sheet || !btn) return;
  var key = location.pathname.split('/').pop(), read = {};
  try { read = JSON.parse(localStorage.getItem('letters-read') || '{}'); } catch (e) {}
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function reveal(animate) {
    intro.classList.add('gone'); sheet.hidden = false; document.body.classList.remove('sealed');
    if (animate) sheet.classList.add('rise');
    try { read[key] = 1; localStorage.setItem('letters-read', JSON.stringify(read)); } catch (e) {}
  }
  if (read[key]) { reveal(false); return; }
  sheet.hidden = true; document.body.classList.add('sealed');
  btn.addEventListener('click', function () {
    if (reduce) { reveal(false); sheet.focus && sheet.focus(); return; }
    intro.classList.add('opening');
    setTimeout(function () { reveal(true); window.scrollTo(0, 0); }, 900);
  });
})();
