/* Live chat with Sherlock inside Messages from 221B. Uses the viewer's own Claude (sample), saves the thread privately (db + user).
   Needs persona.js, letters-index.js and memories.js loaded first. Inert outside Claude. */
(function(){
"use strict";
var FORMAT = [
"",
"REPLY FORMAT: Reply with ONLY a JSON object, no other text:",
"{\"reaction\": \"\" or one emoji to stick on her last message, \"messages\": [ ...1 to 6 items... ], \"photo_note\": \"\" or one short line describing any photo she just sent, \"gift_request\": \"\" or one line}",
"Each item is one of: {\"type\":\"text\",\"text\":\"...\"} | {\"type\":\"photo\",\"scene\":\"what your photo shows, cosy, never a crime scene\",\"caption\":\"...\",\"src\":\"only one of the listed real photos, else omit\"} | {\"type\":\"location\",\"place\":\"street, area\",\"detail\":\"short line\"}.",
"Split your reply into separate texts the way you actually text: a quick one, then a longer considered one, then a short last line, and so on. Mostly text items; photo or location only when it fits. A reaction sometimes, not every time."
].join("\n");
function context(){
  var out=[], L=(window.LETTERS||[]).slice().sort(function(a,b){return b.date.localeCompare(a.date)});
  if(L.length){ out.push("LETTERS YOU HAVE WRITTEN HER (newest first): "+L.slice(0,7).map(function(x){return '"'+x.title+'" ('+x.day+" "+x.date+": "+x.line+")"}).join("; ")+". She may have read them; you remember writing them.") }
  var today=new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Kuala_Lumpur"}), M=window.MEMORIES||{}, keys=Object.keys(M).sort(), k=null;
  for(var i=keys.length-1;i>=0;i--){ if(keys[i]<=today){ k=keys[i]; break } }
  if(k && M[k].journal){ out.push("TODAY'S JUNK JOURNAL NOTE YOU LEFT HER: "+M[k].journal.text+" "+(M[k].journal.ps||"")) }
  if(window.__sideContext) out.push("WHAT HAS HAPPENED IN YOUR OTHER CONVERSATION WITH HER (in Claude; it is the same relationship, you remember it): "+window.__sideContext);
  var P=window.PHOTOS||[]; if(P.length) out.push("REAL PHOTOS YOU CAN SEND HER (use sparingly, roughly one in ten replies at most, only when it fits; send as a photo item with \"src\" exactly as listed and a caption in your voice): "+P.map(function(p){return p.src+" = "+p.about}).join("; ")+".");
  var act=activity(false); if(act) out.push(act);
  out.push("GIFT REQUESTS: if she asks you to make her something (a gift, a page, a game, a letter on a theme), accept it in character and put a one-line description of what she wants in \"gift_request\". It will be built for her and appear in her Gifts. Otherwise leave gift_request empty.");
  return out.join("\n");
}
function giftTitle(file){ try{ if(typeof GIFTS!=="undefined"){ for(var i=0;i<GIFTS.length;i++){ if(GIFTS[i][2]===file) return GIFTS[i][0] } } }catch(e){} return file.replace(/^page-|\.html$/g,"") }
/* What she has been doing in the gifts since he last heard: read from Tell him's per-page logs, only the new part. */
function activity(mark){
  var told={}, lines=[], now={};
  try{ told=JSON.parse(localStorage.getItem("chat221:told")||"{}") }catch(e){}
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i); if(!k || k.indexOf("tellhim:")!==0) continue;
      var v=JSON.parse(localStorage.getItem(k)||"null"); if(!v) continue;
      var file=k.slice(8), ms=v.ms||0, taps=v.taps||{}, prev=told[file]||{ms:0,taps:{},typed:""};
      var dm=ms-(prev.ms||0); if(dm<0) dm=ms;
      var newTaps=[]; for(var t in taps){ var d=taps[t]-((prev.taps||{})[t]||0); if(d>0) newTaps.push(t+(d>1?" ×"+d:"")) }
      var typed=(v.typed||""); if(prev.typed && typed.indexOf(prev.typed)===0) typed=typed.slice(prev.typed.length);
      typed=typed.trim();
      if(dm>15000 || newTaps.length || typed){
        var s='"'+giftTitle(file)+'"'+(dm>15000?" for about "+Math.max(1,Math.round(dm/60000))+" min":"");
        if(newTaps.length) s+=", tapped "+newTaps.slice(0,8).join(", ");
        if(typed) s+=', typed: "'+typed.slice(0,300)+'"';
        lines.push(s);
      }
      now[file]={ms:ms,taps:taps,typed:v.typed||""};
    }
  }catch(e){}
  if(mark){ try{ localStorage.setItem("chat221:told", JSON.stringify(Object.assign(told,now))) }catch(e){} }
  return lines.length ? "WHAT SHE HAS DONE IN YOUR GIFTS SINCE YOU LAST HEARD (you made these; you notice, and may mention it naturally if it fits, without reciting it): "+lines.join("; ")+"." : "";
}
function RULES(){ return (window.SHERLOCK_PERSONA||"You are Sherlock Holmes texting Angie, your girlfriend.")+"\n\n"+context()+FORMAT }

