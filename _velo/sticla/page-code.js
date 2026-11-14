// Wix Velo – codul paginii „Sticlă termorezistentă”.
// Pe pagină: un element „Embed HTML” (iframe) cu ID-ul #html1, setat pe adresa
// https://configurator.flamart.ro/sticla-termorezistenta.html

import { currentCartV2 } from '@wix/ecom';
import wixEcomFrontend from 'wix-ecom-frontend';
import { adaugaSticla } from 'backend/sticla.web';

async function idCos() {
  try {
    const r = await currentCartV2.getCurrentCart();
    const c = (r && r.cart) || r;
    if (c && c._id) return c._id;
  } catch (e) { /* clientul nu are încă un coș */ }
  const r = await currentCartV2.createCurrentCart({});
  const c = (r && r.cart) || r;
  return c._id;
}

$w.onReady(function () {
  const frame = $w('#html1');
  frame.onMessage(async (event) => {
    const m = event.data;
    if (!m || m.type !== 'flamart-sticla-add') return;
    try {
      const cartId = await idCos();
      const rez = await adaugaSticla(cartId, m.h, m.w, m.qty);
      try { await wixEcomFrontend.refreshCart(); } catch (e) {}
      frame.postMessage({ type: 'flamart-sticla-ok', ...rez });
      try { wixEcomFrontend.openSideCart(); } catch (e) {}
    } catch (err) {
      console.error('Sticla – adăugare în coș eșuată', err);
      frame.postMessage({ type: 'flamart-sticla-err', message: 'Nu am putut adăuga în coș. Încearcă din nou sau sună-ne.' });
    }
  });
});
