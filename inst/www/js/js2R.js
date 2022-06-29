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
    if (len < n || s[n] !== '(') {
        return null;
    }
    n = skipSpace(s, n);
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
        ++n;
        if ('0' <= c && c <= '9') {
            seen = true;
            v = v * 10 + c.charCodeAt(0) - zero;
        } else {
            if (seen) {
                return [v, n]
            }
            return null;
        }
    }
    ++n;
    var mag = 0.1;
    while (n < len) {
        var c = s[n];
        ++n;
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
    }
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
    return [{
        'rgb': lst[0]
    }, lst[1]];
}

function parseColourList(s, n) {
    n = skipSpace(s, n);
    if (!isChar('c', s, n)) {
        return null;
    }
    return parseListOf(parseColour, s, n);
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
    var c = parseColour(s, 0);
    return c === null? def : c[0];
}

// turns the options into a string to feed into R
function getOptions(prefs){
    var NA = [null];
    var params = {};
    var geochronometer = prefs.settings.geochronometer;
    var plotdevice = prefs.settings.plotdevice;
    var pdsettings = prefs.settings[plotdevice];
    var gcsettings = prefs.settings[geochronometer];
    switch (plotdevice){
    case 'concordia':
        var mint = check(pdsettings.mint,null);
        var maxt = check(pdsettings.maxt,null);
        if (mint !== null || maxt !== null) {
            params.tlim = [
                mint === null? 0 : mint,
                maxt === null? 4500 : maxt
            ];
        } else {
            params.tlim = null;
        }
        if (pdsettings.minx !== 'auto' && pdsettings.maxx !== 'auto') {
            params.xlim = [ pdsettings.minx, pdsettings.maxx ];
        }
        if (pdsettings.miny !== 'auto' && pdsettings.maxy !== 'auto') {
            params.ylim = [ pdsettings.miny, pdsettings.maxy ];
        }
        if (pdsettings.ticks !== 'auto') {
            params.ticks = [ pdsettings.ticks ];
        }
        params.alpha = pdsettings.alpha;
        params.type = pdsettings.type;
        params.exterr = pdsettings.exterr;
        params['show.numbers'] = pdsettings.shownumbers;
        params['show.age'] = pdsettings.showage;
        params.sigdig = pdsettings.sigdig;
        params['common.Pb'] = gcsettings.commonPb;
        params['ellipse.fill'] = getColour(pdsettings.ellipsefill);
        params['ellipse.stroke'] = getColour(pdsettings.ellipsestroke);
        params.levels = true;
        params.omit = { flags: 'x' };
        params.hide = { flags: 'X' };
        params.clabel = pdsettings.clabel;
        if (pdsettings.anchor==1) {
            params.anchor = 1;
        } else if (pdsettings.anchor==2) {
            params.anchor = [ 2, pdsettings.tanchor ];
        }
        break;
    case 'radial':
        params.transformation = pdsettings.transformation;
        params.levels = true;
        params.omit = { flags: 'x' };
        params.hide = { flags: 'X' };
        if (pdsettings.numpeaks == 'auto') { params.k = 'auto'; }
        else if (pdsettings.numpeaks == 'min'){ params.k = 'min'; }
        else { params.k = pdsettings.numpeaks; }
        if (pdsettings.mint != 'auto'){ params.from = pdsettings.mint; }
        if (pdsettings.z0 != 'auto'){ params.z0 = pdsettings.z0; }
        if (pdsettings.maxt != 'auto'){ params.to = pdsettings.maxt; }
        params.pch = pdsettings.pch;
        params.cex = pdsettings.cex;
        params.bg = getColour(pdsettings.bg);
        params.alpha = pdsettings.alpha;
        params.sigdig = pdsettings.sigdig;
        params['show.numbers'] = pdsettings.shownumbers;
        params.clabel = pdsettings.clabel;
        if (geochronometer !== "other" &&
            geochronometer !== "Th-U" &&
            geochronometer !== 'U-Th-He') {
                params.exterr = pdsettings.exterr;
        }
        switch (geochronometer){
        case 'Th-U':
            params.detritus= + gcsettings.detritus;
        case 'Ar-Ar':
        case 'Th-Pb':
        case 'K-Ca':
        case 'Rb-Sr':
        case 'Sm-Nd':
        case 'Re-Os':
        case 'Lu-Hf':
            params.i2i = gcsettings.i2i;
            break;
        case 'U-Pb':
            var type = gcsettings.type;
            params.type = type;
            if (type === 4) {
                params['cutoff.76'] = gcsettings.cutoff76;
            }
            setCutoffDisc(params, gcsettings);
        case 'Pb-Pb':
            params['common.Pb'] = gcsettings.commonPb;
            default:
        }
        break;
    case 'evolution':
        if (pdsettings.transform && pdsettings.mint !== 'auto' && pdsettings.maxt !== 'auto'){
            params.xlim = [ pdsettings.mint, pdsettings.maxt ];
        }
        if (!pdsettings.transform && pdsettings.min08 !== 'auto' && pdsettings.max08 !== 'auto'){
            params.xlim = [ pdsettings.min08, pdsettings.max08 ];
        }
        if (pdsettings.min48 != 'auto' & pdsettings.max48 != 'auto'){
            params.ylim = [ pdsettings.min48, pdsettings.max48 ];
        }
        params.alpha = pdsettings.alpha;
        params['show.numbers'] = pdsettings.shownumbers;
        params.sigdig = pdsettings.sigdig;
        params.transform = pdsettings.transform;
        params.detritus = gcsettings.detritus;
        params.exterr = pdsettings.exterr;
        params.isochron = pdsettings.isochron;
        params.levels = true;
        params.omit = { flags: 'x' };
        params.hide = { flags: 'X' };
        params['ellipse.fill'] = getColour(pdsettings.ellipsefill);
        params['ellipse.stroke'] = getColour(pdsettings.ellipsestroke);
        params.model = pdsettings.model;
        params.clabel = pdsettings.clabel;
        break;
    case 'isochron':
        if (geochronometer !== 'U-Pb' && geochronometer !== 'Th-U' &&
            geochronometer !=='U-Th-He') { params.inverse = gcsettings.inverse; }
        if (geochronometer === 'Pb-Pb') { params.growth = pdsettings.growth; }
        if (geochronometer=='U-Pb') {
            params.type = pdsettings.UPbtype;
            if (gcsettings.format > 3) {
                params.joint = pdsettings.joint;
            }
            if (pdsettings.anchor === 1) {
                params.anchor = 1;
            } else if (pdsettings.anchor === 2) {
                params.anchor = [2, pdsettings.tanchor ];
            }
        }
        if (geochronometer=='Th-U') { params.type = pdsettings.ThUtype; }
        if (geochronometer!='U-Th-He') { params.exterr = pdsettings.exterr; }
    case 'regression':
        if (pdsettings.minx !== 'auto' && pdsettings.maxx !== 'auto') {
            params.xlim = [ pdsettings.minx, pdsettings.maxx ];
        }
        if (pdsettings.miny !== 'auto' && pdsettings.maxy !== 'auto') {
            params.ylim = [ pdsettings.miny, pdsettings.maxy ];
        }
        params.alpha = pdsettings.alpha;
        params['show.numbers'] = pdsettings.shownumbers;
        params.sigdig = pdsettings.sigdig;
        params.model = pdsettings.model;
        params.clabel = pdsettings.clabel;
        params.levels = true;
        params.omit = { flags: 'x' };
        params.hide = { flags: 'X' };
        params['ellipse.fill'] = getColour(pdsettings.ellipsefill);
        params['ellipse.stroke'] = getColour(pdsettings.ellipsestroke);
        break;
    case 'average':
	switch (geochronometer){
        case 'Th-U':
            params.detritus = gcsettings.detritus;
        case 'Ar-Ar':
        case 'Th-Pb':
        case 'K-Ca':
        case 'Rb-Sr':
        case 'Sm-Nd':
        case 'Re-Os':
        case 'Lu-Hf':
            params.i2i = gcsettings.i2i;
            break;
        case 'U-Pb':
            var type = gcsettings.type;
            params.type = type;
            if (type === 4) {
                params['cutoff.76'] = gcsettings.cutoff76;
            }
            setCutoffDisc(params, gcsettings);
        case 'Pb-Pb':
            params['common.Pb'] = gcsettings.commonPb;
            break;
        }
        if (geochronometer !== "other" &&
            geochronometer !== "Th-U" &&
            geochronometer !== 'U-Th-He') {
            params.exterr = pdsettings.exterr;
        }
        params['detect.outliers'] = pdsettings.outliers;
        params.alpha = pdsettings.alpha;
        params.sigdig = pdsettings.sigdig;
        params['random.effects'] = pdsettings.randomeffects;
        params.ranked = pdsettings.ranked;
        params.levels = true;
        params['rect.col'] = getColour(pdsettings.rectcol);
        params['outlier.col'] = getColour(pdsettings.outliercol);
        params.clabel = pdsettings.clabel;
        if (pdsettings.mint !== 'auto') { params.from = pdsettings.mint; }
        if (pdsettings.maxt !== 'auto') { params.to = pdsettings.maxt; }
        params.omit = { flags: 'x' };
        params.hide = { flags: 'X' };
        break;
    case 'spectrum':
        if (geochronometer=='Ar-Ar'){
            params.i2i = gcsettings.i2i;
            params.exterr = pdsettings.exterr;
        }
        params.plateau = pdsettings.plateau;
        param['random.effects'] = pdsettings.randomeffects;
        params.alpha = pdsettings.alpha;
        params.sigdig = pdsettings.sigdig;
        params.levels = true;
        params['plateau.col'] = getColour(pdsettings.plateaucol);
        params['non.plateau.col'] = getColour(pdsettings.nonplateaucol);
        params.clabel = pdsettings.clabel;
        params.omit = { flags: 'x' };
        params.hide = { flags: 'X' };
        break;
    case 'KDE':
        params.from = pdsettings.minx === 'auto'? NA : pdsettings.minx;
        params.to = pdsettings.maxx === 'auto'? NA : pdsettings.maxx;
        params.bw = pdsettings.bandwidth === 'auto'? NA : pdsettings.bandwidth;
        params['show.hist'] = pdsettings.showhist;
        params.adaptive = pdsettings.adaptive;
        switch (geochronometer){
        case 'Th-U':
            params.detritus = gcsettings.detritus;
        case 'Ar-Ar':
        case 'Th-Pb':
        case 'K-Ca':
        case 'Rb-Sr':
        case 'Sm-Nd':
        case 'Re-Os':
        case 'Lu-Hf':
            params.i2i = gcsettings.i2i;
            break;
        case 'U-Pb':
            var type = gcsettings.type;
            params.type = type;
            if (type === 4) {
                params['cutoff.76'] = gcsettings.cutoff76;
            }
            setCutoffDisc(params, gcsettings);
        case 'Pb-Pb':
            params['common.Pb'] = gcsettings.commonPb;
            break;
        case 'detritals':
            params.samebandwidth = pdsettings.samebandwidth;
            params.normalise = pdsettings.normalise;
            break;
        default:
        }
        params.rug = geochronometer === "detritals"?
            pdsettings.rugdetritals : pdsettings.rug;
        params.log = pdsettings.log;
        params.binwidth = pdsettings.binwidth === 'auto'? NA : pdsettings.binwidth;
        if (geochronometer === 'detritals') {
            params.hide = gcsettings.hide;
        } else {
            params.hide = { flags: [ 'x', 'X' ] };
        }
        break;
    case 'CAD':
        if (pdsettings.pch !== 'none') { params.pch = pdsettings.pch; }
        params.verticals = pdsettings.verticals;
        switch (geochronometer){
        case 'Th-U':
            params.detritus = gcsettings.detritus;
        case 'Ar-Ar':
        case 'Th-Pb':
        case 'K-Ca':
        case 'Rb-Sr':
        case 'Sm-Nd':
        case 'Re-Os':
        case 'Lu-Hf':
            params.i2i = gcsettings.i2i;
            break;
        case 'U-Pb':
            var type = gcsettings.type;
            params.type = type;
            if (type === 4) {
                params['cutoff.76'] = gcsettings.cutoff76;
            }
            setCutoffDisc(params, gcsettings);
        case 'Pb-Pb':
            params['common.Pb'] = gcsettings.commonPb;
            break;
        default:
        }
        if (geochronometer === 'detritals') {
            params.col = getColour(pdsettings.colmap);
            params.hide = gcsettings.hide.split(',');
        } else {
            params.hide = { flags: [ 'x', 'X' ] };
        }
        break;
    case 'set-zeta':
        var data = prefs.data.fissiontracks;
        params.tst = data.age;
        params.exterr = pdsettings.exterr;
        params.sigdig = pdsettings.sigdig;
        params.update = false;
        break;
    case 'helioplot':
        params.logratio = pdsettings.logratio;
        params['show.numbers'] = pdsettings.shownumbers;
        params['show.central.comp'] = pdsettings.showcentralcomp;
        params.alpha = pdsettings.alpha;
        params.sigdig = pdsettings.sigdig;
        if (pdsettings.minx !== 'auto' && pdsettings.maxx !== 'auto') {
            params.xlim = [ pdsettings.minx, pdsettings.maxx ];
        }
        if (pdsettings.miny !== 'auto' && pdsettings.maxy !== 'auto') {
            params.ylim = [ pdsettings.miny, pdsettings.maxy ];
        }
        if (pdsettings.fact !== 'auto') {
            params.fact = pdsettings.fact;
        }
        params.levels = true;
        params.omit = { flags: 'x' };
        params.hide = { flags: 'X' };
        params['ellipse.fill'] = getColour(pdsettings.ellipsefill);
        params['ellipse.stroke'] = getColour(pdsettings.ellipsestroke);
        params.model = pdsettings.model;
        params.clabel = pdsettings.clabel;
        break;
    case 'MDS':
        params.classical = pdsettings.classical;
        params.shepard = pdsettings.shepard;
        params.nnlines = pdsettings.nnlines;
        params.pch = pdsettings.pch === 'none'? NA : pdsettings.pch;
        if (!pdsettings.shepard) { params.cex = pdsettings.cex; }
        if (pdsettings.pos === 1 || pdsettings.pos === 2 ||
            pdsettings.pos === 3 || pdsettings.pos === 4) {
            params.pos = pdsettings.pos;
        }
        params.col = getColour(pdsettings.col);
        params.bg = getColour(pdsettings.bg);
        params.hide = gcsettings.hide.split(',');
        break;
    case 'ages':
        if (geochronometer === 'U-Pb' && pdsettings.showdisc !== 0) {
            params.discordance = {
                option: pdsettings.discoption,
                before: pdsettings.showdisc === 1
            };
        }
        if (geochronometer !== 'U-Th-He') {
            params.exterr = pdsettings.exterr;
        }
        switch (geochronometer){
        case 'Th-U':
            params.i2i = gcsettings.i2i;
            params.isochron = false;
            params.detritus = gcsettings.detritus;
            break;
        case 'Th-Pb':
        case 'K-Ca':
        case 'Rb-Sr':
        case 'Sm-Nd':
        case 'Re-Os':
        case 'Lu-Hf':
        case 'Ar-Ar':
            params.i2i = gcsettings.i2i;
            params.isochron = false;
            params.projerr = gcsettings.projerr;
            break;
        case 'Pb-Pb':
            params.projerr = gcsettings.projerr;
            params.isochron = false;
        case 'U-Pb':
            params['common.Pb'] = gcsettings.commonPb;
            break;
        default:
        }
        params.sigdig = pdsettings.sigdig;
        break;
    default: // do nothing
    }
    return params;
}

