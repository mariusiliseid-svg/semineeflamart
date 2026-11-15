"""Construiește datele pentru cos-inox.html din Excelurile de prețuri.
Rulare: python3 _date-cos-inox/build.py  -> scrie _date-cos-inox/systems.json
"""
import json, re, sys, collections, openpyxl
KAMIN = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/attachments/2db60e2a-47e1-5058-bff7-4de9064223fc/fff77da1-Sistem_KaminInox_DP-3variante_COS_FUM_05-12.xlsx'
SCHIEDEL = sys.argv[2] if len(sys.argv) > 2 else '/mnt/attach/outputs/Schiedel_propunere_2026.xlsx'

def group(n):
    l = n.lower()
    if 'tubulatur' in l or 'segment' in l: return 'elemente'
    if l.startswith('cot') or 'deviație' in l: return 'devieri'
    if 'racord' in l or 'reducție' in l: return 'racord'
    if 'terminal' in l or 'pălărie' in l or 'antiintemperie' in l or 'terasă' in l or l.startswith('con '): return 'terminal'
    if any(k in l for k in ['bază', 'placă', 'consolă', 'colector', 'ușiță', 'ușă', 'sd 200', 'capac']): return 'pornire'
    if 'colier' in l or 'garnitur' in l: return 'prinderi'
    return 'alte'

# ---------- KaminInox DP ----------
wb = openpyxl.load_workbook(KAMIN, data_only=True)
P = wb['LISTA PRETURI  per componente']; C = wb['COD ARTICOL']
DIAS = [80,100,120,130,150,160,180,200,230,250,300,350,400,450,500]
KMAP = [('Palarie Anti-Ploaie','palPloaie','Pălărie anti-ploaie'),('Palarie Anti-Vant','palVant','Pălărie anti-vânt'),
 ('Con terminal','con','Con terminal coș de fum inox DP'),('Segment cos de fum DP - 1.0m','seg1','Segment coș de fum DP 1,0 m'),
 ('Segment cos de fum DP - 0.5m','seg05','Segment coș de fum DP 0,5 m'),('Element Racord de fum 90','rac90','Element racord de fum 90° DP'),
 ('Element Racord de fum 45','rac45','Element racord de fum 45° DP'),('Element usa curatare','usa','Element ușă de curățare rotundă DP'),
 ('Baza condens nivel 0','baza0','Bază condens nivel 0 DP'),('Baza condens consola','bazaC','Bază condens consolă DP'),
 ('Colier intermediar segment','colInt','Colier intermediar segment DP'),('Colier intermediar ancorare','colAnc','Colier intermediar ancorare statică DP'),
 ('Colier - suport prindere perete  DP FIX','colFix','Colier suport prindere perete DP fix'),('Colier - suport prindere perete  DP REGLABIL','colReg','Colier suport prindere perete DP reglabil'),
 ('Placa de descarcare','placa','Placă de descărcare consolă'),('Deviatie - Cot 45','cot45','Deviație – cot 45° DP'),('Deviatie - Cot 90','cot90','Deviație – cot 90° DP'),
 ('REDUCTIE','reductie','Reducție DP'),('Colier 3 PCT','col3p','Colier 3 puncte – suport prindere perete'),('Capac scurgere condens','capac','Capac scurgere condens inox DP'),
 ('PALARIE CONICA','palCon','Pălărie conică din inox DP')]
def km(name):
    for p, i, n in KMAP:
        if name and name.startswith(p): return i, n
codes = {}
for r in C.iter_rows(values_only=True):
    k = km(r[0])
    if k: codes[k[0]] = r[2:17]
kitems = []
for r in P.iter_rows(values_only=True):
    k = km(r[0])
    if not k: continue
    it = {'id': k[0], 'n': k[1], 'g': group(k[1]), 'p': {}, 'c': {}}
    for i, d in enumerate(DIAS):
        x = r[2+i]
        if isinstance(x, (int, float)):
            it['p'][d] = round(x, 2); it['c'][d] = codes.get(k[0], [None]*15)[i] or ''
    kitems.append(it)
kamin = {'id': 'kamininox', 'name': 'KaminInox DP (dublu perete)', 'brand': 'KaminInox', 'upd': '12.01.2026', 'items': kitems,
 'kit': {'segs': [['seg1', 950], ['seg05', 450, 1]],
         'porniri': {'baza0': {'items': ['baza0', 'usa'], 'fixed': 1250}, 'consola': {'items': ['placa', 'bazaC'], 'fixed': 900},
                     'practic': {'items': ['placa', 'capac'], 'fixed': 700}},
         'rac': {'rac90': 'rac90', 'rac45': 'rac45'}, 'cot': {'45': 'cot45', '90': 'cot90'},
         'terms': [{'v': 'con', 'b': 'Con terminal', 's': 'Varianta standard', 'items': ['con']},
                   {'v': 'palCon', 'b': 'Pălărie conică inox', 'items': ['palCon']}],
         'hats': [{'v': '', 'b': 'Fără pălărie'}, {'v': 'palPloaie', 'b': 'Pălărie anti-ploaie'}, {'v': 'palVant', 'b': 'Pălărie anti-vânt'}],
         'wall': {'id': 'colReg', 'rule': 'per2m'},
         'joint': {'id': 'colInt', 'count': ['con', 'palCon', 'seg1', 'seg05', 'rac90', 'rac45', 'usa', 'baza0', 'bazaC', 'cot45', 'cot90']}}}

