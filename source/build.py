#!/usr/bin/env python3
"""Builds the portfolio as one self-contained index.html (CSS + JS inlined), bilingual EN/PT."""
import json, html, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = sys.argv[1]
OUT = sys.argv[2]
C = json.load(open(os.path.join(WORK, 'content.json')))
EN, PT = C['en'], C['pt']
def _src(n):
    p = os.path.join(HERE, 'src', n)
    return p if os.path.exists(p) else os.path.join(HERE, n)
css = open(_src('styles.css')).read()
main_js = open(_src('main.js')).read()
motion_js = open(os.path.join(WORK, 'motion.js')).read()
fx_js = open(_src('fx.js')).read()
sys.path.insert(0, HERE)
from ill import TOKENS, SECTION, BUG, ROBOT_CURSOR, BADGE_FACE

e = lambda s: html.escape(str(s), quote=True)

# Company logos: drop the files into ./logos (any of png, jpg, webp, svg; the file name must
# contain cardif/bnp, bayer or accenture). They are inlined as data URIs. No file, no logo.
import base64, mimetypes, struct
LOGO_KEYS = {'cardif': ('cardif', 'bnp'), 'bayer': ('bayer',), 'accenture': ('accenture',)}
LOGOS = {}
_ld = os.path.join(HERE, 'logos')
if os.path.isdir(_ld):
    for fn in sorted(os.listdir(_ld)):
        mime = mimetypes.guess_type(fn)[0] or ''
        if not mime.startswith('image/'): continue
        for cid, keys in LOGO_KEYS.items():
            if cid not in LOGOS and any(k in fn.lower() for k in keys):
                raw = open(os.path.join(_ld, fn), 'rb').read()
                ar = 2.8
                if raw[:8] == b'\x89PNG\r\n\x1a\n':
                    w, h = struct.unpack('>II', raw[16:24]); ar = w / h
                LOGOS[cid] = (f'data:{mime};base64,' + base64.b64encode(raw).decode(), ar)
# each logo is inlined once, as a CSS background, and reused by the tab and the panel;
# --k evens out the visual weight of wide and tall logos
css += ''.join(f'\n.lg-{cid} {{ background-image: url({uri}); }}' for cid, (uri, ar) in LOGOS.items())
def logo(cid, name, cls='co-logo', label=True, name_pt=None):
    if cid not in LOGOS: return ''
    ar = LOGOS[cid][1]
    a11y = f'role="img" data-label-en="{e(name)} logo" data-label-pt="Logo da {e(name_pt or name)}" aria-label="{e(name)} logo"' if label else 'aria-hidden="true"'
    return f'<span class="{cls}" {a11y}><i class="lg lg-{cid}" style="--ar:{ar:.3f};--k:{(2.8 / ar) ** 0.5:.3f}"></i></span>'

def t(en, pt, tag='span', cls=''):
    """Both languages in the DOM; CSS shows the active one."""
    c1 = ('l-en ' + cls).strip(); c2 = ('l-pt ' + cls).strip()
    if en == pt:
        return f'<{tag}{" class=%s" % chr(34)+cls+chr(34) if cls else ""}>{e(en)}</{tag}>'
    return f'<{tag} class="{c1}">{e(en)}</{tag}><{tag} class="{c2}" lang="pt-BR">{e(pt)}</{tag}>'

def T(en, pt):  # inline span pair
    return t(en, pt)

ARROW = '<span class="arr" aria-hidden="true">↗</span>'

def chips(items_en, items_pt=None, cls_fn=lambda c: ''):
    items_pt = items_pt or items_en
    out = []
    for a, b in zip(items_en, items_pt):
        out.append(f'<li class="chip {cls_fn(a)}">{T(a, b)}</li>')
    return '<ul class="chips">' + ''.join(out) + '</ul>'

PRIMARY = {'Playwright', 'JavaScript', 'GitLab CI/CD', 'Claude Code', 'Playwright MCP', 'Custom MCP server', 'Custom MCP server development', 'Model Context Protocol'}
AIWORDS = ('MCP', 'AI', 'LLM', 'Claude', 'Copilot', 'Grok', 'agent', 'Agentic', 'Human-in-the-loop', 'IA')
def chip_cls(c):
    if c in PRIMARY: return 'chip--primary'
    if any(w in c for w in AIWORDS): return 'chip--ai'
    return ''