function applySettings(dst, src, which) {
    for(var method in which) {
        var vs = which[method];
        if (!(method in dst)) {
            dst[method] = {};
        }
        for(var n in vs) {
            var v = vs[n];
            dst[method][v] = src[method][v];
        }
    }
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
        settings: {}
    };
    if (['detritals', 'fissiontracks','U-Pb', 'Pb-Pb', 'Ar-Ar', 'Th-Pb',
        'K-Ca', 'Th-U', 'Rb-Sr', 'Sm-Nd', 'Re-Os', 'Lu-Hf'
        ].indexOf(geochronometer) >= 0) {
        input.s2d.params.format = gcsettings.format;
    } else if (geochronometer === 'other') {
        input.s2d.params.format = plotdevice;
    }
    if (geochronometer=='U-Pb' && gcsettings.diseq) {
        ['U48', 'ThU', 'RaU', 'PaU'].forEach(function(e) {
            input.s2d.diseq[e] = {
                x: gcsettings[d][0],
                option: gcsettings[d][1]
            };
        });
    } else if (geochronometer === 'Th-U') {
        input.s2d.Th02 = gcsettings.Th02;
        input.s2d.Th02U48 = gcsettings.Th02U48;
    }
    switch (geochronometer){
    case 'U-Pb':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Pb207Pb206', 'Pb208Pb206', 'Pb208Pb207'],
            'lambda': ['Th232', 'U234', 'Th230', 'Ra226', 'Pa231']
        });
    case 'Pb-Pb':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Pb206Pb204', 'Pb207Pb204', 'U238U235'],
            'lambda': ['U238', 'U235']
        });
        break;
    case 'Th-U':
        applySettings(input.settings, prefs.constants, {
            'lambda': ['Th230', 'U234']
        });
        break;
    case 'Ar-Ar':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Ar40Ar36'],
            'lambda': ['K40']
        });
        break;
    case 'Th-Pb':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Pb208Pb204'],
            'lambda': ['Th232']
        });
        break;
    case 'K-Ca':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Ca40Ca44'],
            'lambda': ['K40']
        });
        break;
    case 'Sm-Nd':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Sm144Sm152', 'Sm147Sm152', 'Sm148Sm152',
            'Sm149Sm152', 'Sm150Sm152', 'Sm154Sm152', 'Nd142Nd144',
            'Nd143Nd144', 'Nd145Nd144', 'Nd146Nd144', 'Nd148Nd144',
            'Nd150Nd144'],
            'lambda': ['Sm147']
        });
        break;
    case 'Re-Os':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Os184Os192', 'Os186Os192', 'Os187Os192',
            'Os188Os192', 'Os190Os192'],
            'lambda': ['Re187']
        });
        break;
    case 'Rb-Sr':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Rb85Rb87', 'Sr84Sr86', 'Sr87Sr86', 'Sr88Sr86'],
            'lambda': ['Rb87']
        });
        break;
    case 'Lu-Hf':
        applySettings(input.settings, prefs.constants, {
            'iratio': ['Lu176Lu175', 'Hf174Hf177', 'Hf176Hf177',
            'Hf178Hf177', 'Hf179Hf177', 'Hf180Hf177'],
            'lambda': ['Lu176']
        });
        break;
    case 'U-Th-He': 
        applySettings(input.settings, prefs.constants, {
            'iratio': ['U238U235'],
            'lambda': ['U238', 'U235', 'Th232', 'Sm147']
        });
        break;
    case 'fissiontracks':
        if (prefs.settings.fissiontracks.format == 3){
            var mineral = prefs.settings.fissiontracks.mineral;
            applySettings(input.settings, prefs.constants, {
                'iratio': ['U238U235'],
                'lambda': ['U238', 'fission'],
                'etchfact': [mineral],
                'tracklength': [mineral],
                'mindens': [mineral]
            });
        }
        break;
    case 'detritals':
        break;
    }
    if ((plotdevice != 'ages') && (plotdevice != 'set-zeta')){
        input.cex = prefs.settings.par.cex;
    }
    switch (plotdevice){
    case 'concordia': 
        input.fn = 'concordia';
        break;
    case 'evolution': 
        input.fn = 'evolution';
        break;
    case 'regression':
        input.york = { format: prefs.settings.other.format };
    case 'isochron':
        input.fn = 'isochron';
        break;
    case 'radial':
        input.fn = 'radialplot';
        break;
    case 'spectrum':
        input.fn = 'agespectrum';
        break;
    case 'average':
        input.fn = 'weightedmean';
        break;
    case 'KDE':
        input.fn = 'kde';
        break;
    case 'CAD':
        input.fn = 'cad';
        break;
    case 'set-zeta':
        input.fn = 'set.zeta';
        break;
    case 'helioplot':
        input.fn = 'helioplot';
        break;
    case 'MDS':
        input.fn = 'mds';
        break;
    case 'ages':
        input.fn = 'age';
        break;
    }
    return input;
}