# ---------- Schiedel ----------
wb = openpyxl.load_workbook(SCHIEDEL, data_only=True)
rows = list(wb['Piese'].iter_rows(min_row=2, values_only=True))
def parse(opt):
    opt = str(opt).strip()
    if '/' in opt:
        a, b = opt.rsplit('/', 1); return a.strip(), [int(x) for x in re.findall(r'\d+', b)][:1]
    m = re.match(r'^(\d+)(?:-(\d+))?\s*(.*)$', opt)
    if m: return m.group(3).strip(), [int(m.group(1))] + ([int(m.group(2))] if m.group(2) else [])
    return ('' if opt == '–' else opt), None
raw = collections.defaultdict(collections.OrderedDict)
for r in rows:
    cat = r[2]
    sub, ds = parse(r[3])
    name = r[0] + (' ' + sub if sub else '')
    name = name.replace(' Schiedel', '').replace(' 90G', ' 90°').replace(' 45G', ' 45°').replace('coș de fum', 'de fum')
    e = raw[cat].setdefault(name, {'n': name, 'g': group(name), 'p': {}, 'c': {}, 'all': ds is None})
    for d in (ds or [0]):
        e['p'][d] = round(r[8], 2); e['c'][d] = r[4]
def mk(cat, extra=()):
    items = []
    src = list(raw[cat].values()) + [e for c, names in extra for n, e in raw[c].items() if n in names]
    for i, e in enumerate(src):
        e = dict(e); e['id'] = 's%d' % i
        if e.pop('all'):
            v = list(e['p'].values())[0]; c = list(e['c'].values())[0]; e['p'] = {'*': v}; e['c'] = {'*': c}
        items.append(e)
    return items
def find(items, starts):
    for it in items:
        if it['n'] == starts: return it['id']
    for it in items:
        if it['n'].startswith(starts): return it['id']
    raise SystemExit('lipsește: ' + starts)
def schiedel(sid, name, cat, pre, extra, upd='28.05.2026'):
    items = mk(cat, extra)
    f = lambda s: find(items, s)
    return items, f
systems = [kamin]

# ICS 25
items, f = schiedel('ics25', '', 'Schiedel ICS 25 – piese', 'ICS 25', [('Schiedel ICS ECO – piese', ['Element cu ușiță de curățare ICS ECO'])])
DOOR = f('Element cu ușiță de curățare depresiune')
ICSSW = {'250': [[DOOR, f('Ușiță de vizitare suprapresiune')]], '300': [[DOOR, f('Element cu ușiță de curățare ICS ECO')]]}
systems.append({'id': 'ics25', 'name': 'Schiedel ICS 25 (dublu perete)', 'brand': 'Schiedel', 'upd': '28.05.2026', 'items': items,
 'kit': {'segs': [[f('Element de tubulatură 1000'), 1000], [f('Element de tubulatură 500'), 500, 1], [f('Element de tubulatură 250'), 250, 1]],
   'porniri': {'baza0': {'items': [f('Element de bază + colector'), DOOR], 'fixed': 1000, 'fixedBy': {'250': 750, '300': 750}, 'swap': ICSSW},
               'consola': {'items': [f('Placă de descărcare + colector'), f('Consolă de descărcare'), DOOR], 'fixed': 1000, 'fixedBy': {'250': 750, '300': 750}, 'swap': ICSSW}},
   'rac': {'rac90': f('Racord de fum 90° ICS 25'), 'rac45': f('Racord de fum 45° ICS 25')},
   'cot': {'45': f('Cot ICS 25 45°'), '90': f('Cot ICS 25 90°')},
   'terms': [{'v': 'con', 'b': 'Element terminal conic', 's': 'Varianta standard', 'items': [f('Element terminal conic')]},
             {'v': 'plasa', 'b': 'Terminal antipluvial cu plasă', 'items': [f('Terminal antipluvial cu plasă')]}],
   'wall': {'id': f('Colier de fixare ICS 25'), 'rule': 'schiedel'}}})