def section_head(num, en_label, pt_label, title_html, intro_html='', hid=''):
    return f'''<div class="section-head">
  <p class="eyebrow"><b>{num}</b> — {T(en_label, pt_label)}</p>
  <h2 id="{hid}">{title_html}</h2>
  {f'<p class="intro">{intro_html}</p>' if intro_html else ''}
</div>'''

def L(a, b):  # list -> sentence-ish comma list in both languages
    return T(', '.join(a), ', '.join(b))

ILL_FOR = {'work-t': 'work', 'ai-t': 'ai', 'about-t': 'about', 'sk-t': 'skills', 'pr-t': 'projects', 'le-t': 'learning'}
def head2(hid, en, pt, intro_en='', intro_pt=''):
    intro = f'<p class="sec-intro">{T(intro_en, intro_pt)}</p>' if intro_en else ''
    ill = f'<div class="sec-ill">{SECTION[ILL_FOR[hid]]}</div>' if hid in ILL_FOR else ''
    return f'<div class="sec-head"><div><h2 class="sec-title" id="{hid}">{T(en, pt)}</h2>{intro}</div>{ill}</div>'

BUG_TOTAL = 5
def bug(n, style):
    return (f'<button type="button" class="bug" style="{style}" data-label-en="Hidden bug {n} of {BUG_TOTAL}. Catch it." '
            f'data-label-pt="Bug escondido {n} de {BUG_TOTAL}. Capture." aria-label="Hidden bug {n} of {BUG_TOTAL}. Catch it.">{BUG}</button>')

# The hero statement: three lines of keywords per featured company. ('ILL', name) is an
# illustration between parentheses; the second item of a word tuple is its colour class.
KIN = [
    ('cardif', 'Cardif', ('2025 – now', '2025 – hoje'), ('Staff QA Engineer', 'Staff QA Engineer'), {
        'en': [[('AI agents', 'c1'), ('ILL', 'robot'), ('write', '')], [('the tests.', '')], [('humans', 'c2'), ('ILL', 'stamp'), ('approve.', 'c3')]],
        'pt': [[('agentes de IA', 'c1'), ('ILL', 'robot'), ('escrevem', '')], [('os testes.', '')], [('humanos', 'c2'), ('ILL', 'stamp'), ('aprovam.', 'c3')]]}),
    ('bayer', 'Bayer', ('2022 – 2025', '2022 – 2025'), ('Quality Engineer', 'Quality Engineer'), {
        'en': [[('agtech', 'c3'), ('ILL', 'sprout'), ('tested', '')], [('on web and mobile,', '')], [('taken', 'c1'), ('ILL', 'phone'), ('to production.', 'c2')]],
        'pt': [[('agtech', 'c3'), ('ILL', 'sprout'), ('testado', '')], [('na web e no mobile,', '')], [('levado', 'c1'), ('ILL', 'phone'), ('à produção.', 'c2')]]}),
    ('accenture', 'Accenture', ('2014 – 2021', '2014 – 2021'), ('QA Analyst', 'Analista de QA'), {
        'en': [[('intern', 'c2'), ('ILL', 'ladder'), ('to analyst.', '')], [('SAP on Tosca,', 'c1')], [('mobile', 'c3'), ('ILL', 'gear'), ('on Appium.', '')]],
        'pt': [[('estagiário', 'c2'), ('ILL', 'ladder'), ('a analista.', '')], [('SAP com Tosca,', 'c1')], [('mobile', 'c3'), ('ILL', 'gear'), ('com Appium.', '')]]}),
]
def kin_lines(lines, lang):
    out, i = '', 0
    for line in lines:
        toks = ''
        for txt, kind in line:
            if txt == 'ILL':
                toks += (f'<span class="pg"><span class="w"><span class="wi paren" style="--i:{i}">(</span></span>'
                         f'<span class="ill" style="--i:{i + 1}">{TOKENS[kind]}</span>'
                         f'<span class="w"><span class="wi paren" style="--i:{i + 2}">)</span></span></span>')
                i += 3
            else:
                for word in txt.split(' '):
                    toks += f'<span class="w"><span class="wi {kind}" style="--i:{i}">{e(word)}</span></span>'
                    i += 1
        cls = 'l-en' if lang == 'en' else 'l-pt'
        attr = '' if lang == 'en' else ' lang="pt-BR"'
        out += f'<span class="k-line {cls}"{attr}>{toks}</span>'
    return out
