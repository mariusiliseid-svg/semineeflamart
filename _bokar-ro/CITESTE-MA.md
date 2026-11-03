# Sursa site-ului bokar.ro

Aceasta este copia completă a site-ului **bokar.ro** (identică cu versiunea live la 3 noiembrie 2026).

- Site-ul e găzduit pe Netlify, în proiectul **bokar-romania** (domeniul bokar.ro).
- Până acum era publicat prin „tragere de folder” (Netlify Drop), din folderul `Downloads\bokar-ro` de pe calculator.
- De acum, sursa oficială e acest folder `_bokar-ro` din GitHub. Orice modificare se face aici, apoi se publică.
- Folderul începe cu „_”, ca GitHub Pages (configurator.flamart.ro) să nu-l publice și pe el.

Structură: paginile sunt HTML statice (`index.html` în fiecare folder), datele produselor în `assets/data.js`,
logica (meniu, cerere de ofertă → CRM, cookie-uri, Google Analytics/Ads) în `assets/site.js`, stilul în `assets/style.css`.
