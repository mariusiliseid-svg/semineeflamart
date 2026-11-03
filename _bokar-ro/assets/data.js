/* ============================================================
   BOKAR România — date site
   Sursa: prețurile din portal (RRP_FOCAR ÷ 1,21), restul din lista oficială 2026 (prețuri fără TVA).
   Pe site se afișează cu TVA (× TVA de mai jos).
   ============================================================ */

const CONFIG = {
  firma: 'BOKAR România',
  importator: 'Flamart',
  email: 'contact@flamart.ro',
  telefon: '0757 355 813',
  showroom: 'Str. Alecu Russo nr. 88, Bacău',
  portalUrl: 'https://configurator.flamart.ro/bokar-portal.html',
  site: 'https://bokar.ro',
  /* Firma care operează site-ul (apare în Politica de confidențialitate și în subsol). Completează înainte de publicare. */
  operator: { denumire:'', cui:'', regCom:'', sediu:'' },
  /* Google Analytics 4 și Google Ads. Lasă gol până ai ID-urile; bannerul de cookie-uri apare doar când e completat cel puțin unul. */
  ga4Id: '',          // ex. 'G-XXXXXXXXXX'
  adsId: '',          // ex. 'AW-123456789'
  adsLeadLabel: '',   // eticheta conversiei „Cerere ofertă” din Google Ads
  tva: 0.21,             // prețurile din listă sunt fără TVA; pe site apar cu TVA
  moneda: '€',
  listaDin: '2026'
};

const IMG = 'https://bokar.com.ua/image/';
const UA = (path, size) => `${IMG}cache/catalog/${path}-${size||1500}x${size||1500}.jpg`;   // poză de pe bokar.com.ua după calea din catalog   // poze suplimentare, de pe site-ul producătorului
const P = s => `/img/p-${s}.jpg`;              // poze din lista de preț

/* familie: 'drept' | 'colt' | 'soba'; ghilotina:true pentru ușa care culisează în sus
   pret: { White, Black } fără TVA; laturi: modele L/R; pretLatura: când L și R au prețuri diferite */
