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

function addAlpha(alpha, colours) {
    var hh = toHh(alpha);
    return colours.map(function(x) { return x + hh; });
}

function getSolidColourRamp(s) {
    switch (s.option) {
    case 'rainbow':
        return ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF'];
    case 'heat':
        return ['#800000', '#FF0000', '#FF8000', '#FFFF00', '#FFFF88', '#FFFFFF'];
    case 'viridis':
        return ['#440154', '#46337E', '#365C8D', '#277F8E', '#1FA187', '#4AC16D', '#9FDA3A', '#FDE725'];
    case 'rocket':
        return ['#03051A', '#36193E', '#701F57', '#AE1759', '#E13342', '#F37651', '#F6B48E', '#FAEBDD'];
    }
    return [s.ramp_start, s.ramp_end];
}

function getColourRampUpwards(s) {
    var alpha = typeof(s.alpha) === 'number'? s.alpha : 1;
    if (s.option === 'custom_colour') {
        var col = addAlpha(alpha, [s.ramp_start]);
        col.push(s.ramp_start + '00');
        return col;
    }
    return addAlpha(alpha, getSolidColourRamp(s));
}

function getColourRamp(s, def) {
    if (typeof(s) !== 'object' || !('option' in s)) {
        return def;
    }
    var ramp = getColourRampUpwards(s);
    if (!('reverse' in s && s.reverse)) {
        return ramp;
    }
    var rev = [];
    for (var i = ramp.length - 1; i >= 0; --i) {
        rev.push(ramp[i]);
    }
    return rev;
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
        ellipsefill: getColourRamp(pdsettings.ellipsefill, '#00FF0080'),
        bg: getColourRamp(pdsettings.bg, '#00FF0080'),
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
