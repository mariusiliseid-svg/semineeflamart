/* BOKAR România — interacțiuni peste paginile generate: meniu, cereri de ofertă (intră ca lead în CRM),
   filtre catalog, variante produs, galerii, cookie-uri și Google Analytics / Ads. */
const FIREBASE_CONFIG = {
  apiKey:'AIzaSyC8lON_PQ9OIvnDUqzqRDHsxXINLpC8uB4', authDomain:'bokar-crm.firebaseapp.com', projectId:'bokar-crm',
  storageBucket:'bokar-crm.firebasestorage.app', messagingSenderId:'45902513565', appId:'1:45902513565:web:1d2c55629af5d23e0d9b74'
};
const $ = (s, r) => (r||document).querySelector(s);
const $$ = (s, r) => [...(r||document).querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const cuTVA = n => (Number(n)||0) * (1 + CONFIG.tva);
const pretFmt = n => Math.round(cuTVA(n)).toLocaleString('ro-RO') + ' ' + CONFIG.moneda;
const minPret = m => m.pret ? Math.min(...Object.values(m.pret)) : 0;
const pretModel = (m, v, latura) => ((m.pretLatura && m.pretLatura[latura]) || m.pret || {})[v];
const today = () => { const d = new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10); };
const store = { get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }, set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} } };

/* ---- meniu pe telefon ---- */
(function(){
  const b = $('.burger'), n = $('#nav'); if(!b || !n) return;
  b.onclick = () => { const o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o); };
})();

/* ---- cookie-uri, Google Analytics 4 și Google Ads (doar după acord) ---- */
const TRACKING = !!(CONFIG.ga4Id || CONFIG.adsId);
let gaReady = false;
function gtag(){ (window.dataLayer = window.dataLayer || []).push(arguments); }
function startTracking(){
  if(gaReady || !TRACKING) return; gaReady = true;
  const id = CONFIG.ga4Id || CONFIG.adsId;
  const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id); document.head.append(s);
  gtag('js', new Date());
  gtag('consent', 'update', { analytics_storage:'granted', ad_storage:'granted', ad_user_data:'granted', ad_personalization:'granted' });
  if(CONFIG.ga4Id) gtag('config', CONFIG.ga4Id);
  if(CONFIG.adsId) gtag('config', CONFIG.adsId);
  (window.__pending || []).forEach(a => gtag(...a)); window.__pending = [];
}
function track(name, params){
  if(!TRACKING) return;
  if(gaReady) gtag('event', name, params || {}); else (window.__pending = window.__pending || []).push(['event', name, params || {}]);
}
function consentBanner(){
  let c = $('#consent');
  if(!c){ c = document.createElement('div'); c.id = 'consent'; c.className = 'consent'; c.setAttribute('role','dialog'); c.setAttribute('aria-label','Cookie-uri'); document.body.append(c); }
  c.innerHTML = `<p>Folosim cookie-uri Google Analytics și Google Ads ca să vedem cum e folosit site-ul și ce campanii aduc cereri de ofertă. Le activăm doar dacă ești de acord. <a href="/confidentialitate/#cookie">Detalii</a></p>
    <div class="acts"><button class="btn btn-red" type="button" data-c="1">Accept</button><button class="btn btn-line" type="button" data-c="0">Refuz</button></div>`;
  c.hidden = false;
  $$('[data-c]', c).forEach(b => b.onclick = () => { const ok = b.dataset.c==='1'; store.set('bk_consent', ok?'da':'nu'); c.hidden = true; if(ok) startTracking(); else if(gaReady) location.reload(); });
}
if(TRACKING){
  gtag('consent', 'default', { analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
  const v = store.get('bk_consent');
  if(v==='da') startTracking(); else if(v!=='nu') consentBanner();
  const lnk = $('#cookieSet'); if(lnk){ lnk.hidden = false; lnk.onclick = consentBanner; }
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="tel:"],a[href^="mailto:"]'); if(!a) return;
  track(a.href.startsWith('tel:') ? 'click_telefon' : 'click_email', { link_url:a.href });
});