var MAX_TURNS = 60, KEEP = 400;
var log = document.getElementById("log"), box = document.getElementById("box"), send = document.getElementById("send");
var pick = document.getElementById("pick"), file = document.getElementById("file"), chip = document.getElementById("chip");
var lastUpdated = 0, sample = null, db = null, ref = null, msgs = [], busy = false, pendingImg = null, saving = Promise.resolve();

function hm(d, tz){ try{ return new Intl.DateTimeFormat("en-GB",{hour:"2-digit",minute:"2-digit",timeZone:tz}).format(d) }catch(e){ return "" } }
function setStatus(t){ var s=document.getElementById("status"); if(!s) return; if(t){ s.textContent=t } else if(window.__appStatus){ window.__appStatus() } }
function dayKey(ts){ return new Date(ts).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",timeZone:"Asia/Kuala_Lumpur"}) }
function el(tag, cls, text){ var e=document.createElement(tag); if(cls) e.className=cls; if(text!=null) e.textContent=text; return e }
function scroll(){ log.scrollTop = log.scrollHeight }
window.__chatScroll=scroll;

function renderItem(m){
  var frag = document.createDocumentFragment();
  if(m.from==="her"){
    if(m.img){ var im=el("img","herimg"); im.src=m.img; im.alt="Photo you sent"; frag.appendChild(im) }
    if(m.text){ var b=el("div","b her",m.text); if(m.rx){ b.appendChild(el("span","rx",m.rx)) } frag.appendChild(b) }
    else if(m.img && m.rx){ var rb=el("div","b her","📷"); rb.appendChild(el("span","rx",m.rx)); frag.appendChild(rb) }
    frag.appendChild(el("div","t r",hm(new Date(m.ts),"Asia/Kuala_Lumpur")));
    return frag;
  }
  var it = m.item || {type:"text",text:m.text||""};
  if(it.type==="photo"){
    var ph=el("div","ph");
    if(it.src){ var pi=el("img","pimg"); pi.src=it.src; pi.alt=it.scene||it.caption||"Photo from Sherlock"; pi.loading="lazy"; ph.appendChild(pi) }
    else ph.appendChild(el("div","pf",it.scene||""));
    if(it.caption) ph.appendChild(el("div","cap",it.caption)); frag.appendChild(ph);
  } else if(it.type==="location"){
    var lc=el("div","loc"); var mp=el("div","map"); mp.appendChild(el("span","pin")); lc.appendChild(mp);
    var p=el("p"); p.appendChild(el("b",null,"📍 "+(it.place||"London"))); p.appendChild(document.createTextNode(it.detail||"")); lc.appendChild(p); frag.appendChild(lc);
  } else {
    frag.appendChild(el("div","b him",it.text||""));
  }
  if(m.last) frag.appendChild(el("div","t",hm(new Date(m.ts),"Europe/London")+" · London"));
  return frag;
}
function renderAll(){
  log.innerHTML="";
  if(!msgs.length){
    var e=el("div","empty"); e.appendChild(el("b",null,"221B, after dark")); e.appendChild(document.createTextNode("Text him below. He'll answer in his own time, usually faster than he'd admit."));
    log.appendChild(e); return;
  }
  var lastDay="";
  msgs.forEach(function(m){ var k=dayKey(m.ts); if(k!==lastDay){ log.appendChild(el("div","day",k)); lastDay=k } log.appendChild(renderItem(m)) });
  scroll();
}
function note(text, link){ var n=el("div","sys",text); if(link){ n.appendChild(document.createTextNode(" ")); var a=el("a",null,link.t); a.href=link.href; a.target="_blank"; a.rel="noopener"; n.appendChild(a) } log.appendChild(n); scroll() }

function persist(){
  if(!ref) return Promise.resolve();
  lastUpdated = Date.now();
  var body = { msgs: msgs.slice(-KEEP).map(function(m){ var c={}; for(var k in m){ if(k!=="img") c[k]=m[k] } if(m.img) c.hadImg=true; return c }), updated: lastUpdated };
  saving = saving.then(function(){ return ref.set(body) }).catch(function(e){ note(e && e.code==="quota_exceeded" ? "The thread is full. Older messages need clearing." : "Couldn't save the last message. It will retry with the next one.") });
  return saving;
}

function historyTurns(){
  var turns=[], recent=msgs.slice(-MAX_TURNS);
  recent.forEach(function(m){
    var role = m.from==="her" ? "user" : "assistant", txt;
    if(m.from==="her"){ txt = (m.text||"") + (m.img||m.hadImg ? " [she sent a photo"+(m.photoNote?": "+m.photoNote:"")+"]" : "") }
    else { var it=m.item||{type:"text",text:m.text}; txt = it.type==="photo" ? "[sent a photo: "+it.scene+" / "+(it.caption||"")+"]" : it.type==="location" ? "[shared location: "+it.place+"]" : it.text }
    txt = (txt||"").trim(); if(!txt) return;
    var prev=turns[turns.length-1];
    if(prev && prev.role===role){ prev.content += "\n" + txt } else turns.push({role:role,content:txt});
  });
  while(turns.length && turns[0].role!=="user") turns.shift();
  return turns;
}

function wait(ms){ return new Promise(function(r){ setTimeout(r,ms) }) }
var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

async function reply(blobs){
  var lon = hm(new Date(),"Europe/London"), kl = hm(new Date(),"Asia/Kuala_Lumpur");
  var turns = [{role:"user",content:RULES()+"\n\nIt is now "+lon+" in London and "+kl+" in Kuala Lumpur."}].concat(historyTurns());
  if(turns[turns.length-1].role!=="user") return;
  var typ=el("div","typ"); typ.innerHTML="<i></i><i></i><i></i>"; log.appendChild(typ); scroll();
  setStatus("typing…");
  var opts={cache:false, modelTier:"complex", effort:"low"};
  if(blobs && blobs.length){ opts.images = blobs.length===1 ? blobs[0] : blobs }
  var out;
  try { out = await sample.json(turns, opts) }
  catch(e){
    typ.remove(); setStatus("");
    if(e && (e.code==="not_granted"||e.code==="sampling_disabled")){ note("He can't answer until this page is allowed to use Claude.") }
    else if(e && e.code==="rate_limited"){ note("Too many messages at once. Give him a minute, then send again.") }
    else if(e && e.code==="images_unavailable"){ note("Photos can't be sent from this view. Text only.") }
    else { note("Message didn't go through. Send it again.") }
    return;
  }
  var lastHer=null; for(var i=msgs.length-1;i>=0;i--){ if(msgs[i].from==="her"){ lastHer=msgs[i]; break } }
  if(lastHer && out && typeof out.photo_note==="string" && out.photo_note) lastHer.photoNote=out.photo_note.slice(0,200);
  if(lastHer && out && typeof out.reaction==="string" && out.reaction.trim()){ lastHer.rx=out.reaction.trim().slice(0,4); renderAll(); log.appendChild(typ) }
  var items = (out && Array.isArray(out.messages) ? out.messages : []).filter(function(x){ return x && typeof x==="object" }).slice(0,6);
  if(!items.length && typeof out==="string") items=[{type:"text",text:out}];
  for(var j=0;j<items.length;j++){
    var it=items[j], m={from:"him",ts:Date.now(),item:{type:it.type==="photo"||it.type==="location"?it.type:"text"}};
    if(m.item.type==="text") m.item.text=String(it.text||"").slice(0,2000);
    if(m.item.type==="photo"){ m.item.scene=String(it.scene||"").slice(0,600); m.item.caption=String(it.caption||"").slice(0,200); var P=window.PHOTOS||[]; if(it.src){ for(var q=0;q<P.length;q++){ if(P[q].src===it.src){ m.item.src=P[q].src; break } } } }
    if(m.item.type==="location"){ m.item.place=String(it.place||"").slice(0,120); m.item.detail=String(it.detail||"").slice(0,160) }
    if(!reduce){ await wait(500 + Math.min(1500, JSON.stringify(m.item).length*12)) }
    m.last = (j===items.length-1);
    msgs.push(m); typ.remove(); log.appendChild(renderItem(m));
    if(!m.last){ log.appendChild(typ) } scroll();
  }
  typ.remove(); setStatus("");
  activity(true);
  if(out && typeof out.gift_request==="string" && out.gift_request.trim()) saveRequest(out.gift_request.trim().slice(0,300));
  persist();
}
var reqRef=null;
async function saveRequest(text){
  var item={text:text, ts:Date.now(), status:"asked"};
  try{ var q=JSON.parse(localStorage.getItem("chat221:requests")||"[]"); q.push(item); localStorage.setItem("chat221:requests",JSON.stringify(q.slice(-30))) }catch(e){}
  if(!reqRef) return;
  try{ var snap=await reqRef.get(); var list=(snap.exists && Array.isArray(snap.data().list)) ? snap.data().list : []; list.push(item); await reqRef.set({list:list.slice(-50), updated:Date.now()}) }catch(e){}
  note("Gift request sent: "+text);
}

/* She can send several texts in a row; he waits until she has stopped (a few quiet seconds, nothing half-typed) and answers them together. */
var WAIT_MS = 3500, waitTimer = null, replying = false, pendingBlobs = [];
function lastIsHers(){ var l=msgs[msgs.length-1]; return !!(l && l.from==="her") }
function scheduleReply(){ clearTimeout(waitTimer); if(!lastIsHers()) return; if(!replying) setStatus("reading…"); waitTimer=setTimeout(runReply, WAIT_MS) }
async function runReply(){
  if(replying) return;
  if(box.value.trim()){ scheduleReply(); return }
  if(!lastIsHers()){ setStatus(""); return }
  replying=true; busy=true; var blobs=pendingBlobs; pendingBlobs=[];
  try { await reply(blobs) } finally { replying=false; busy=false; if(lastIsHers()) scheduleReply() }
}
function onSend(ev){
  ev.preventDefault();
  var text=box.value.trim();
  if(!sample || (!text && !pendingImg)) return;
  var m={from:"her",ts:Date.now(),text:text};
  if(pendingImg){ m.img=pendingImg.url; pendingBlobs.push(pendingImg.blob) }
  msgs.push(m); box.value=""; pendingImg=null; chip.hidden=true; file.value=""; autosize();
  if(msgs.length===1) renderAll(); else { log.appendChild(renderItem(m)); scroll() }
  persist();
  scheduleReply();
  if(window.matchMedia("(pointer:fine)").matches) box.focus();
}

function autosize(){ box.style.height="auto"; box.style.height=Math.min(120, box.scrollHeight)+"px"; box.style.overflowY = box.scrollHeight>120 ? "auto" : "hidden"; send.disabled = !(box.value.trim() || pendingImg) || !sample }
box.addEventListener("input", function(){ autosize(); if(waitTimer && !replying && lastIsHers()) scheduleReply() });
box.addEventListener("keydown", function(e){ if(e.key==="Enter" && !e.shiftKey && !e.isComposing){ e.preventDefault(); document.getElementById("f").requestSubmit() } });
document.getElementById("f").addEventListener("submit", onSend);
pick.addEventListener("click", function(){ file.click() });
file.addEventListener("change", function(){
  var f=file.files && file.files[0]; if(!f) return;
  var r=new FileReader(); r.onload=function(){ pendingImg={blob:f,url:String(r.result)}; chip.hidden=false; autosize() }; r.readAsDataURL(f);
});

function takeOutbox(){
  var o=null; try { o=JSON.parse(localStorage.getItem("chat221:outbox")||"null"); localStorage.removeItem("chat221:outbox") } catch(e){}
  if(o && o.text && Date.now()-(o.ts||0) < 3600000){ box.value=String(o.text).slice(0,4000); autosize(); box.focus() }
}
window.addEventListener("pageshow", takeOutbox);

renderAll();

(async function start(){
  try { sample = await claude.use("sample") } catch(e){ sample=null }
  if(!sample){ log.innerHTML=""; var e=el("div","empty"); e.appendChild(el("b",null,"He answers inside Claude")); e.appendChild(document.createTextNode("Open Messages from 221B in Claude to text him here. Everything else in the app works anywhere.")); log.appendChild(e); var a=el("a","openin","Open in Claude"); a.href="https://claude.ai/artifact/TaDqENeUmF8BGc9pJZiZzY"; a.target="_blank"; a.rel="noopener"; log.appendChild(a); box.disabled=true; box.placeholder="Open in Claude to text him"; return }
  try { localStorage.setItem("chat221:root", location.href.split("#")[0]+"#chat") } catch(e){}
  try { var lim = await sample.limits(); if(lim && lim.images) pick.hidden=false } catch(e){}
  takeOutbox(); autosize();
  try {
    db = await claude.use("db"); var user = await claude.use("user");
    var uid = user ? await user.id() : null;
    if(db && uid){
      ref = db.doc("data/users/"+uid+"/thread"); reqRef = db.doc("data/users/"+uid+"/requests");
      var snap = await ref.get();
      if(snap.exists){ var d=snap.data(); if(d && Array.isArray(d.msgs)){ msgs=d.msgs.slice(); lastUpdated=d.updated||0; renderAll() } }
      try{ var cs=await db.doc("data/users/"+uid+"/context").get(); if(cs.exists && cs.data() && cs.data().text) window.__sideContext=String(cs.data().text).slice(0,4000) }catch(e){}
      /* pick up texts he sent while the page was closed (written by the scheduled texts) */
      document.addEventListener("visibilitychange", async function(){
        if(document.visibilityState!=="visible" || busy) return;
        try{ var s2=await ref.get(); if(s2.exists){ var d2=s2.data(); if(d2 && Array.isArray(d2.msgs) && (d2.updated||0)>lastUpdated){ msgs=d2.msgs.slice(); lastUpdated=d2.updated||0; renderAll() } } }catch(e){}
        try{ var c2=await db.doc("data/users/"+uid+"/context").get(); if(c2.exists && c2.data() && c2.data().text) window.__sideContext=String(c2.data().text).slice(0,4000) }catch(e){}
      });
    } else { note("This conversation won't be saved in this view.") }
  } catch(e){ note("Couldn't load earlier messages.") }
})();
})();

