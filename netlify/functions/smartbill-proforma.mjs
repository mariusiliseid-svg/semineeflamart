// Creează o proformă CIORNĂ în SmartBill pentru FLAMART PROJECT SRL.
// Tokenul SmartBill stă doar aici, în variabilele de mediu Netlify — nu ajunge niciodată în aplicație.
//
// Variabile de mediu (Netlify → Site configuration → Environment variables):
//   SMARTBILL_EMAIL   emailul cu care intri în SmartBill Cloud
//   SMARTBILL_TOKEN   tokenul din SmartBill Cloud → Contul Meu → Integrări → API
//   SMARTBILL_CIF     CIF-ul Flamart exact ca în SmartBill (ex: RO47523170 sau 47523170)
//   SMARTBILL_SERIE   numele seriei de proforme din SmartBill (ex: FLP)
//   APP_PASSWORD      parola aplicației de oferte (aceeași cu care o deblochezi)
//   TVA_PROCENT       opțional, implicit 21; pune 0 dacă firma nu e plătitoare de TVA
//   TVA_NUME          opțional, implicit "Normala"

const SB_URL = 'https://ws.smartbill.ro/SBORO/api/estimate/v2';
const ALLOWED_ORIGINS = ['https://configurator.flamart.ro', 'http://localhost:8080', 'http://127.0.0.1:8080'];

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) || /\.netlify\.app$/.test(origin || '');
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Key',
    'Vary': 'Origin',
  };
}

function reply(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) },
  });
}

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const txt = (s, max = 250) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

// Construiește corpul cererii SmartBill din datele trimise de aplicație.
// Exportat ca să poată fi testat separat.
export function buildEstimate(input, env) {
  const tva = env.TVA_PROCENT === undefined || env.TVA_PROCENT === '' ? 21 : Number(env.TVA_PROCENT);
  const tvaNume = env.TVA_NUME || 'Normala';
  const taxa = tva > 0 ? { isTaxIncluded: true, taxName: tvaNume, taxPercentage: tva } : {};

  // Moneda: RON implicit (generatorul de oferte); EUR pentru comenzile partenerilor din portalul BOKAR.
  // La EUR, SmartBill ia singur cursul BNR al zilei.
  const moneda = String(input.moneda || 'RON').toUpperCase() === 'EUR' ? 'EUR' : 'RON';
  const c = input.client || {};
  const nume = txt(c.nume, 200);
  if (!nume) throw new Error('Lipsește numele clientului.');
  const cif = txt(c.cif, 20).toUpperCase().replace(/\s/g, '');

  const linii = (Array.isArray(input.linii) ? input.linii : [])
    .map((l) => ({ ...l, cantitate: Number(l.cantitate) || 0, pret: r2(l.pret) }))
    .filter((l) => txt(l.denumire) && l.cantitate > 0 && l.pret > 0);
  if (!linii.length) throw new Error('Nu există produse cu cantitate și preț pentru proformă.');
  if (linii.length > 200) throw new Error('Prea multe linii (maxim 200).');

  const products = linii.map((l) => {
    const p = {
      name: txt(l.denumire, 250),
      isDiscount: false,
      measuringUnitName: txt(l.um, 20) || 'buc',
      currency: moneda,
      quantity: l.cantitate,
      price: l.pret,
      ...taxa,
      saveToDb: false,
      isService: !!l.serviciu,
    };
    if (txt(l.nota)) p.productDescription = txt(l.nota, 500);
    return p;
  });

  const discount = r2(input.discount);
  if (discount > 0) {
    products.push({
      name: txt(input.discountNume, 120) || 'Discount',
      isDiscount: true,
      numberOfItems: linii.length,
      measuringUnitName: 'buc',
      currency: moneda,
      ...taxa,
      discountType: 1,
      discountValue: -discount,
    });
  }

  const body = {
    companyVatCode: env.SMARTBILL_CIF,
    client: {
      name: nume,
      vatCode: cif || '-',
      isTaxPayer: /^RO\d/.test(cif),
      address: txt(c.adresa, 250),
      city: txt(c.localitate, 80),
      county: txt(c.judet, 80),
      country: 'Romania',
      saveToDb: false,
    },
    seriesName: env.SMARTBILL_SERIE,
    isDraft: true, // doar ciornă — forțat aici, indiferent ce trimite aplicația
    currency: moneda,
    products,
  };
  const email = txt(c.email, 120);
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) body.client.email = email;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input.scadenta || '')) body.dueDate = input.scadenta;
  if (txt(input.mentiuni)) body.mentions = txt(input.mentiuni, 500);
  return body;
}

export default async (req) => {
  const origin = req.headers.get('origin') || '';
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== 'POST') return reply(405, { error: 'Doar POST.' }, origin);

  const env = process.env;
  const lipsa = ['SMARTBILL_EMAIL', 'SMARTBILL_TOKEN', 'SMARTBILL_CIF', 'SMARTBILL_SERIE', 'APP_PASSWORD'].filter((k) => !env[k]);
  if (lipsa.length) return reply(500, { error: 'Lipsesc setări pe server: ' + lipsa.join(', ') }, origin);

  if ((req.headers.get('x-app-key') || '') !== env.APP_PASSWORD) {
    return reply(401, { error: 'Parola aplicației nu e corectă.', auth: false }, origin);
  }

  let input;
  try { input = await req.json(); } catch { return reply(400, { error: 'Date invalide.' }, origin); }

  let body;
  try { body = buildEstimate(input, env); } catch (e) { return reply(400, { error: e.message }, origin); }

  const auth = Buffer.from(env.SMARTBILL_EMAIL + ':' + env.SMARTBILL_TOKEN).toString('base64');
  let res, out;
  try {
    res = await fetch(SB_URL, {
      method: 'POST',
      headers: { Authorization: 'Basic ' + auth, Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    try { out = JSON.parse(raw); } catch { out = { errorText: raw.slice(0, 300) }; }
  } catch (e) {
    return reply(502, { error: 'Nu am putut contacta SmartBill: ' + e.message }, origin);
  }

  if (!res.ok || (out && out.errorText)) {
    const msg = (out && (out.errorText || out.message)) || ('SmartBill a răspuns cu eroarea ' + res.status);
    return reply(res.status === 401 ? 502 : 400, { error: 'SmartBill: ' + msg }, origin);
  }

  return reply(200, {
    ok: true,
    serie: out.series || body.seriesName,
    numar: out.number || '',
    editUrl: out.documentUrl || '',
    viewUrl: out.documentViewUrl || '',
    total: r2(body.products.filter((p) => !p.isDiscount).reduce((s, p) => s + p.quantity * p.price, 0) - r2(input.discount)),
  }, origin);
};