/* ---- Firebase (încărcat doar la trimiterea unui formular) ---- */
let fbPromise = null;
function loadScript(src){ return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); }); }
function fb(){
  if(!fbPromise) fbPromise = (async () => {
    await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
    await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js');
    if(!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    return firebase.firestore();
  })();
  return fbPromise;
}

/* ---- formular cerere de ofertă ---- */
function leadFormHtml(prefix, model){
  const opts = MODELE.map(m => `<option value="${esc(m.slug)}" ${model && model.slug===m.slug?'selected':''}>${esc(m.nume)}</option>`).join('');
  return `<form class="form" id="${prefix}Form" novalidate>
    <label class="full">Modelul care te interesează
      <select id="${prefix}Model"><option value="">Nu știu încă, vreau o recomandare</option>${opts}</select></label>
    <label>Culoare<select id="${prefix}Var"><option value="White">Alb</option><option value="Black">Negru</option><option value="">Nu știu</option></select></label>
    <label>Județul<select id="${prefix}Judet"><option value="">Alege județul</option>${JUDETE.map(j => `<option>${j}</option>`).join('')}</select></label>
    <label>Nume<input id="${prefix}Nume" autocomplete="name" required></label>
    <label>Telefon<input id="${prefix}Tel" type="tel" autocomplete="tel" inputmode="tel" required></label>
    <label class="full">Mesaj (opțional)<textarea id="${prefix}Msg" placeholder="Ex.: casă nouă, living de 40 m², am deja coș de fum."></textarea></label>
    <label class="hp" aria-hidden="true">Nu completa<input id="${prefix}Hp" tabindex="-1" autocomplete="off"></label>
    <label class="full chk"><input type="checkbox" id="${prefix}Gdpr" required><span>Sunt de acord ca datele mele să fie folosite pentru a primi oferta, conform <a href="/confidentialitate/" target="_blank">Politicii de confidențialitate</a>.</span></label>
    <div class="full" id="${prefix}Out" role="status"></div>
    <div class="full"><button class="btn btn-red" type="submit" id="${prefix}Btn" style="width:100%">Trimite cererea</button></div>
  </form>`;
}
function bindLeadForm(prefix){
  const form = document.getElementById(prefix+'Form'), out = document.getElementById(prefix+'Out'), btn = document.getElementById(prefix+'Btn');
  form.onsubmit = async e => {
    e.preventDefault();
    const g = id => document.getElementById(prefix+id).value.trim();
    if(g('Hp')) return;
    const nume = g('Nume'), tel = g('Tel'), judet = g('Judet');
    if(nume.length < 2 || tel.replace(/\D/g,'').length < 9 || !judet){
      out.innerHTML = `<div class="msg bad">Completează numele, un număr de telefon valid și județul.</div>`; return; }
    if(!document.getElementById(prefix+'Gdpr').checked){
      out.innerHTML = `<div class="msg bad">Bifează acordul pentru prelucrarea datelor, ca să-ți putem trimite oferta.</div>`; return; }
    const m = MODELE.find(x => x.slug===g('Model')), varianta = g('Var'), model = m ? MODEL_CRM[m.slug] : '';
    const valoare = m && m.pret ? Number(cuTVA(m.pret[varianta||'White']||minPret(m)).toFixed(2)) : 0;   // în CRM valoarea e cu TVA
    btn.disabled = true; btn.textContent = 'Se trimite…'; out.innerHTML = '';
    try{
      const db = await fb();
      await db.collection('leaduri').add({
        nume:nume.slice(0,100), telefon:tel.slice(0,30), judet, model, varianta,
        interes: m ? `${model}${varianta?' '+varianta:''}` : 'Recomandare model',
        valoare, mesaj:g('Msg').slice(0,2000), sursa:'site', data:today(), status:'nou',
        preluatDe:null, dataPreluare:null, dataFinalizare:null
      });
      form.reset();
      out.innerHTML = `<div class="msg ok">Mulțumim, ${esc(nume.split(' ')[0])}! Am primit cererea și te sunăm în curând.</div>`;
      track('generate_lead', { currency:'EUR', value:valoare, item_name:model||'recomandare' });
      if(CONFIG.adsId && CONFIG.adsLeadLabel) track('conversion', { send_to:`${CONFIG.adsId}/${CONFIG.adsLeadLabel}`, value:valoare, currency:'EUR' });
    }catch(err){
      console.error(err);
      out.innerHTML = `<div class="msg bad">Cererea nu s-a putut trimite. Verifică internetul și încearcă din nou, sau scrie-ne la ${esc(CONFIG.email)}.</div>`;
    }finally{ btn.disabled = false; btn.textContent = 'Trimite cererea'; }
  };
}
function openLead(model, msg){
  let m = document.getElementById('leadModal');
  if(!m){ m = document.createElement('div'); m.id = 'leadModal'; m.className = 'modal'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true'); document.body.append(m); }
  m.innerHTML = `<div class="box"><button class="x" type="button" aria-label="Închide">×</button>
    <h3>Cere ofertă${model?' pentru '+esc(model.nume):''}</h3>
    <p class="muted" style="margin-bottom:20px">Îți trimitem prețul final, cu accesorii și montajul făcut de un partener BOKAR din zona ta.</p>${leadFormHtml('lm', model)}</div>`;
  m.hidden = false; document.body.style.overflow = 'hidden';
  const close = () => { m.hidden = true; document.body.style.overflow = ''; };
  m.querySelector('.x').onclick = close;
  m.onclick = e => { if(e.target===m) close(); };
  document.addEventListener('keydown', function k(e){ if(e.key==='Escape'){ close(); document.removeEventListener('keydown', k); } });
  bindLeadForm('lm');
  if(msg) document.getElementById('lmMsg').value = msg;
  setTimeout(() => document.getElementById('lmNume').focus(), 30);
  track('deschide_cerere_oferta', { item_name: model ? model.nume : '' });
  return m;
}
$$('[data-lead]').forEach(b => b.addEventListener('click', () => openLead(MODELE.find(x => x.slug===b.dataset.lead), b.dataset.msg)));
(function(){ const box = $('#leadBox'); if(!box) return;
  const pre = MODELE.find(m => m.slug===new URLSearchParams(location.search).get('m'));
  box.innerHTML = leadFormHtml('cf', pre); bindLeadForm('cf'); })();

/* ---- catalog: filtre și ordonare peste cardurile generate ---- */
(function(){
  const list = $('#list'); if(!list) return;
  const cards = $$('.card', list), count = $('#count'), sort = $('#sort');
  let fam = (location.hash||'').slice(1); if(!FAMILII[fam]) fam = '';
  function render(){
    $$('[data-f]').forEach(b => b.setAttribute('aria-pressed', b.dataset.f===fam));
    let vis = cards.filter(c => !fam || c.dataset.fam===fam || (fam==='ghilotina' && c.dataset.g==='1'));
    const s = sort.value;
    if(s==='p') vis.sort((a,b) => a.dataset.p - b.dataset.p);
    if(s==='pd') vis.sort((a,b) => b.dataset.p - a.dataset.p);
    if(s==='kw') vis.sort((a,b) => b.dataset.kw - a.dataset.kw);
    if(!s) vis.sort((a,b) => a.dataset.i - b.dataset.i);
    cards.forEach(c => c.hidden = !vis.includes(c));
    vis.forEach(c => list.append(c));
    count.textContent = `${vis.length} ${vis.length===1?'model':'modele'}`;
  }
  $$('[data-f]').forEach(b => b.onclick = () => { fam = b.dataset.f; history.replaceState(null,'', fam?'#'+fam:location.pathname); render(); });
  sort.onchange = render;
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); fam = FAMILII[h] ? h : ''; render(); });
  render();
})();