const MODELE = [
  { slug:'6050', nume:'BOKAR 6050', familie:'drept', kw:14.4, randament:79.3, cos:180, kg:185, aer:100, l:675, h:1170, a:504, sticla:'560 × 460 mm', lemne:500, clasa:'A',
    deschidere:'Batantă', pret:{ White:1500, Black:1680 }, img:P('6050'),
    galerie:[IMG+'cache/catalog/60х50/WHITE_1/60_50_white_0000000-1500x1500.jpg'], desen:IMG+'catalog/draw/6050_Draw_1.JPG',
    scurt:'Cel mai compact focar drept din gamă: 67,5 cm lățime și sticlă de 56 cm.' },
  { slug:'7050', nume:'BOKAR 7050', familie:'drept', kw:15.2, randament:80.6, cos:180, kg:194, aer:125, l:775, h:1170, a:504, sticla:'660 × 460 mm', lemne:600, clasa:'A',
    deschidere:'Batantă', pret:{ White:1680, Black:1860 }, img:P('7050'),
    galerie:[IMG+'cache/catalog/70x50/70x50_R_white/70х50_R_White_000-1500x1500.jpg'], desen:IMG+'catalog/draw/7050_draw.JPG',
    scurt:'Sticlă de 66 cm și lemne de până la 60 cm. Echilibrul dintre dimensiune și putere.' },
  { slug:'8050', nume:'BOKAR 8050', familie:'drept', kw:16.8, randament:81.6, cos:200, kg:214, aer:125, l:875, h:1170, a:504, sticla:'760 × 460 mm', lemne:700, clasa:'A',
    deschidere:'Batantă', pret:{ White:1694, Black:1990 }, img:P('8050'),
    galerie:[IMG+'cache/catalog/80х50/80х50_white/80х50_r_white_000-1500x1500.jpg'], desen:IMG+'catalog/draw/8050_draw_2.jpg',
    scurt:'Flacără lată de 76 cm pentru spații deschise living–bucătărie.' },
  { slug:'9050', nume:'BOKAR 9050', familie:'drept', kw:19.2, randament:82.1, cos:200, kg:234, aer:125, l:975, h:1170, a:504, sticla:'860 × 460 mm', lemne:800, clasa:'A',
    deschidere:'Batantă', pret:{ White:1958, Black:2290 }, img:P('9050'),
    galerie:[IMG+'cache/catalog/90x50/90x50_R_White/90х50_R_White_000-1500x1500.jpg'], desen:IMG+'catalog/draw/9050_draw.JPG',
    scurt:'Cel mai puternic focar drept cu ușă batantă: 19,2 kW și randament de 82,1%.' },
  { slug:'9050p', nume:'BOKAR 9050 P', sub:'tunel', familie:'drept', kw:19.2, randament:82.1, cos:200, kg:215, aer:125,
    deschidere:'Două uși batante, câte una pe fiecare parte', rame:2, pret:{ White:2890, Black:3160 }, img:P('9050p'),
    scurt:'Focar tunel: flacăra se vede din ambele camere. Două uși și două rame incluse.' },

  { slug:'655047', nume:'BOKAR 655047', familie:'colt', laturi:['L','R'], kw:14.5, randament:79.3, cos:180, kg:190, aer:125, sticla:'600 × 460 × 416 mm', lemne:500,
    deschidere:'Batantă', pret:{ White:2000, Black:2134 }, img:P('655047l'), galerie:[P('655047r')], desen:IMG+'catalog/draw/655047_Draw_L.JPG',
    scurt:'Sticlă de colț, cu flacăra vizibilă din două direcții. Varianta compactă.' },
  { slug:'755047', nume:'BOKAR 755047', familie:'colt', laturi:['L','R'], kw:15.2, randament:80.6, cos:200, kg:194, aer:125, l:786, h:1170, a:504, sticla:'698 × 460 × 416 mm', lemne:600, clasa:'A',
    deschidere:'Batantă', pret:{ White:2090, Black:2320 }, img:P('755047l'), galerie:[P('755047r')], desen:IMG+'catalog/draw/755047_draw_L.JPG',
    scurt:'Sticlă de colț de 70 cm, cu latura scurtă pe stânga (L) sau pe dreapta (R).' },
  { slug:'855047', nume:'BOKAR 855047', familie:'colt', laturi:['L','R'], kw:17.0, randament:79.6, cos:180, kg:208, aer:125, l:886, a:504, sticla:'800 × 460 × 416 mm', lemne:700, clasa:'A',
    deschidere:'Batantă', pret:{ White:2380, Black:2650 }, img:P('855047l'), galerie:[P('855047r')], desen:IMG+'catalog/draw/855047_draw_L.JPG',
    scurt:'Varianta mare de colț: 80 cm de sticlă frontală plus latura.' },

  { slug:'6050g', nume:'BOKAR 6050 G', familie:'drept', ghilotina:true, kw:14.4, randament:79.3, cos:180, kg:235, aer:100, sticla:'560 × 460 mm', lemne:500, clasa:'A',
    deschidere:'Ghilotină', pret:{ White:2500, Black:2790 }, img:P('6050g'),
    scurt:'Ușa culisează în sus și dispare în placare. Cel mai compact focar drept cu ghilotină.' },
  { slug:'7050g', nume:'BOKAR 7050 G', familie:'drept', ghilotina:true, kw:15.2, randament:80.6, cos:180, kg:250, aer:125,
    deschidere:'Ghilotină', pret:{ White:2650, Black:2850 }, img:P('7050g'),
    scurt:'Versiunea cu ghilotină a modelului 7050.' },
  { slug:'8050g', nume:'BOKAR 8050 G', familie:'drept', ghilotina:true, kw:16.8, randament:81.6, cos:200, kg:265, aer:125,
    deschidere:'Ghilotină', pret:{ White:2730, Black:3050 }, img:P('8050g'),
    scurt:'Versiunea cu ghilotină a modelului 8050.' },
  { slug:'9050g', nume:'BOKAR 9050 G', familie:'drept', ghilotina:true, kw:19.2, randament:82.1, cos:200, kg:280, aer:125, sticla:'860 × 460 mm', lemne:800, clasa:'A+',
    deschidere:'Ghilotină', pret:{ White:2820, Black:3140 }, img:P('9050g'),
    galerie:[IMG+'cache/catalog/90х50G/9050GW/90x50_g_white_fire0000-1500x1500.jpg'], desen:IMG+'catalog/90%D1%8550G/9050G_draw.png',
    scurt:'Clasa energetică A+, sticlă de 86 cm și ușă ghilotină.' },
  { slug:'10050g', nume:'BOKAR 10050 G', familie:'drept', ghilotina:true, kw:20.6, cos:250, aer:125, l:1035, h:1345, a:564, sticla:'960 × 460 mm',
    deschidere:'Ghilotină', laComanda:true, img:'https://bokar.com.ua/image/cache/catalog/10050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2010050%20G%20(20,6%20kW)%20white%20ceramtex%20(1)-596x596.png',
    galerie:['https://bokar.com.ua/image/cache/catalog/10050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2010050%20G%20(20,6%20kW)%20white%20ceramtex%20(14)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/10050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2010050%20G%20(20,6%20kW)%20white%20ceramtex%20(17)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/10050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2010050%20G%20(20,6%20kW)%20black%20ceramtex%20(1)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/10050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2010050%20G%20(20,6%20kW)%20black%20ceramtex%20(14)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/10050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2010050%20G%20(20,6%20kW)%20black%20ceramtex%20(6)-1500x1500.png'], desen:'https://bokar.com.ua/image/catalog/10050Gblack/04_10050-G.jpg',
    scurt:'Sticlă de 96 cm, 20,6 kW și ușă ghilotină. Execuție la comandă.' },
  { slug:'11050g', nume:'BOKAR 11050 G', familie:'drept', ghilotina:true, kw:21.2, cos:250, aer:125, l:1135, h:1345, a:564, sticla:'1060 × 460 mm',
    deschidere:'Ghilotină', laComanda:true, img:'https://bokar.com.ua/image/cache/catalog/11050Gwhite/Fireplace%20insert%20BOKAR%2011050%20G%20(21,2%20kW)%20white%20ceramatex%20(1)-596x596.png',
    galerie:['https://bokar.com.ua/image/cache/catalog/11050Gwhite/Fireplace%20insert%20BOKAR%2011050%20G%20(21,2%20kW)%20white%20ceramatex%20(13)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/11050Gwhite/Fireplace%20insert%20BOKAR%2011050%20G%20(21,2%20kW)%20white%20ceramatex%20(17)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/11050Gblack/Fireplace%20insert%20BOKAR%2011050%20G%20(21,2%20kW)%20white%20%20black%20ceramatex%20(1)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/11050Gblack/Fireplace%20insert%20BOKAR%2011050%20G%20(21,2%20kW)%20white%20%20black%20ceramatex%20(13)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/11050Gblack/Fireplace%20insert%20BOKAR%2011050%20G%20(21,2%20kW)%20white%20%20black%20ceramatex%20(6)-1500x1500.png'], desen:'https://bokar.com.ua/image/catalog/11050Gblack/04_11050-G.jpg',
    scurt:'Sticlă de 106 cm, 21,2 kW și ușă ghilotină. Execuție la comandă.' },
  { slug:'12050g', nume:'BOKAR 12050 G', familie:'drept', ghilotina:true, kw:22.0, cos:250, aer:125, l:1275, h:1345, a:564, sticla:'1160 × 460 mm',
    deschidere:'Ghilotină', pret:{ White:3630, Black:3970 }, img:'https://bokar.com.ua/image/cache/catalog/12050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2012050%20G%20(22,0%20kW)%20white%20ceramtex%20(1)-596x596.png',
    galerie:['https://bokar.com.ua/image/cache/catalog/12050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2012050%20G%20(22,0%20kW)%20white%20ceramtex%20(13)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/12050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2012050%20G%20(22,0%20kW)%20white%20ceramtex%20(17)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/12050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2012050%20G%20(22,0%20kW)%20black%20ceramtex%20(1)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/12050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2012050%20G%20(22,0%20kW)%20black%20ceramtex%20(14)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/12050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2012050%20G%20(22,0%20kW)%20black%20ceramtex%20(6)-1500x1500.png'], desen:'https://bokar.com.ua/image/catalog/12050Gblack/04_12050G.jpg',
    scurt:'Sticlă de 116 cm, 22 kW și ușă ghilotină care dispare în placare.' },
  { slug:'13050g', nume:'BOKAR 13050 G', familie:'drept', ghilotina:true, kw:23.1, cos:250, aer:125, l:1375, h:1345, a:564, sticla:'1260 × 460 mm',
    deschidere:'Ghilotină', laComanda:true, img:'https://bokar.com.ua/image/cache/catalog/13050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2013050%20G%20(23,1%20kW)%20white%20ceramatex%20(1)-596x596.png',
    galerie:['https://bokar.com.ua/image/cache/catalog/13050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2013050%20G%20(23,1%20kW)%20white%20ceramatex%20(17)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/13050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2013050%20G%20(23,1%20kW)%20white%20ceramatex%20(27)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/13050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2013050%20G%20(23,1%20kW)%20black%20ceramatex%20(1)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/13050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2013050%20G%20(23,1%20kW)%20black%20ceramatex%20(16)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/13050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2013050%20G%20(23,1%20kW)%20black%20ceramatex%20(6)-1500x1500.png'], desen:'https://bokar.com.ua/image/catalog/13050Gblack/04_13050G.jpg',
    scurt:'Sticlă de 126 cm, 23,1 kW și ușă ghilotină. Execuție la comandă.' },
  { slug:'14050g', nume:'BOKAR 14050 G', familie:'drept', ghilotina:true, kw:24.2, cos:250, aer:125, l:1475, h:1345, a:564, sticla:'1360 × 460 mm',
    deschidere:'Ghilotină', laComanda:true, img:'https://bokar.com.ua/image/cache/catalog/14050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2014050%20G%20(24,2%20kW)%20white%20ceramatex%20(1)-596x596.png',
    galerie:['https://bokar.com.ua/image/cache/catalog/14050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2014050%20G%20(24,2%20kW)%20white%20ceramatex%20(13)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/14050Gwhite/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2014050%20G%20(24,2%20kW)%20white%20ceramatex%20(17)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/14050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2014050%20G%20(24,2%20kW)%20black%20ceramatex%20(1)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/14050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2014050%20G%20(24,2%20kW)%20black%20ceramatex%20(13)-1500x1500.png', 'https://bokar.com.ua/image/cache/catalog/14050Gblack/%D0%9A%D0%B0%D0%BC%D1%96%D0%BD%D0%BD%D0%B0%20%D1%82%D0%BE%D0%BF%D0%BA%D0%B0%20BOKAR%2014050%20G%20(24,2%20kW)%20black%20ceramatex%20(5)-1500x1500.png'], desen:'https://bokar.com.ua/image/catalog/14050Gblack/04_14050G.jpg',
    scurt:'Sticlă de 136 cm, 24,2 kW și ușă ghilotină. Execuție la comandă.' },
  { slug:'755047g', nume:'BOKAR 755047 G', familie:'colt', ghilotina:true, laturi:['L','R'], kw:15.2, randament:80.6, cos:200, kg:220, aer:125, sticla:'698 × 460 × 416 mm', lemne:600, clasa:'A',
    deschidere:'Ghilotină', pret:{ White:3530, Black:3920 }, img:P('755047gl'), galerie:[P('755047gr')],
    scurt:'Sticlă de colț și ușă ghilotină: deschizi focarul fără să pierzi spațiu în față.' },
  { slug:'855047g', nume:'BOKAR 855047 G', familie:'colt', ghilotina:true, laturi:['L','R'], kw:17.0, randament:79.6, cos:200, kg:240, aer:125, l:990, h:1370, a:603, sticla:'798 × 460 × 416 mm', lemne:700, clasa:'A',
    deschidere:'Ghilotină', pret:{ White:3930, Black:4230 }, img:P('855047gl'), galerie:[P('855047gr')],
    scurt:'Cel mai mare focar de colț cu ghilotină din gamă.' },
  { slug:'psg60', nume:'BOKAR PSG 60', familie:'colt', ghilotina:true, kw:8.3, randament:80.6, cos:180, kg:220, aer:125,
    deschidere:'Ghilotină', pret:{ White:4110, Black:4330 }, img:P('psg60'), foto:'/img/int-psg60.jpg',
    scurt:'Sticlă pe trei laturi și ușă ghilotină. 8,3 kW, potrivit pentru case eficiente energetic și încăperi mai mici.' },

  { slug:'forum', nume:'BOKAR Forum Corner', familie:'soba', kw:9.2, randament:80.1, cos:150, kg:157, aer:100, nuante:4,
    deschidere:'Batantă', pret:{ White:2150, Black:2390 }, img:P('forum'), foto:'/img/int-soba.jpg', nuanteImg:['forum/forum black/1_forum_color_black_black_1','forum/forum black/2_forum_color_black_2','forum/forum black/3_forum_color_black_3','forum/forum black/4_forum_color_black_4'], extra:['forum/forum black/Aston_st_black_fire0000','forum/forum black/forum_color_black_black0008'],
    scurt:'Sobă cu sticlă de colț, în 4 nuanțe de carcasă.' },
  { slug:'aston-st', nume:'BOKAR Aston ST4380', familie:'soba', kw:9.0, randament:75.5, cos:150, kg:157, aer:100, nuante:5,
    deschidere:'Batantă', pret:{ White:1570, Black:1740 }, img:P('aston-st'), nuanteImg:['Aston/Aston ST/Aston ST black/color/aston_st_white_black_1','Aston/Aston ST/Aston ST black/color/aston_st_yelow_black_1','Aston/Aston ST/Aston ST black/color/aston_st_red_black_1','Aston/Aston ST/Aston ST black/color/aston_st_cara_black_1'], extra:['основні фото/ПЕЧІ/Aston_st_black_fire0030','Aston/Aston ST/Aston ST black/Aston_st_black_black_008'],
    scurt:'Sobă compactă, așezată direct pe pardoseală. 5 nuanțe de carcasă.' },
  { slug:'aston-fd', nume:'BOKAR Aston FD4380', familie:'soba', kw:9.0, randament:75.5, cos:150, kg:157, aer:100, nuante:5,
    deschidere:'Batantă', pret:{ White:1570, Black:1740 }, img:P('aston-fd'), nuanteImg:['Aston/Aston FD/Aston FD black/Aston_fd_color_white_5','Aston/Aston FD/Aston FD black/Aston_fd_color_white_6','Aston/Aston FD/Aston FD black/Aston_fd_color_white_7','Aston/Aston FD/Aston FD black/Aston_fd_color_white_8'], extra:['основні фото/ПЕЧІ/Aston_FD_black_black_fire0030','Aston/Aston FD/Aston FD black/Aston_fd_black_black_40008'],
    scurt:'Aston pe picior central, cu focul ridicat la nivelul privirii. 5 nuanțe.' },
  { slug:'aston-wd', nume:'BOKAR Aston WD4380', familie:'soba', kw:9.0, randament:75.5, cos:150, kg:157, aer:100, nuante:5,
    deschidere:'Batantă', pret:{ White:1570, Black:1740 }, img:P('aston-wd'), nuanteImg:['Aston/Aston WD/aston st Black/Aston_WD_color_black_','Aston/Aston WD/aston st Black/Aston_WD_color_black_1','Aston/Aston WD/aston st Black/Aston_WD_color_black_2','Aston/Aston WD/aston st Black/Aston_WD_color_black_3'], extra:['основні фото/ПЕЧІ/Aston_WD_black_fire0030','Aston/Aston WD/aston st Black/Aston_WD_blac_black_0008'],
    scurt:'Aston cu nișă deschisă pentru lemne sub focar. 5 nuanțe.' }
];