k_sets = ''.join(f'<div class="k-set" data-co="{cid}"{"" if n == 0 else " aria-hidden=%strue%s" % (chr(34), chr(34))}>{kin_lines(d["en"], "en")}{kin_lines(d["pt"], "pt")}</div>' for n, (cid, nm, yr, role, d) in enumerate(KIN))
k_dots = ''.join(f'<button type="button" class="k-dot" data-co="{cid}" aria-pressed="{"true" if n == 0 else "false"}"><span>{nm}</span><i class="bar" aria-hidden="true"></i></button>' for n, (cid, nm, yr, role, d) in enumerate(KIN))
b_faces = ''.join(f'<span class="b-face" data-co="{cid}"><span class="b-co">{nm}</span><span class="b-yr">{T(*yr)}</span><span class="b-role">{T(*role)}</span></span>' for cid, nm, yr, role, d in KIN)
PAUSE = '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg><svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>'

parts = []
NAV = [('work', 'experience'), ('ai', 'ai_focus'), ('about', 'about'), ('skills', 'skills'), ('projects', 'projects'), ('contact', 'contact')]
nav_links = ''.join(f'<li><a href="#{a}">{T(EN["nav"][k], PT["nav"][k])}</a></li>' for a, k in NAV)
mob_links = ''.join(f'<a href="#{a}">{T(EN["nav"][k], PT["nav"][k])}</a>' for a, k in NAV)
SUN = '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
MOON = '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>'

parts.append(f'''<a class="skip" href="#main">{T("Skip to content", "Pular para o conteúdo")}</a>
<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="#top">Denner Santana</a>
    <nav data-label-en="Primary" data-label-pt="Principal" aria-label="Primary"><ul class="nav-links">{nav_links}</ul></nav>
    <div class="tools">
      <div class="lang" role="group" data-label-en="Language" data-label-pt="Idioma" aria-label="Language"><button type="button" data-set-lang="en" aria-pressed="true">EN</button><button type="button" data-set-lang="pt" aria-pressed="false">PT</button></div>
      <button type="button" class="icon-btn theme-toggle" data-label-en="Switch light or dark theme" data-label-pt="Alternar tema claro ou escuro" aria-label="Switch light or dark theme">{SUN}{MOON}</button>
      <button type="button" class="icon-btn menu-btn" aria-controls="mobile-menu" aria-expanded="false" data-label-en="Open menu" data-label-pt="Abrir menu" aria-label="Open menu">{MENU}</button>
    </div>
  </div>
</header>
<nav id="mobile-menu" class="mobile-menu" hidden data-label-en="Mobile menu" data-label-pt="Menu móvel" aria-label="Mobile menu">{mob_links}</nav>
<main id="main">''')

# ---------- hero ----------
h_en, h_pt = EN['hero'], PT['hero']
parts.append(f'''<section class="hero" id="top" aria-labelledby="hero-name">
  <div class="wrap hero-in">
    <div class="hero-top">
    <div class="hero-id">
      <h1 class="hero-name" id="hero-name">Denner Santana</h1>
      <p class="hero-role">{T("Staff QA Engineer and SDET, São Paulo", "Staff QA Engineer e SDET, São Paulo")}</p>
    </div>
    <button type="button" class="badge" id="badge" data-co="cardif" data-label-en="Company badge. Switch to the next company." data-label-pt="Crachá da empresa. Trocar para a próxima empresa." aria-label="Company badge. Switch to the next company.">
      <span class="badge-in"><span class="strap"></span><span class="clip"></span><span class="card">{BADGE_FACE}{b_faces}</span></span>
    </button>
    </div>
    <div class="kinetic" id="kinetic" data-co="cardif">{k_sets}</div>
    <div class="k-nav" role="group" data-label-en="Featured companies" data-label-pt="Empresas em destaque" aria-label="Featured companies">
      {k_dots}
      <button type="button" class="k-pause" aria-pressed="false" data-label-en="Pause the rotation" data-label-pt="Pausar a rotação" aria-label="Pause the rotation">{PAUSE}</button>
      <a class="k-open ext" href="#cardif" data-tab-target="cardif">{T("Open this chapter", "Abrir este capítulo")}</a>
    </div>
    <div class="hero-row">
      <div>
        <p class="hero-lead">{T(h_en["subheadline"], h_pt["subheadline"])}</p>
      </div>
      <div class="hero-side">
        <p class="avail"><span class="pip" aria-hidden="true"></span>{T("Open to remote roles in US time zones", "Aberto a vagas remotas em fusos dos EUA")}</p>
        <div class="ctas">
          <a class="btn btn--blue" href="#work">{T("See my work", "Ver meu trabalho")}</a>
          <a class="btn" href="#contact">{T(h_en["cta_secondary"]["label"], h_pt["cta_secondary"]["label"])}</a>
        </div>
        <p class="hunt">{T("QA habit: I hid 5 bugs on this page. Catch them all.", "Mania de QA: escondi 5 bugs nesta página. Capture todos.")} <span class="bug-count" aria-live="polite">0/5</span></p>
      </div>
    </div>
    {bug(1, "left:44%;bottom:-46px")}
  </div>
</section>''')

