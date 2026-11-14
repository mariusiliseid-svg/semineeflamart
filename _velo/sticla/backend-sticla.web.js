// Wix Velo – fișier backend: backend/sticla.web.js
// Adaugă în coșul clientului o sticlă termorezistentă tăiată la dimensiune.
// Prețul se calculează AICI, pe server, din dimensiuni (clientul nu poate trimite alt preț).
// Necesită pachetele npm @wix/ecom și @wix/essentials (Packages & Apps > npm).

import { Permissions, webMethod } from 'wix-web-module';
import { cartV2 } from '@wix/ecom';
import { auth } from '@wix/essentials';

const PRET_MP = 1499;        // lei/m², TVA inclus
const MIN_MM = 100;
const MAX_MM = 1000;
const MAX_BUC = 50;
const KG_PE_MP = 10;         // sticlă 4 mm ≈ 10 kg/m² (pentru calculul transportului)

const adaugaElevat = auth.elevate(cartV2.addLineItems);

export const adaugaSticla = webMethod(Permissions.Anyone, async (cartId, h, w, qty) => {
  h = Math.round(Number(h));
  w = Math.round(Number(w));
  qty = Math.round(Number(qty));
  if (!cartId || typeof cartId !== 'string') throw new Error('Coș invalid');
  if (!(h >= MIN_MM && h <= MAX_MM && w >= MIN_MM && w <= MAX_MM)) throw new Error('Dimensiuni în afara limitelor 100–1000 mm');
  if (!(qty >= 1 && qty <= MAX_BUC)) throw new Error('Cantitate invalidă');

  const mp = (h * w) / 1e6;
  const pret = Math.round(mp * PRET_MP);

  await adaugaElevat(cartId, {
    customItems: [
      {
        name: { original: `Sticlă termorezistentă 4 mm – ${h} × ${w} mm` },
        quantityInfo: { requestedQuantity: qty },
        pricing: { price: { amount: String(pret) } },
        attributes: {
          itemType: { preset: 'PHYSICAL' },
          descriptionLines: [
            { name: { original: 'Dimensiuni' }, plainText: { original: `Înălțime ${h} mm × Lățime ${w} mm` } },
            { name: { original: 'Suprafață' }, plainText: { original: `${mp.toFixed(3).replace('.', ',')} m²` } }
          ],
          physicalProperties: { weight: Math.round(mp * KG_PE_MP * 100) / 100, shippable: true }
        }
      }
    ]
  });

  return { h, w, qty, pret };
});