const FAMILII = {
  drept:{ nume:'Focare drepte', scurt:'Sticlă frontală, pentru șeminee clasice și moderne', foto:'/img/int-piatra.jpg' },
  colt:{ nume:'Focare de colț', scurt:'Flacără vizibilă din două direcții', foto:'/img/int-colt.jpg' },
  ghilotina:{ nume:'Cu ghilotină', scurt:'Ușa culisează în sus, în placare', foto:'/img/int-gri.jpg' },
  soba:{ nume:'Sobe', scurt:'De sine stătătoare, fără construcție', foto:'/img/int-soba.jpg' }
};

/* Grile de ventilație Luft Urban și firide — prețuri fără TVA, din lista oficială */
const GRILE = {
  linear:{ nume:'Luft Urban Linear', poza:'/img/p-grila-linear.jpg', desen:'/img/d-grila-linear.jpg',
    foto:{ Alb:'Вентиляційні решітки/Прямі 60/60_600_90w0000', Negru:'Вентиляційні решітки/Прямі 60/60_600_90b0000', Cream:'Вентиляційні решітки/Прямі 60/60_600_90y0000' },
    cote:'A, B: dimensiunile ramei vizibile · C × D × E: decupajul din placare (adâncime × înălțime × lungime)', nuante:['Alb','Negru','Cream'], col:['Suprafața fluxului de aer','Decupaj C × D × E'],
    rows:[['Urban 60×200',72,'130 × 40 × 180',17],['Urban 90×200',126,'130 × 70 × 180',26],['Urban 60×400',252,'130 × 40 × 380',21],['Urban 90×400',266,'130 × 70 × 380',28],
      ['Urban 60×600',232,'130 × 40 × 580',23],['Urban 90×600',406,'130 × 70 × 580',31],['Urban 60×700',272,'130 × 40 × 680',25],['Urban 90×700',476,'130 × 70 × 680',32],
      ['Urban 60×800',312,'130 × 40 × 780',27],['Urban 90×800',546,'130 × 70 × 780',33],['Urban 60×1000',392,'130 × 40 × 980',28],['Urban 90×1000',686,'130 × 70 × 980',38]] },
  colt:{ nume:'Luft Urban Colț', poza:'/img/p-grila-colt.jpg', desen:'/img/d-grila-colt.jpg',
    foto:{ Alb:'Вентиляційні решітки кутові/400_650_60w0000', Negru:'Вентиляційні решітки кутові/400_750_60b0000', Cream:'Вентиляційні решітки кутові/400_650_60bg0000' },
    cote:'A, B: laturile ramei vizibile · G × C × F × E: decupajul din placare · L sau R: latura pe care vine colțul', nuante:['Alb','Negru','Cream'], col:['Suprafața fluxului de aer','Decupaj G × C × F × E'], lr:true,
    rows:[['Urban 60×650×450',432,'130 × 40 × 640 × 440',17],['Urban 90×650×450',756,'130 × 70 × 640 × 440',26],['Urban 60×750×450',472,'130 × 40 × 740 × 440',21],['Urban 90×750×450',826,'130 × 70 × 740 × 440',28],
      ['Urban 60×850×450',512,'130 × 40 × 840 × 440',23],['Urban 90×850×450',896,'130 × 70 × 840 × 440',31],['Urban 60×600×400',392,'130 × 40 × 590 × 390',25],['Urban 90×600×400',686,'130 × 70 × 590 × 390',32],
      ['Urban 60×700×400',432,'130 × 40 × 690 × 390',27],['Urban 90×700×400',756,'130 × 70 × 690 × 390',33],['Urban 60×800×400',472,'130 × 40 × 790 × 390',28],['Urban 90×800×400',826,'130 × 70 × 790 × 390',38]] }
};
const FIRIDE_INFO = { poza:'/img/p-firide.jpg', desen:'/img/d-firida.jpg', cote:'A: lățime · B: adâncime · C: înălțime (mm)' };
const FIRIDE = [
  ['MONO 2930160','290 × 300 × 1600',300],['SPLIT 2930160','290 × 300 × 1600',290,'cu diafragmă la mijloc'],
  ['MONO 293075','290 × 300 × 750',210],['MONO 293050','290 × 300 × 500',180],['MONO 293029','290 × 300 × 290',160]
];