# ---------- work (featured tabs) ----------
YEARS = {'cardif': ('2025', True), 'bayer': ('2022 – 2025', False), 'accenture': ('2014 – 2021', False)}
SHORT = {'cardif': 'Cardif', 'bayer': 'Bayer', 'accenture': 'Accenture'}
FACTS = {
    'cardif': [('67', '%', 'up to 67% faster daily pipeline than legacy Jenkins', 'pipeline diário até 67% mais rápido que o Jenkins legado'), ('250', '+', 'Playwright UI tests in the daily run', 'testes de UI em Playwright na execução diária'), ('95', '+', 'APIs covered by automated tests', 'APIs cobertas por testes automatizados'), ('33', ' min', 'or less for the full daily run', 'ou menos para a execução diária completa')],
    'bayer': [('2', ('+ years', '+ anos'), 'leading QA for the Valora Global Program', 'liderando o QA do Valora Global Program'), ('3', '', 'platforms tested: web, iOS and Android', 'plataformas testadas: web, iOS e Android'), ('2', '', 'web frameworks: Cypress and Playwright', 'frameworks web: Cypress e Playwright')],
    'accenture': [('7', (' years', ' anos'), 'from intern to mid-level QA analyst', 'de estagiário a analista de QA pleno'), ('3', '', 'industries: telecom, retail, financial services', 'setores: telecom, varejo e serviços financeiros'), ('2', '', 'mobile platforms automated with Appium', 'plataformas móveis automatizadas com Appium')],
}
DOMAIN = {'cardif': ('Insurance, B2B2C', 'Seguros, B2B2C'), 'bayer': ('Agtech', 'Agtech'), 'accenture': ('Telecom, retail, financial services', 'Telecom, varejo, serviços financeiros')}
featured = list(zip(EN['featured'], PT['featured']))
tabs, panels = '', ''
for i, (fe, fp) in enumerate(featured):
    fid = fe['id']
    yr, cur = YEARS[fid]
    yrs = (yr + ' – ' + T('now', 'hoje') + ' <span class="now">' + T('· current', '· atual') + '</span>') if cur else yr
    tabs += f'<button type="button" role="tab" class="ch-tab xp-tab" id="tab-{fid}" data-id="{fid}" aria-controls="panel-{fid}" aria-selected="{"true" if i == 0 else "false"}" tabindex="{0 if i == 0 else -1}">{logo(fid, SHORT[fid], "co-logo co-logo--tab", False)}<span class="nm">{SHORT[fid]}</span><span class="yr">{yrs}</span></button>'
    facts = ''.join(f'<div class="fact"><div class="v">{n}<small>{T(*u) if isinstance(u, tuple) else e(u)}</small></div><p>{T(ke, kp)}</p></div>' for n, u, ke, kp in FACTS[fid])
    runtime = ''
    if fid == 'cardif':
        runtime = f'''<div class="runtime" role="img" data-label-en="Daily pipeline runtime: legacy baseline versus up to 67% less time now" data-label-pt="Tempo do pipeline diário: base legada versus até 67% menos tempo hoje" aria-label="Daily pipeline runtime: legacy baseline versus up to 67% less time now">
  <div class="row"><div class="lbl"><span>{T("Before: Java, Jenkins and Selenium", "Antes: Java, Jenkins e Selenium")}</span><span>{T("baseline", "base")}</span></div><div class="bar"><i style="--w:100%"></i></div></div>
  <div class="row modern"><div class="lbl"><span>{T("Now: GitLab CI/CD and Playwright", "Hoje: GitLab CI/CD e Playwright")}</span><span>{T("up to 67% less time", "até 67% menos tempo")}</span></div><div class="bar"><i style="--w:33%"></i></div></div>
</div>'''
    hl = ''.join(f'<li>{T(a, b)}</li>' for a, b in zip(fe['highlights'], fp['highlights']))
    nxt = featured[(i + 1) % 3][0]['id']
    panels += f'''<section class="xp-panel" role="tabpanel" id="panel-{fid}" data-id="{fid}" aria-labelledby="tab-{fid}" tabindex="0">
  <div class="xp-brand">{logo(fid, fe["company"], name_pt=fp["company"])}<p class="xp-company">{T(fe["company"], fp["company"])}</p></div>
  <h3 class="xp-title">{T(fe["tagline"], fp["tagline"])}</h3>
  <p class="xp-context">{T(fe["context"], fp["context"])}</p>
  <div class="facts" style="--n:{len(FACTS[fid])}">{facts}</div>
  <div class="xp-body">
    <dl class="credits">
      <div><dt>{T("Role", "Cargo")}</dt><dd>{T(fe["role"], fp["role"])}</dd></div>
      <div><dt>{T("Period", "Período")}</dt><dd>{T(fe["period"], fp["period"])}</dd></div>
      <div><dt>{T("Location", "Local")}</dt><dd>{T(fe["location"], fp["location"])}</dd></div>
      <div><dt>{T("Domain", "Domínio")}</dt><dd>{T(*DOMAIN[fid])}</dd></div>
      <div><dt>{T("Stack", "Stack")}</dt><dd>{L(fe["stack"], fp["stack"])}</dd></div>
    </dl>
    <div>
      <ul class="hl">{hl}</ul>
      {runtime}
      <p class="angle"><span class="k">{T("Why it matters for AI quality roles", "Por que importa para vagas de qualidade em IA")}</span>{T(fe["ai_angle"], fp["ai_angle"])}</p>
      <p class="next-ch"><button type="button" data-tab-target="{nxt}">{T("Next chapter: ", "Próximo capítulo: ")}{SHORT[nxt]}</button></p>
    </div>
  </div>
</section>'''

