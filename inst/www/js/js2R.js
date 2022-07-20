function setCutoffDisc(params, gcsettings) {
    if (gcsettings.cutoffdisc === 0) {
        return;
    }
    var opt = gcsettings.discoption;
    params['cutoff.disc'] = {
        option: opt,
        cutoff: [ gcsettings.mindisc[opt-1], gcsettings.maxdisc[opt-1] ],
        before: gcsettings.cutoffdisc === 1
    };
}

function isQuote(c) {
    return c === '"' || c === "'";
}

function isSpace(c) {
    return c === ' ' || c === '\t' || c === '\n' || c === '\r';
}

function skipSpace(s, n) {
    var len = s.length;
    while(n < len) {
        if (!isSpace(s[n])) {
            return n;
        }
        ++n;
    }
    return len;
}

function readStringUntil(quote, s, n) {
    var len = s.length;
    var r = '';
    while (n < len) {
        var c = s[n];
        if (c === quote) {
            return [r, n+1];
        }
        if (c === '\\') {
            ++n;
            if (len < n) {
                return null;
            }
            // not worried about \n, \t and so on here, only \' and \"
            c = s[n];
        }
        r += c;
        ++n;
    }
    return null
}

function parseString(s, n) {
    var len = s.length;
    n = skipSpace(s, n);
    if (len <= n || !isQuote(s[n])) {
        return null;
    }
    return readStringUntil(s[n], s, n+1);
}

function isChar(c, s, n) {
    return n < s.length && s[n] === c;
}

function parseListOf(fn, s, n) {
    var len = s.length;
    n = skipSpace(s, n);
    if (!isChar('(', s, n)) {
        return null;
    }
    n = skipSpace(s, n + 1);
    if (isChar(')', s, n)) {
        return [[], n+1];
    }
    var r = [];
    while (n < len) {
        var v = fn(s, n);
        if (v === null) {
            return null;
        }
        r.push(v[0]);
        n = skipSpace(s, v[1]);
        if (isChar(')', s, n)) {
            return [r, n+1];
        }
        if (!isChar(',', s, n)) {
            return null;
        }
        ++n;
    }
    return null;
}

function parseNumber(s, n) {
    var len = s.length;
    var seen = false;
    var zero = '0'.charCodeAt(0);
    var v = 0;
    while (n < len && s[n] !== '.') {
        var c = s[n];
        if ('0' <= c && c <= '9') {
            seen = true;
            v = v * 10 + c.charCodeAt(0) - zero;
        } else {
            if (seen) {
                return [v, n]
            }
            return null;
        }
        ++n;
    }
    ++n;
    var mag = 0.1;
    while (n < len) {
        var c = s[n];
        if ('0' <= c && c <= '9') {
            seen = true;
            v += mag * (c.charCodeAt(0) - zero);
            mag /= 10;
        } else {
            if (seen) {
                return [v, n]
            }
            return null;
        }
        ++n;
    }
    return [v, n];
}

function toHh(p) {
    p = Math.floor(255 * p + 0.5);
    if (p <= 0) {
        return '00';
    }
    if (255 <= p) {
        return 'FF';
    }
    var m = Math.floor(p / 16);
    var cs = '0123456789ABCDEF';
    var s = cs[m];
    return s + cs[p - 16 * m];
}

function parseRgb(s, n) {
    var len = s.length;
    if (len <= n) {
        return null;
    }
    n = skipSpace(s, n);
    if (!isChar('r', s, n) || !isChar('g', s, n+1) || !isChar('b', s, n+2)) {
        return null;
    }
    n = skipSpace(s, n+3);
    var lst = parseListOf(parseNumber, s, n);
    if (lst === null) {
        return null;
    }
    return ['#' + lst[0].map(toHh).join(''), lst[1]];
}

function parseColourList(s, n) {
    n = skipSpace(s, n);
    if (!isChar('c', s, n)) {
        return null;
    }
    return parseListOf(parseColour, s, n + 1);
}

function parseColour(s, n) {
    var c = parseColourList(s, n);
    if (c !== null) {
        return c;
    }
    c = parseRgb(s, n);
    if (c !== null) {
        return c;
    }
    return parseString(s, n);
}

// parse an R colour and turn it into something we can send as JSON
function getColour(s, def) {
    if (typeof(s) !== 'string') {
        return def;
    }
    var c = parseColour(s, 0);
    return c === null? def : c[0];
}

// turns the options into a string to feed into R
function getOptions(prefs){
    var geochronometer = prefs.settings.geochronometer;
    var plotdevice = prefs.settings.plotdevice;
    var pdsettings = prefs.settings[plotdevice];
    var gcsettings = prefs.settings[geochronometer];
    return {
        geochronometer: geochronometer,
        plotdevice: plotdevice,
        pdsettings: pdsettings,
        gcsettings: gcsettings,
        ellipsefill: getColour(pdsettings.ellipsefill, 'cyan'),
        ellipsestroke: getColour(pdsettings.ellipsestroke, 'black'),
        bg: getColour(pdsettings.bg, 'yellow'),
        col: getColour(pdsettings.col, 'blue'),
        rectcol: getColour(pdsettings.rectcol, 'green'),
        outliercol: getColour(pdsettings.outliercol, 'red'),
        plateaucol: getColour(pdsettings.plateaucol, 'cyan'),
        nonplateaucol: getColour(pdsettings.nonplateaucol, 'red'),
        hide: typeof(gcsettings.hide) === 'string'? gcsettings.hide.split(',') : []
    };
}

function getRcommand(prefs) {
    var geochronometer = prefs.settings.geochronometer;
    var plotdevice = prefs.settings.plotdevice;
    var gcsettings = prefs.settings[geochronometer];
    var input = {
        s2d: {
            params: {
                method: geochronometer,
                ierr: prefs.settings.ierr
            }
        },
        params: getOptions(prefs),
        settings: prefs.constants
    };
    if (['detritals', 'fissiontracks','U-Pb', 'Pb-Pb', 'Ar-Ar', 'Th-Pb',
        'K-Ca', 'Th-U', 'Rb-Sr', 'Sm-Nd', 'Re-Os', 'Lu-Hf'
        ].indexOf(geochronometer) >= 0) {
        input.s2d.params.format = gcsettings.format;
    } else if (geochronometer === 'other') {
        input.s2d.params.format = plotdevice;
    }
    if (geochronometer=='U-Pb' && gcsettings.diseq) {
        input.s2d.diseq = {};
        ['U48', 'ThU', 'RaU', 'PaU'].forEach(function(e) {
            input.s2d.diseq[e] = {
                x: gcsettings[e][0],
                option: gcsettings[e][1]
            };
        });
    } else if (geochronometer === 'Th-U') {
        input.s2d.Th02 = gcsettings.Th02;
        input.s2d.Th02U48 = gcsettings.Th02U48;
    }
    if ((plotdevice != 'ages') && (plotdevice != 'set-zeta')){
        input.cex = prefs.settings.par.cex;
    }
    if (plotdevice == 'regression') {
        input.york = { format: prefs.settings.other.format };
    }
    input.fn = plotdevice;
    return input;
}