/* Focare BOKAR montate în România (poze trimise de Flamart) */
const MONTAJE = [
  { img:'/img/montaje/m1.jpg', model:'755047', loc:'Ilfov' },
  { img:'/img/montaje/m2.jpg', model:'755047', loc:'Iași' },
  { img:'/img/montaje/m3.jpg', model:'7050', loc:'Buzău' },
  { img:'/img/montaje/m4.jpg', model:'7050', loc:'Bârlad' },
  { img:'/img/montaje/m5.jpg', model:'755047', loc:'Neamț' }
];

/* Întrebări frecvente — pagina /intrebari-frecvente/ și date structurate FAQPage */
const FAQ = [
  ['Ce este inclus în prețul unui focar BOKAR?','Prețul de listă include focarul, rama și livrarea. Coșul de fum, placarea și montajul apar separat în oferta completă, pe care o primești după ce ne spui ce model te interesează și cum arată încăperea.'],
  ['Prețurile de pe site includ TVA?','Da. Toate prețurile afișate pe bokar.ro sunt prețuri de listă recomandate, cu TVA inclus.'],
  ['Cine face montajul?','Montajul se face în toată țara, prin partenerii BOKAR. Când trimiți o cerere de ofertă, te contactează importatorul sau un partener BOKAR din zona ta.'],
  ['Ce garanție au focarele BOKAR?','Focarele BOKAR au garanție 5 ani. Pe pagina Verifică garanția poți vedea, după seria de șasiu, modelul, data montajului și până când e valabilă garanția.'],
  ['Care e diferența dintre un focar drept, unul de colț și unul tunel?','Focarul drept are sticlă doar în față. Cel de colț are sticlă în față și pe o latură, așa că flacăra se vede din două direcții; latura poate fi pe stânga (L) sau pe dreapta (R). Focarul tunel are uși pe ambele părți și se vede din două încăperi.'],
  ['Ce înseamnă ușa ghilotină?','La modelele cu ghilotină (marcate cu G) ușa culisează vertical și dispare în placare când o deschizi, în loc să se deschidă în lateral. Nu ai nevoie de spațiu liber în fața focarului pentru ușă.'],
  ['Ce putere îmi trebuie?','Gama BOKAR acoperă de la 8,3 kW (PSG 60) la 24,2 kW (14050 G). Puterea potrivită depinde de suprafața și înălțimea încăperii, de izolația casei și de cât de des folosești focul. Spune-ne aceste detalii în cererea de ofertă și îți recomandăm modelul.'],
  ['Pot lua aerul de ardere din exterior?','Da. Focarele BOKAR au racord pentru aer din exterior, de 100 sau 125 mm în funcție de model. Diametrul exact e trecut în datele tehnice ale fiecărui model.'],
  ['Ce variante de culoare există?','Fiecare focar se găsește în variantă albă sau neagră. Sobele Aston au 5 nuanțe de carcasă, iar Forum Corner are 4. Grilele de ventilație Luft Urban vin în alb, negru și cream și se pot produce și pe dimensiuni și nuanțe personalizate.'],
  ['Unde vă găsesc?','Showroom-ul BOKAR România este în Bacău, Str. Alecu Russo nr. 88. Scrie-ne sau sună-ne înainte să vii, ca să confirmăm ce modele sunt expuse. Pentru restul țării, partenerii BOKAR te ajută cu oferta și montajul.']
];

