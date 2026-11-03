# Unde stă fiecare proiect (citește întâi)

Repo-ul `semineeflamart` e publicat pe GitHub Pages la **configurator.flamart.ro** (CNAME).

| Proiect | Sursa | Unde e publicat |
| --- | --- | --- |
| Site **bokar.ro** | `_bokar-ro/` (vezi `_bokar-ro/CITESTE-MA.md`) | Netlify, proiectul **bokar-romania**; până la 3.11.2026 urcat manual prin Netlify Drop din `Downloads\bokar-ro` |
| Portal BOKAR (CRM + B2B parteneri) | `bokar-portal.html` | configurator.flamart.ro/bokar-portal.html |
| Generator oferte/contracte | `oferta-contract-pasi.html` | configurator.flamart.ro |
| Server proforme SmartBill + registru documente | `netlify/functions/` | Netlify, proiectul **flamart-api** (flamart-api.netlify.app), republicat automat doar când se schimbă `netlify/` |
| Configuratoare de preț flamart.ro | `*.html` din rădăcină | configurator.flamart.ro, incluse pe site-ul Wix flamart.ro |

- Baza de date comună: Firebase, proiectul **bokar-crm** (Firestore). Reguli de acces de adăugat manual: fișierele `reguli-firestore-*.txt`.
- Folderele care încep cu `_` nu sunt publicate de GitHub Pages.
- Când modifici bokar.ro: editezi în `_bokar-ro/`, apoi publici în Netlify (bokar-romania). Nu edita doar pe calculator.