/* ---- pagina de produs ---- */
(function(){
  const root = $('#pd'); if(!root) return;
  const m = MODELE.find(x => x.slug===root.dataset.slug); if(!m) return;
  let variant = 'White', latura = m.laturi ? m.laturi[0] : '';
  const main = $('#main'), price = $('#pret');
  const show = (src, cover) => { main.innerHTML = `<img src="${esc(src)}" alt="${esc(m.nume)}" class="${cover?'cover':''}">`;
    main.firstChild.onerror = () => { main.firstChild.onerror = null; main.firstChild.src = m.img; main.firstChild.className = ''; }; };
  const setP = () => { const v = pretModel(m, variant, latura); price.textContent = v ? pretFmt(v) : 'La cerere';
    const ll = $('#latLbl'); if(ll) ll.textContent = latura==='L' ? '· stânga' : '· dreapta'; };
  $$('[data-v]', root).forEach(b => b.onclick = () => { variant = b.dataset.v; $$('[data-v]', root).forEach(x => x.setAttribute('aria-pressed', x===b)); setP(); });
  $$('[data-l]', root).forEach(b => b.onclick = () => { latura = b.dataset.l; $$('[data-l]', root).forEach(x => x.setAttribute('aria-pressed', x===b));
    if(b.dataset.img) show(b.dataset.img); setP(); });
  $$('.thumbs [data-src]', root).forEach(b => b.onclick = () => { show(b.dataset.src, b.dataset.cover==='1'); $$('.thumbs [data-src]', root).forEach(x => x.setAttribute('aria-current', x===b)); });
  $$('.shades [data-src]', root).forEach(b => b.onclick = () => { show(b.dataset.src, true); $$('.shades [data-src]', root).forEach(x => x.setAttribute('aria-pressed', x===b)); });
  $('#lead').onclick = () => { openLead(m, latura ? `Varianta ${latura==='L'?'stânga (L)':'dreapta (R)'}. ` : '');
    $('#lmVar').value = variant; };
  setP();
  track('view_item', { currency:'EUR', value:Math.round(cuTVA(minPret(m))), items:[{ item_id:m.slug, item_name:m.nume }] });
})();