const JUDETE = ["Alba","Arad","Argeș","Bacău","Bihor","Bistrița-Năsăud","Botoșani","Brăila","Brașov","București","Buzău","Caraș-Severin","Călărași","Cluj","Constanța","Covasna","Dâmbovița","Dolj","Galați","Giurgiu","Gorj","Harghita","Hunedoara","Ialomița","Iași","Ilfov","Maramureș","Mehedinți","Mureș","Neamț","Olt","Prahova","Satu Mare","Sălaj","Sibiu","Suceava","Teleorman","Timiș","Tulcea","Vaslui","Vâlcea","Vrancea"];

/* modelul cu care ajunge lead-ul în CRM (portal) */
const MODEL_CRM = { '6050':'6050','7050':'7050','8050':'8050','9050':'9050','9050p':'9050 P','6050g':'6050G','7050g':'7050G','8050g':'8050G','9050g':'9050G','12050g':'12050G','14050g':'14050G','13050g':'13050G','11050g':'11050G','10050g':'10050G',
  '655047':'655047 L/R','755047':'755047 L/R','855047':'855047 L/R','755047g':'755047 L/R G','855047g':'855047 L/R G','psg60':'PSG 60',
  'forum':'Forum (Sobă sticlă colț)','aston-st':'4380 (Sobă)','aston-fd':'4380 (Sobă)','aston-wd':'4380 (Sobă)' };

if(typeof module!=='undefined') module.exports = { CONFIG, MODELE, FAMILII, GRILE, FIRIDE, FIRIDE_INFO, MONTAJE, FAQ, JUDETE, MODEL_CRM, UA, IMG };