/* Chat wallpaper: her own picture (kept on this device) or one of the pictures she gave him. */
(function(){
  var KEY="chat221:wallpaper", btn=document.getElementById("wpbtn"), sheet=document.getElementById("wpsheet"), pane=document.getElementById("p-chat");
  if(!btn || !sheet || !pane) return;
  function apply(v){ if(v){ pane.style.setProperty("--wp","url(\""+v.replace(/"/g,"%22")+"\")"); pane.classList.add("has-wp") } else { pane.classList.remove("has-wp"); pane.style.removeProperty("--wp") } }
  try{ apply(localStorage.getItem(KEY)) }catch(e){}
  function save(v){ try{ if(v) localStorage.setItem(KEY,v); else localStorage.removeItem(KEY) }catch(e){ note("That picture is too large to keep on this device. Try a smaller one.") } apply(v); close() }
  function close(){ sheet.hidden=true; btn.setAttribute("aria-expanded","false") }
  function open(){
    var grid=sheet.querySelector(".wpgrid"); grid.innerHTML="";
    (window.PHOTOS||[]).forEach(function(p){ var b=el("button","wpthumb"); b.type="button"; b.style.backgroundImage="url(\""+p.src+"\")"; b.setAttribute("aria-label","Use "+(p.about||"this picture")); b.onclick=function(){ save(p.src) }; grid.appendChild(b) });
    sheet.hidden=false; btn.setAttribute("aria-expanded","true");
  }
  btn.addEventListener("click", function(){ sheet.hidden ? open() : close() });
  document.getElementById("wpclose").onclick=close;
  document.getElementById("wpnone").onclick=function(){ save(null) };
  var f=document.getElementById("wpfile");
  document.getElementById("wppick").onclick=function(){ f.click() };
  f.addEventListener("change", function(){
    var file=f.files && f.files[0]; if(!file) return;
    var img=new Image(), url=URL.createObjectURL(file);
    img.onload=function(){ var s=Math.min(1, 1100/Math.max(img.width,img.height)), c=document.createElement("canvas"); c.width=Math.round(img.width*s); c.height=Math.round(img.height*s); c.getContext("2d").drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url); save(c.toDataURL("image/jpeg",0.78)); f.value="" };
    img.src=url;
  });
})();