Y0, Y1 = 2014 + 10/12, 2026 + 11/12
def pos(y): return (y - Y0) / (Y1 - Y0) * 100
SEGS = [('accenture', 'Accenture', 2014 + 10/12, 2021 + 10/12), ('', 'Neoris', 2021 + 10/12, 2022 + 4/12), ('', 'BRQ', 2022 + 4/12, 2022 + 10/12), ('bayer', 'Bayer', 2022 + 10/12, 2025 + 2/12), ('cardif', 'Cardif', 2025 + 4/12, Y1)]
segs = ''
for tid, nm, a, b in SEGS:
    st = f'left:calc({pos(a):.2f}% + 1px);width:calc({pos(b) - pos(a):.2f}% - 2px)'
    segs += f'<button type="button" class="s" style="{st}" data-tab-target="{tid}">{nm}</button>' if tid else f'<span class="s" style="{st}" title="{nm}">{nm}</span>'
roles = ''.join(f'<li><span class="when">{T(a["period"], b["period"])}</span><span class="who"><b>{e(a["company"])}</b><span>{T(a["role"], b["role"])}</span></span><span class="what">{T(a["summary"], b["summary"])}<small>{L(a["chips"], b["chips"])}</small></span></li>' for a, b in zip(EN['earlier'], PT['earlier']))

parts.append(f'''<section class="section" id="work" aria-labelledby="work-t">
  <div class="wrap">
    {head2("work-t", "Three chapters of quality engineering", "Três capítulos de engenharia de qualidade", "BNP Paribas Cardif, Bayer and Accenture. Pick a company to open its chapter.", "BNP Paribas Cardif, Bayer e Accenture. Escolha uma empresa para abrir o capítulo.")}
    <div class="chapters" role="tablist" data-label-en="Featured experience" data-label-pt="Experiências em destaque" aria-label="Featured experience">{tabs}</div>
    <div>{panels}</div>
    <div class="earlier">
      <h3>{T("Earlier roles", "Experiências anteriores")}</h3>
      <div class="span" aria-hidden="true">{segs}</div>
      <div class="ticks" aria-hidden="true"><span>2014</span><span>2016</span><span>2018</span><span>2020</span><span>2022</span><span>2024</span><span>2026</span></div>
      <ul class="roles">{roles}</ul>
    </div>
    {bug(2, "right:12%;bottom:-52px")}
  </div>
</section>''')