# ICS ECO (folosește baza, consola și colierele din gama ICS 25)
ICS = 'Schiedel ICS 25 – piese'
extraNames = ['Element de bază + colector de condens ICS 25', 'Placă de descărcare + colector de condens ICS 25', 'Consolă de descărcare ICS 25',
              'Set suport descărcare SD 200', 'Colector de condens ICS 25', 'Colier de fixare ICS 25', 'Colier de fixare reglabil 75-300 mm ICS 25',
              'Colier de ancorare ICS 25', 'Colier de îmbinare statică ICS 25', 'Terminal antipluvial cu plasă ICS 25', 'Colier antiintemperie ICS 25 (PPL)',
              'Element de etanșare pentru terasă ICS 25']
items, f = schiedel('icseco', '', 'Schiedel ICS ECO – piese', '', [(ICS, extraNames)])
systems.append({'id': 'icseco', 'name': 'Schiedel ICS ECO (dublu perete)', 'brand': 'Schiedel', 'upd': '28.05.2026', 'items': items,
 'kit': {'segs': [[f('Element de tubulatură ICS ECO 1000'), 1000], [f('Element de tubulatură ICS ECO 500'), 500, 1], [f('Element de tubulatură ICS ECO 250'), 250, 1]],
   'porniri': {'baza0': {'items': [f('Element de bază + colector'), f('Element cu ușiță de curățare ICS ECO')], 'fixed': 750},
               'consola': {'items': [f('Placă de descărcare + colector'), f('Consolă de descărcare'), f('Element cu ușiță de curățare ICS ECO')], 'fixed': 750,
                           'swap': {'200': [[f('Consolă de descărcare'), f('Set suport descărcare SD 200')]]}}},
   'rac': {'rac90': f('Racord de fum ICS ECO 90°'), 'rac45': f('Racord de fum ICS ECO 45°')},
   'cot': {'45': f('Cot ICS ECO 45°'), '90': f('Cot ICS ECO 90°')},
   'terms': [{'v': 'con', 'b': 'Element terminal conic', 's': 'Varianta standard', 'items': [f('Element terminal conic ICS ECO')]},
             {'v': 'plasa', 'b': 'Terminal antipluvial cu plasă', 'items': [f('Terminal antipluvial cu plasă')]}],
   'wall': {'id': f('Colier de fixare ICS 25'), 'rule': 'schiedel'}}})
# Permeter 25 negru
items, f = schiedel('permeter', '', 'Schiedel Permeter 25 – piese', '', ())
systems.append({'id': 'permeter', 'name': 'Schiedel Permeter 25 negru', 'brand': 'Schiedel', 'upd': '28.05.2026', 'items': items,
 'kit': {'segs': [[f('Element de tubulatură Permeter 25 negru 1000'), 1000], [f('Element de tubulatură Permeter 25 negru 500'), 500, 1], [f('Element de tubulatură Permeter 25 negru 250'), 250, 1]],
   'porniri': {'baza0': {'items': [f('Element de bază cu colector'), f('Element cu ușiță')], 'fixed': 1000},
               'consola': {'items': [f('Placă de descărcare'), f('Consolă de descărcare'), f('Colector de condens'), f('Element cu ușiță')], 'fixed': 1000, 'wallDelta': -1, 'swap': {'150': [[f('Consolă de descărcare'), None]]}}},
   'rac': {'rac90': f('Racord de fum Permeter 25 negru 90°'), 'rac45': f('Racord de fum Permeter 25 negru 45°')},
   'cot': {'45': f('Cot Permeter 25 negru 45°'), '90': f('Cot Permeter 25 negru 90°')},
   'terms': [{'v': 'con', 'b': 'Element terminal conic', 's': 'Varianta standard', 'items': [f('Element terminal conic')]},
             {'v': 'plasa', 'b': 'Terminal antipluvial cu plasă', 'items': [f('Terminal antipluvial cu plasă')]}],
   'wall': {'id': f('Colier de fixare'), 'rule': 'schiedel'}}})
# diametre: cele la care există segmentul de 1 m
for s in systems:
    seg = next(i for i in s['items'] if i['id'] == s['kit']['segs'][0][0])
    s['dias'] = sorted(int(d) for d in seg['p'] if d != '*')
    if s['id'] != 'kamininox': s['dias'] = [d for d in s['dias'] if d <= 300]
json.dump(systems, open(__file__.rsplit('/', 1)[0] + '/systems.json', 'w'), ensure_ascii=False, separators=(',', ':'))
for s in systems: print(s['id'], len(s['items']), s['dias'])
# ---------- pagina ----------
base = __file__.rsplit('/', 1)[0]
tpl = open(base + '/template.html').read()
open(base + '/../cos-inox.html', 'w').write(tpl.replace('__DATA__', json.dumps(systems, ensure_ascii=False, separators=(',', ':'))))
print('cos-inox.html scris')