/* ---- accesorii: culoare grilă și cereri ---- */
$$('.acc-media [data-photo]').forEach(b => b.onclick = () => {
  const fig = b.closest('figure'); const img = $('img', fig);
  img.src = b.dataset.photo; img.alt = b.dataset.alt || img.alt;
  $$('[data-photo]', fig).forEach(x => x.setAttribute('aria-pressed', x===b));
});
$$('[data-ask]').forEach(b => b.onclick = () => { const m = openLead(null, b.dataset.ask); $('#lmVar').value = ''; });

/* ---- cerere de parteneriat ---- */
(function(){
  const f = $('#pf'); if(!f) return;
  $('#pJudet').innerHTML += JUDETE.map(j => `<option>${j}</option>`).join('');
  f.onsubmit = async e => {
    e.preventDefault();
    const g = id => document.getElementById(id).value.trim(), out = $('#pOut'), btn = $('#pBtn');
    if(g('pHp')) return;
    const iban = g('pIban').replace(/\s+/g,'').toUpperCase();
    if(g('pFirma').length<2 || g('pNume').length<2 || g('pTel').replace(/\D/g,'').length<9 || !g('pJudet')
       || g('pCui').replace(/\D/g,'').length<2 || g('pRc').length<3 || g('pSediu').length<5 || g('pRep').length<3
       || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g('pMail'))){
      out.innerHTML = '<div class="msg bad">Completează toate datele firmei: denumire, CUI, Reg. Com., sediu, reprezentant, județ, persoana de contact, telefon și e-mail.</div>'; return; }
    if(!/^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(iban)){ out.innerHTML = '<div class="msg bad">IBAN-ul nu pare corect (RO + 22 de caractere).</div>'; return; }
    if(!$('#pGdpr').checked){ out.innerHTML = '<div class="msg bad">Bifează acordul pentru prelucrarea datelor.</div>'; return; }
    btn.disabled = true; btn.textContent = 'Se trimite…';
    const base = { firma:g('pFirma').slice(0,120), cui:g('pCui').slice(0,20), judet:g('pJudet'),
        nume:g('pNume').slice(0,100), telefon:g('pTel').slice(0,30), email:g('pMail').slice(0,120), tip:g('pTip'),
        mesaj:g('pMsg').slice(0,2000), data:today(), status:'nou' };
    const extra = { rc:g('pRc').slice(0,40), sediu:g('pSediu').slice(0,200), rep:g('pRep').slice(0,100), fct:g('pFct').slice(0,60),
        iban:iban.slice(0,34), banca:g('pBanca').slice(0,80), tva:g('pTva') };
    try{
      const db = await fb();
      try{ await db.collection('cereriParteneriat').add(Object.assign({}, base, extra)); }
      catch(err){
        // dacă regulile Firestore nu acceptă încă noile câmpuri, trimitem datele firmei în mesaj, ca cererea să nu se piardă
        if(!String(err && err.code).includes('permission')) throw err;
        const txt = `Reg. Com.: ${extra.rc}\nSediu: ${extra.sediu}\nReprezentant: ${extra.rep}, ${extra.fct}\nIBAN: ${extra.iban} ${extra.banca}\nTVA: ${extra.tva==='da'?'plătitor':'neplătitor'}`;
        await db.collection('cereriParteneriat').add(Object.assign({}, base, { mesaj:(txt + (base.mesaj ? '\n\n' + base.mesaj : '')).slice(0,2000) }));
      }
      f.reset();
      out.innerHTML = '<div class="msg ok">Mulțumim! Am primit cererea și te contactăm în curând.</div>';
      track('cerere_parteneriat', {});
    }catch(err){ console.error(err); out.innerHTML = `<div class="msg bad">Cererea nu s-a putut trimite. Încearcă din nou sau scrie-ne la ${esc(CONFIG.email)}.</div>`; }
    finally{ btn.disabled = false; btn.textContent = 'Trimite cererea'; }
  };
})();