# ---------- AI ----------
ai_e, ai_p = EN['ai_focus'], PT['ai_focus']
steps = ''
n = len(ai_e['pipeline'])
for i, (a, b) in enumerate(zip(ai_e['pipeline'], ai_p['pipeline'])):
    gate = i == n - 1
    who = T("Two QA engineers", "Dois engenheiros de QA") if gate else (T("Playwright", "Playwright") if i == 4 else T("AI subagent", "Subagente de IA"))
    steps += f'<li class="step pipeline-step{" gate" if gate else ""}"><span class="n">{e(a["step"])}</span><h3>{T(a["title"], b["title"])}</h3><p>{T(a["text"], b["text"])}</p><span class="who">{who}</span></li>'
caps = ''.join(f'<div class="cap"><h3>{T(a["title"], b["title"])}</h3><p>{T(a["text"], b["text"])}</p><p class="tools-used">{L(a["tags"], b["tags"])}</p></div>' for a, b in zip(ai_e['capabilities'], ai_p['capabilities']))
parts.append(f'''<section class="section ai" id="ai" aria-labelledby="ai-t">
  <div class="wrap">
    {head2("ai-t", ai_e["title"], ai_p["title"], ai_e["intro"], ai_p["intro"])}
    <div id="pipeline" data-step-duration="1000" data-hold="3000">
      <div class="track" aria-hidden="true"><div id="pipeline-progress"></div></div>
      <ol class="pipeline">{steps}</ol>
    </div>
    <div class="caps">{caps}</div>
    {bug(3, "left:58%;bottom:-54px")}
    <p class="studying"><b>{T("Next on my list.", "Próximo passo.")}</b> {T(EN["learning"]["note"], PT["learning"]["note"])}</p>
  </div>
</section>''')

# ---------- about ----------
ab_e, ab_p = EN['about'], PT['about']
paras = ''.join(f'<p>{T(a, b)}</p>' for a, b in zip(ab_e['paragraphs'], ab_p['paragraphs']))
parts.append(f'''<section class="section" id="about" aria-labelledby="about-t">
  <div class="wrap">
    {head2("about-t", "Quality first, then automation, now AI", "Primeiro qualidade, depois automação, agora IA")}
    <div class="about">
      <dl class="facts-dl">
        <div><dt>{T("Based in", "Base")}</dt><dd>{T("São Paulo, Brazil", "São Paulo, Brasil")}</dd></div>
        <div><dt>{T("Works with", "Atua com")}</dt><dd>{T("Teams in Latin America and Europe", "Times na América Latina e na Europa")}</dd></div>
        <div><dt>{T("Languages", "Idiomas")}</dt><dd>{T("English, Spanish, Portuguese", "Inglês, espanhol, português")}</dd></div>
        <div><dt>{T("Industries", "Setores")}</dt><dd>{T("Insurance, fintech, agtech, retail, telecom", "Seguros, fintech, agtech, varejo, telecom")}</dd></div>
        <div><dt>{T("In QA since", "Em QA desde")}</dt><dd>2014</dd></div>
      </dl>
      <div class="about-text">{paras}</div>
    </div>
  </div>
</section>''')

# ---------- skills ----------
rows = ''
for i, (a, b) in enumerate(zip(EN['skills']['groups'], PT['skills']['groups'])):
    note = f'<span class="note">{T(a["note"], b["note"])}</span>' if 'note' in a else ''
    rows += f'<div class="{"ai-row" if i < 2 else ""}"><dt>{T(a["name"], b["name"])}</dt><dd>{L(a["chips"], b["chips"])}{note}</dd></div>'
parts.append(f'''<section class="section" id="skills" aria-labelledby="sk-t">
  <div class="wrap">
    {head2("sk-t", "Tools and skills", "Ferramentas e competências")}
    <dl class="skills">{rows}</dl>
    {bug(4, "left:8%;bottom:-52px")}
  </div>
</section>''')

