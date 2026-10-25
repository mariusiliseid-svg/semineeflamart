// Server: flamart-api.netlify.app
// Registrul de oferte/contracte, comun pentru toate dispozitivele (telefon, calculator).
// Datele stau în Netlify Blobs, iar accesul cere parola aplicației (variabila APP_PASSWORD).
//
//   GET    ?            → indexul: { id: { upd, draft, deleted? } }
//   GET    ?id=X        → documentul complet { id, upd, draft, data }
//   PUT    {id,upd,draft,data} → salvează (câștigă versiunea cu upd mai nou)
//   DELETE ?id=X&upd=N  → șterge (rămâne o notă de ștergere în index, ca să dispară și de pe celelalte dispozitive)

import { getStore } from '@netlify/blobs';

const INDEX = '_index';
const ALLOWED_ORIGINS = ['https://configurator.flamart.ro', 'http://localhost:8080', 'http://127.0.0.1:8080'];

function cors(origin) {
  const ok = ALLOWED_ORIGINS.includes(origin) || /\.netlify\.app$/.test(origin || '');
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Key',
    'Vary': 'Origin',
  };
}
const reply = (status, body, origin) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(origin) },
});
const validId = (id) => typeof id === 'string' && /^[a-z0-9]{4,40}$/i.test(id);

export async function handle(req, store, password) {
  const origin = req.headers.get('origin') || '';
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (!password) return reply(500, { error: 'Lipsește APP_PASSWORD pe server.' }, origin);
  if ((req.headers.get('x-app-key') || '') !== password) return reply(401, { error: 'Parola aplicației nu e corectă.', auth: false }, origin);

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const index = (await store.get(INDEX, { type: 'json', consistency: 'strong' })) || {};

  if (req.method === 'GET') {
    if (!id) return reply(200, { index }, origin);
    if (!validId(id)) return reply(400, { error: 'ID invalid.' }, origin);
    const rec = await store.get(id, { type: 'json', consistency: 'strong' });
    return rec ? reply(200, rec, origin) : reply(404, { error: 'Nu există.' }, origin);
  }

  if (req.method === 'PUT') {
    let rec;
    try { rec = await req.json(); } catch { return reply(400, { error: 'Date invalide.' }, origin); }
    if (!rec || !validId(rec.id) || !rec.data || typeof rec.upd !== 'number') return reply(400, { error: 'Date invalide.' }, origin);
    const cur = index[rec.id];
    if (cur && cur.upd > rec.upd) return reply(409, { error: 'Există o versiune mai nouă.', upd: cur.upd, deleted: !!cur.deleted }, origin);
    await store.setJSON(rec.id, { id: rec.id, upd: rec.upd, draft: !!rec.draft, data: rec.data });
    index[rec.id] = { upd: rec.upd, draft: !!rec.draft };
    await store.setJSON(INDEX, index);
    return reply(200, { ok: true }, origin);
  }

  if (req.method === 'DELETE') {
    if (!validId(id)) return reply(400, { error: 'ID invalid.' }, origin);
    const upd = Number(url.searchParams.get('upd')) || Date.now();
    await store.delete(id);
    index[id] = { upd, deleted: true };
    await store.setJSON(INDEX, index);
    return reply(200, { ok: true }, origin);
  }

  return reply(405, { error: 'Metodă nepermisă.' }, origin);
}

export default async (req) => handle(req, getStore('documente'), process.env.APP_PASSWORD);
