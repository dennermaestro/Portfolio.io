# Illustrations: flat geometric SVGs coloured by the page tokens (classes a/b/c = the three
# keyword colours, i = ink, p = paper, s = ink stroke). Small idle loops are CSS (an-*).

def _svg(vb, inner, cls='il'):
    return f'<svg class="{cls}" viewBox="0 0 {vb} {vb}" aria-hidden="true" focusable="false">{inner}</svg>'

def _gear(cx, cy, r, cls, teeth=8, spin='an-spin'):
    tw, th = r * 0.42, r * 0.5
    t = ''.join(f'<rect class="{cls}" x="{cx - tw / 2:.1f}" y="{cy - r - th * 0.55:.1f}" width="{tw:.1f}" height="{th:.1f}" rx="{tw * 0.2:.1f}" transform="rotate({k * 360 / teeth:.0f} {cx} {cy})"/>' for k in range(teeth))
    return f'<g class="{spin}">{t}<circle class="{cls}" cx="{cx}" cy="{cy}" r="{r}"/><circle class="p" cx="{cx}" cy="{cy}" r="{r * 0.36:.1f}"/></g>'

# ---- hero tokens (sit between parentheses in the keyword statement) ----
TOKENS = {
    'robot': _svg(100, '<g class="an-bob"><path class="s" d="M50 24V10"/><circle class="b" cx="50" cy="9" r="7"/>'
                       '<rect class="a" x="14" y="24" width="72" height="50" rx="13"/>'
                       '<g class="an-blink"><circle class="p" cx="36" cy="47" r="10"/><circle class="p" cx="64" cy="47" r="10"/>'
                       '<g class="an-look"><circle class="i" cx="36" cy="47" r="4.5"/><circle class="i" cx="64" cy="47" r="4.5"/></g></g>'
                       '<rect class="p" x="38" y="62" width="24" height="5" rx="2.5"/>'
                       '<rect class="c" x="30" y="78" width="40" height="17" rx="6"/></g>'),
    'stamp': _svg(100, '<path class="s" style="stroke:var(--k1);stroke-width:9" d="M28 84l13 10 30-24"/>'
                       '<g class="an-stamp"><rect class="b" x="39" y="4" width="22" height="34" rx="11"/>'
                       '<rect class="i" x="24" y="34" width="52" height="14" rx="5"/>'
                       '<rect class="b" x="16" y="46" width="68" height="14" rx="4"/></g>'),
    'sprout': _svg(100, '<path class="s" d="M50 72V40"/>'
                        '<path class="a an-leaf" style="transform-origin:100% 100%" d="M50 50C30 50 20 38 20 24c20 0 30 10 30 26z"/>'
                        '<path class="c an-leaf2" style="transform-origin:0% 100%" d="M50 40c0-18 10-28 30-28 0 16-10 28-30 28z"/>'
                        '<path class="b" d="M26 70h48l-6 24H32z"/>'),
    'phone': _svg(100, '<g class="an-tilt"><rect class="i" x="27" y="5" width="46" height="90" rx="10"/>'
                       '<rect class="p" x="32" y="15" width="36" height="64" rx="3"/>'
                       '<path class="s an-pop" style="stroke:var(--k1);stroke-width:8" d="M39 48l9 9 15-18"/>'
                       '<circle class="p" cx="50" cy="87" r="3.5"/></g>'),
    'ladder': _svg(100, '<path class="s" style="stroke-width:7" d="M28 96L40 6M62 96L74 6"/>'
                        '<path class="s" style="stroke-width:6" d="M31 76h32M34 54h32M37 32h32"/>'
                        '<circle class="b an-climb" cx="46" cy="86" r="9"/>'),
    'gear': _svg(100, _gear(50, 50, 30, 'c')),
}