# ---------- projects ----------
pe, pp = EN['projects']['items'][0], PT['projects']['items'][0]
p2e, p2p = EN['projects']['items'][1], PT['projects']['items'][1]
tree = '''<pre><b>CypressTestingAPI/</b>
├─ cypress/e2e/api/
│  ├─ user_auth.cy.js
│  ├─ product_flow.cy.js
│  └─ cart_flow.cy.js
├─ cypress.config.js
└─ package.json

POST /usuarios, POST /login
POST, GET /produtos
POST, DELETE /carrinhos</pre>'''
plist = [
    ('https://dennermaestro.github.io/Portfolio.io/api-portfolio/', T(p2e['title'], p2p['title']), T(p2e['description'], p2p['description'])),
    ('https://github.com/dennermaestro/E2ETesting-Cypress', 'E2ETesting-Cypress', T('End-to-end UI tests written with Cypress and JavaScript.', 'Testes end-to-end de interface com Cypress e JavaScript.')),
    ('https://github.com/dennermaestro/Introducing-Claude-code', 'Introducing-Claude-code', T('A hands-on project exploring Claude Code features.', 'Projeto prático explorando recursos do Claude Code.')),
]
pl = ''.join(f'<li><a href="{h}" target="_blank" rel="noopener"><span class="t">{ti}</span><span class="d">{d}</span><span class="go">{T("Open", "Abrir")}</span></a></li>' for h, ti, d in plist)
parts.append(f'''<section class="section" id="projects" aria-labelledby="pr-t">
  <div class="wrap">
    {head2("pr-t", "Open test suites", "Suítes de teste abertas", EN["projects"]["intro"], PT["projects"]["intro"])}
    <article class="feature">
      <div>
        <h3>{e(pe["title"])}</h3>
        <p class="sub">{T("My API testing portfolio project", "Meu projeto de portfólio de testes de API")}</p>
        <p>{T(pe["description"], pp["description"])}</p>
        <div class="ctas">
          <a class="btn btn--blue" href="https://github.com/dennermaestro/CypressTestingAPI" target="_blank" rel="noopener">{T("View the repository", "Ver o repositório")}</a>
          <a class="btn" href="https://dennermaestro.github.io/Portfolio.io/api-portfolio/" target="_blank" rel="noopener">{T("Read the case study", "Ler o estudo de caso")}</a>
        </div>
      </div>
      <div class="tree-box"><div class="tree" role="img" data-label-en="Repository structure and endpoints" data-label-pt="Estrutura do repositório e endpoints" aria-label="Repository structure and endpoints">{tree}</div>{bug(5, "right:6px;bottom:4px")}</div>
    </article>
    <ul class="plist">{pl}</ul>
    <p class="more"><a class="ext" href="https://github.com/dennermaestro" target="_blank" rel="noopener">{T("All repositories on GitHub", "Todos os repositórios no GitHub")}</a></p>
  </div>
</section>''')

# ---------- learning ----------
le, lp = EN['learning'], PT['learning']
cs = ''.join(f'<li><span class="st">{T(a["status"], b["status"])}</span><h3>{e(a["title"])}</h3><p>{e(a["provider"])}. {L(a["topics"], b["topics"])}</p></li>' for a, b in zip(le['courses'], lp['courses']))
parts.append(f'''<section class="section" id="learning" aria-labelledby="le-t">
  <div class="wrap">
    {head2("le-t", "Education and learning", "Formação e aprendizado")}
    <div class="learn">
      <div class="degree"><p class="y" aria-hidden="true">{e(le["education"]["year"])}</p><h3>{T(le["education"]["degree"], lp["education"]["degree"])}</h3><p>{T(le["education"]["school"], lp["education"]["school"])}, {e(le["education"]["year"])}</p></div>
      <ul class="courses">{cs}</ul>
    </div>
  </div>
</section>''')

# ---------- contact ----------
ce_, cp_ = EN['contact'], PT['contact']
email = next(x for x in ce_['links'] if x['href'].startswith('mailto:'))
lk = ''.join(f'<li><a href="{e(a["href"])}" target="_blank" rel="noopener"><span>{T(a["label"], b["label"])}</span><span>{e(a["value"])}</span></a></li>' for a, b in zip(ce_['links'], cp_['links']) if not a['href'].startswith('mailto:'))
parts.append(f'''<section class="section contact" id="contact" aria-labelledby="ct-t">
  <div class="wrap">
    <div class="sec-head"><div><h2 class="big" id="ct-t">{T(ce_["title"], cp_["title"])}</h2>
    <p class="sub">{T(ce_["text"], cp_["text"])}</p></div><div class="sec-ill">{SECTION["contact"]}</div></div>
    <div class="email-row"><span class="v" id="email-v">{e(email["value"])}</span><button type="button" class="copy-btn" data-copy="{e(email["value"])}" aria-controls="email-v"><span class="st st-idle">{T("Copy email", "Copiar e-mail")}</span><span class="st st-ok" hidden>{T("Copied", "Copiado")}</span><span class="st st-sel" hidden>{T("Selected, press Ctrl+C", "Selecionado, use Ctrl+C")}</span></button></div>
    <ul class="links">{lk}</ul>
    <p class="loc">{T(ce_["location"], cp_["location"])}</p>
  </div>
</section>
</main>''')