# ---- one illustration per section ----
SECTION = {
    'work': _svg(200, '<rect class="b" x="12" y="140" width="176" height="48" rx="7"/>'
                      '<rect class="c" x="70" y="94" width="118" height="48" rx="7"/>'
                      '<rect class="a" x="128" y="48" width="60" height="48" rx="7"/>'
                      '<path class="s" d="M158 48V8"/>'
                      '<path class="i an-flag" style="transform-origin:0% 50%" d="M158 8h36l-11 13 11 13h-36z"/>'
                      '<circle class="p" cx="40" cy="164" r="7"/><circle class="p" cx="98" cy="118" r="7"/><circle class="p" cx="156" cy="72" r="7"/>'),
    'ai': _svg(200, '<g class="an-bob"><path class="s" d="M72 60V34"/><circle class="c" cx="72" cy="28" r="10"/>'
                    '<rect class="a" x="16" y="60" width="112" height="84" rx="20"/>'
                    '<g class="an-blink"><circle class="p" cx="50" cy="98" r="15"/><circle class="p" cx="94" cy="98" r="15"/>'
                    '<g class="an-look"><circle class="i" cx="50" cy="98" r="6.5"/><circle class="i" cx="94" cy="98" r="6.5"/></g></g>'
                    '<rect class="p" x="54" y="124" width="36" height="7" rx="3.5"/></g>'
                    '<g class="an-press"><circle class="b" cx="148" cy="146" r="42"/>'
                    '<path class="s sp" style="stroke-width:11" d="M129 147l13 13 26-30"/></g>'),
    'about': _svg(200, '<circle class="a" cx="90" cy="116" r="72"/>'
                       '<ellipse class="s sp" style="stroke-width:5" cx="90" cy="116" rx="30" ry="72"/>'
                       '<path class="s sp" style="stroke-width:5" d="M18 116h144M32 78h116M32 154h116"/>'
                       '<g class="an-bob"><path class="b" d="M146 14c-18 0-32 14-32 31 0 24 32 50 32 50s32-26 32-50c0-17-14-31-32-31z"/>'
                       '<circle class="p" cx="146" cy="46" r="12"/></g>'),
    'skills': _svg(200, _gear(80, 122, 50, 'c') + _gear(152, 54, 28, 'a', teeth=7, spin='an-spin-r')),
    'projects': _svg(200, '<g class="an-wiggle"><path class="s" d="M62 78L38 62M58 100H30M62 122l-24 16M118 78l24-16M122 100h28M118 122l24 16"/>'
                          '<circle class="i" cx="90" cy="60" r="16"/><ellipse class="b" cx="90" cy="104" rx="30" ry="38"/>'
                          '<path class="s" style="stroke-width:5" d="M90 68v72"/>'
                          '<circle class="i" cx="76" cy="94" r="6"/><circle class="i" cx="104" cy="94" r="6"/><circle class="i" cx="78" cy="118" r="5"/><circle class="i" cx="102" cy="118" r="5"/></g>'
                          '<g class="an-scan"><circle class="s" style="stroke:var(--k1);stroke-width:13" cx="98" cy="96" r="64"/>'
                          '<path class="s" style="stroke:var(--k1);stroke-width:17" d="M146 144l40 42"/></g>'),
    'learning': _svg(200, '<rect class="b" x="26" y="152" width="148" height="32" rx="6"/>'
                          '<rect class="a" x="42" y="120" width="124" height="32" rx="6"/>'
                          '<rect class="c" x="32" y="88" width="136" height="32" rx="6"/>'
                          '<path class="s sp" style="stroke-width:5" d="M50 168h40M64 136h30M52 104h46"/>'
                          '<g class="an-bob"><path class="i" d="M100 12l72 28-72 28-72-28z"/>'
                          '<path class="i" d="M60 52v20c0 10 80 10 80 0V52l-40 16z"/>'
                          '<path class="s" style="stroke:var(--k2);stroke-width:5" d="M172 40v30"/><circle class="b" cx="172" cy="76" r="8"/></g>'),
    'contact': _svg(200, '<path class="s" style="stroke-width:6;stroke-dasharray:2 16" d="M10 178c34-6 52-34 84-50"/>'
                         '<g class="an-fly"><path class="a" d="M190 22L26 84l56 26z"/>'
                         '<path class="c" d="M190 22L82 110l10 58z"/>'
                         '<path class="b" d="M190 22L92 168l36-38 44 20z"/></g>'),
}

BUG = ('<svg class="il bug-svg" viewBox="0 0 40 40" aria-hidden="true" focusable="false">'
       '<g class="bug-live"><path class="s" style="stroke-width:2.5" d="M13 15L6 11M12 21H4M13 27l-7 4M27 15l7-4M28 21h8M27 27l7 4"/>'
       '<circle class="i" cx="20" cy="11" r="5"/><ellipse class="b" cx="20" cy="22" rx="9" ry="11"/>'
       '<path class="s" style="stroke-width:2" d="M20 13v20"/><circle class="i" cx="16" cy="20" r="2"/><circle class="i" cx="24" cy="20" r="2"/></g>'
       '<g class="bug-done"><circle class="a" cx="20" cy="20" r="15"/><path class="s sp" style="stroke-width:4" d="M13 20l5 5 9-11"/></g></svg>')

ROBOT_CURSOR = ('<div id="robot" aria-hidden="true"><div class="robot-in"><svg viewBox="0 0 50 54" width="50" height="54" focusable="false">'
                '<path class="r-ant" d="M7 7L22 19"/><circle class="r-ring" cx="7" cy="7" r="5"/><circle class="r-ball" cx="7" cy="7" r="5"/>'
                '<rect class="r-head" x="13" y="15" width="34" height="25" rx="8"/>'
                '<circle class="r-eye" cx="24" cy="26" r="5"/><circle class="r-eye" cx="36" cy="26" r="5"/>'
                '<g class="r-pup"><circle cx="24" cy="26" r="2.2"/><circle cx="36" cy="26" r="2.2"/></g>'
                '<rect class="r-mouth" x="25" y="33" width="10" height="2.6" rx="1.3"/>'
                '<rect class="r-body" x="20" y="42" width="20" height="10" rx="3.5"/></svg></div></div>')

BADGE_FACE = ('<svg class="b-bot" viewBox="0 0 40 32" aria-hidden="true" focusable="false"><rect x="2" y="4" width="36" height="26" rx="8" fill="currentColor"/>'
              '<circle class="b-eye" cx="14" cy="16" r="5"/><circle class="b-eye" cx="26" cy="16" r="5"/></svg>')