kw = ', '.join(EN['recruiter_keywords'])
parts.append(f'''<footer class="site-footer">
  <div class="wrap">
    <div class="foot"><span>© <span id="year">2026</span> Denner Santana</span><span>{T("Staff QA Engineer and SDET, AI-driven test automation", "Staff QA Engineer e SDET, automação de testes com IA")}</span><span>{T("Bugs caught", "Bugs capturados")}: <span class="bug-count">0/5</span></span><button type="button" class="robot-toggle" id="robot-toggle" aria-pressed="true" hidden>{T("Robot cursor", "Cursor robô")}: <span class="on">{T("on", "ligado")}</span><span class="off">{T("off", "desligado")}</span></button><a href="#top">{T("Back to top", "Voltar ao topo")}</a></div>
    <details class="kw"><summary>{T("Keywords", "Palavras-chave")}</summary><p>{e(kw)}</p></details>
  </div>
</footer>
<div id="toast" class="toast" role="status" aria-live="polite" hidden data-en="Bug {{n}} of {{t}} caught." data-pt="Bug {{n}} de {{t}} capturado." data-en-all="All {{t}} bugs caught. Nothing escapes this tester." data-pt-all="Todos os {{t}} bugs capturados. Nada escapa deste tester." data-en-cta="Let's talk" data-pt-cta="Vamos conversar"></div>
{ROBOT_CURSOR}''')

body = '\n'.join(parts)
meta = {'en': {'title': EN['meta']['title'], 'description': EN['meta']['description']}, 'pt': {'title': PT['meta']['title'], 'description': PT['meta']['description']}}
jsonld = {"@context": "https://schema.org", "@type": "Person", "name": "Denner Santana", "jobTitle": "Staff QA Engineer / SDET", "address": {"@type": "PostalAddress", "addressLocality": "São Paulo", "addressCountry": "BR"}, "sameAs": ["https://www.linkedin.com/in/denner-santana-778b67b7", "https://github.com/dennermaestro"], "knowsAbout": EN['meta']['keywords']}
head = f'''<title>Denner Santana · QA</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{e(EN["meta"]["description"])}">
<meta name="keywords" content="{e(", ".join(EN["meta"]["keywords"]))}">
<meta name="author" content="Denner Santana">
<meta property="og:title" content="{e(EN["meta"]["title"])}">
<meta property="og:description" content="{e(EN["meta"]["description"])}">
<meta property="og:type" content="profile">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%232340E8'/%3E%3Ctext x='32' y='42' text-anchor='middle' font-family='Arial' font-weight='800' font-size='28' fill='%23fff'%3EDS%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@400;500&display=swap">
<script>(function(){{var r=document.documentElement;r.classList.add('js');try{{var t=localStorage.getItem('ds-theme');if(t)r.setAttribute('data-theme',t);var l=localStorage.getItem('ds-lang');var q=/[?&]lang=(pt|en)/.exec(location.search);l=q?q[1]:l||((navigator.language||'').toLowerCase().indexOf('pt')===0?'pt':'en');r.setAttribute('data-lang',l);}}catch(e){{}}}})();window.__META__={json.dumps(meta, ensure_ascii=False)};</script>
<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>
<style>
{css}
</style>'''
scripts = f'<script>\n{motion_js}\n</script>\n<script>\n{main_js}\n</script>\n<script>\n{fx_js}\n</script>'
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, 'artifact.html'), 'w').write(head + '\n' + body + '\n' + scripts + '\n')
full = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
{head}
</head>
<body>
{body}
{scripts}
</body>
</html>
'''
open(os.path.join(OUT, 'index.html'), 'w').write(full)
print('ok', len(full))
