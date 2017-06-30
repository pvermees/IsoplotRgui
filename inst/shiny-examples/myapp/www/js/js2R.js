// turns the options into a string to feed into R
function getOptions(prefs){
    var out = "";
    var geochronometer = prefs.settings.geochronometer;
    var plotdevice = prefs.settings.plotdevice;
    var settings = prefs.settings[plotdevice];
    switch (plotdevice){
    case 'concordia':
	var mint = isValidAge(settings.mint) ? settings.mint : null;
	var maxt = isValidAge(settings.maxt) ? settings.maxt : null;
	if (mint != null | maxt != null){
	    out += ",limits=c(";
	    if (mint == null) { out += "0"; } else { out += mint; }
	    if (maxt == null) { out += ",4500)"; } else { out += "," + maxt + ")"; }
	} else {
	    out += ",limits=NULL"
	}
	out += ",alpha=" + settings.alpha;
	out += ",wetherill=" + settings.wetherill;
	out += ",exterr=" + settings.exterr;
	out += ",show.numbers=" + settings.shownumbers;
	out += ",show.age=" + settings.showage;
	out += ",sigdig=" + settings.sigdig;
	break;
    case 'radial':
	out += ",transformation='" + settings.transformation + "'";
	if (settings.numpeaks == 'auto') out += ",k='auto'"
	else if (settings.numpeaks == 'min') out += ",k='min'"
	else out += ",k=" + settings.numpeaks ;
	if (settings.mint != 'auto') out += ",from=" + settings.mint;
	if (settings.t0 != 'auto') out += ",t0=" + settings.t0;
	if (settings.maxt != 'auto') out += ",to=" + settings.maxt;
	out += ",pch=" + settings.pch;
	out += ",cex=" + settings.cex;
	out += ",bg='" + settings.bg + "'";
	out += ",sigdig=" + settings.sigdig;
	switch (geochronometer){
	case 'Ar-Ar':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",i2i=" + prefs.settings[geochronometer].i2i;
	    break;
	case 'U-Pb':
	    out += ",cutoff.76=" + settings.cutoff76;
	    out += ",cutoff.disc=c(" + settings.mindisc + "," + settings.maxdisc + ")";
	default:
	}
	break;
    case 'evolution':
	var transform = (settings.transform=='TRUE');
	if (transform & settings.mint != 'auto' & settings.maxt != 'auto')
	    out += ",xlim=c(" + settings.mint + "," + settings.maxt + ")";
	if (!transform & settings.min08 != 'auto' & settings.max08 != 'auto')
	    out += ",xlim=c(" + settings.min08 + "," + settings.max08 + ")";
	if (settings.min48 != 'auto' & settings.max48 != 'auto')
	    out += ",ylim=c(" + settings.min48 + "," + settings.max48 + ")";
	out += ",alpha=" + settings.alpha;
	out += ",show.numbers=" + settings.shownumbers;
	out += ",sigdig=" + settings.sigdig;
	out += ",transform=" + settings.transform;
	out += ",project=" + settings.project;
	out += ",exterr=" + settings.exterr;
	out += ",isochron=" + settings.isochron;
	break;
    case 'isochron':
	if (geochronometer=='Pb-Pb' | geochronometer=='Ar-Ar'){
	    out += ",inverse=" + settings.inverse;
	}
	out += ",exterr=" + settings.exterr;
    case 'regression':
	if (settings.minx != 'auto' & settings.maxx != 'auto')
	    out += ",xlim=c(" + settings.minx + "," + settings.maxx + ")";
	if (settings.miny != 'auto' & settings.maxy != 'auto')
	    out += ",ylim=c(" + settings.miny + "," + settings.maxy + ")";
	out += ",alpha=" + settings.alpha;
	out += ",show.numbers=" + settings.shownumbers;
	out += ",sigdig=" + settings.sigdig;
	break;
    case 'average':
	if (geochronometer=='Ar-Ar' | geochronometer == 'Rb-Sr' |
	    geochronometer == 'Sm-Nd' | geochronometer == 'Re-Os' |
	    geochronometer == 'Lu-Hf'){
	    out += ",i2i=" + prefs.settings[geochronometer].i2i;
	}
	if (geochronometer != "other"){
	    out += ",exterr=" + settings.exterr;
	}
	out += ",detect.outliers=" + settings.outliers;
	out += ",alpha=" + settings.alpha;
	out += ",sigdig=" + settings.sigdig;
	break;
    case 'spectrum':
	if (geochronometer=='Ar-Ar'){
	    out += ",i2i=" + prefs.settings[geochronometer].i2i;
	    out += ",exterr=" + settings.exterr;
	}
	out += ",plateau=" + settings.plateau;
	out += ",alpha=" + settings.alpha;
	out += ",sigdig=" + settings.sigdig;
	break;
    case 'KDE':
	if (settings.minx != 'auto') { out += ",from=" + settings.minx; }
	else { out += ",from=NA"; }
	if (settings.maxx != 'auto') { out += ",to=" + settings.maxx; }
	else { out += ",to=NA"; }
	if (settings.bandwidth != 'auto') { out += ",bw=" + settings.bandwidth; }
	else { out += ",bw=NA"; }
	out += ",show.hist=" + settings.showhist;
	out += ",adaptive=" + settings.adaptive;
	switch (geochronometer){
	case 'Ar-Ar':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",i2i=" + prefs.settings[geochronometer].i2i;
	    break;
	case 'U-Pb':
	    out += ",cutoff.76=" + settings.cutoff76;
	    out += ",cutoff.disc=c(" + settings.mindisc + "," + settings.maxdisc + ")";
	    break;
	case 'detritals':
	    out += ",samebandwidth=" + settings.samebandwidth;
	    out += ",normalise=" + settings.normalise;
	    if (settings.pchdetritals!='none') { out += ",pch=" + settings.pchdetritals; }
	    break;
	default:
	}
	if (geochronometer!="detritals" & settings.pch!='none'){
	    out += ",pch=" + settings.pch;
	}
	out += ",log=" + settings.log;
	if (settings.binwidth != 'auto') { out += ",binwidth=" + settings.binwidth; }
	else { out += ",binwidth=NA"; }
	break;
    case 'CAD':
	if (settings.pch!='none') { out += ",pch=" + settings.pch; }
	out += ",verticals=" + settings.verticals;
	switch (geochronometer){
	case 'U-Pb':
	    out += ",cutoff.76=" + settings.cutoff76;
	    out += ",cutoff.disc=c(" + settings.mindisc + "," + settings.maxdisc + ")";
	    break;
	case 'Ar-Ar':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",i2i=" + prefs.settings[geochronometer].i2i;
	    break;
	default:
	}
	break;
    case 'set-zeta':
	var data = prefs.settings.data[geochronometer];
	out += ",tst=c(" + data.age[0] +
	             "," + data.age[1] + ")";
	out += ",exterr=" + settings.exterr;
	out += ",sigdig=" + settings.sigdig;
	out += ",update=FALSE";
	break;
    case 'helioplot':
	out += ",logratio=" + settings.logratio;
	out += ",show.numbers=" + settings.shownumbers;
	out += ",show.central.comp=" + settings.showcentralcomp;
	out += ",alpha=" + settings.alpha;
	out += ",sigdig=" + settings.sigdig;
	if (settings.minx != 'auto' & settings.maxx != 'auto')
	    out += ",xlim=c(" + settings.minx + "," + settings.maxx + ")"
	if (settings.miny != 'auto' & settings.maxy != 'auto')
	    out += ",ylim=c(" + settings.miny + "," + settings.maxy + ")"
	if (settings.fact != 'auto')
	    out += ",fact=" + settings.fact;
	break;
    case 'MDS':
	out += ",classical=" + settings.classical;
	out += ",shepard=" + settings.shepard;
	out += ",nnlines=" + settings.nnlines;
	if (settings.ticks=='FALSE') out += ",xaxt='n',yaxt='n'";
	if (settings.pch!='none') { out += ",pch=" + settings.pch; }
	out += ",cex.symbols=" + settings.cex;
	if (settings.pos==1 | settings.pos==2 | settings.pos==3 | settings.pos==4) 
	    out += ",pos=" + settings.pos;
	out += ",col='" + settings.col + "'";
	out += ",bg='" + settings.bg + "'";
	break;
    case 'ages':
	if (geochronometer != 'U-Th-He')
	    out += ",exterr=" + settings.exterr;
	switch (geochronometer){
	case 'Ar-Ar':
	case 'Pb-Pb':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",isochron=FALSE";
	    out += ",i2i=" + prefs.settings[geochronometer].i2i;
	    break;
	default:
	}
	out += ",sigdig=" + settings.sigdig;
	break;
    default: // do nothing
    }
    return out;
}

function getRcommand(prefs){
    var geochronometer = prefs.settings.geochronometer;
    var plotdevice = prefs.settings.plotdevice;
    var options = getOptions(prefs);
    var out = "dat <- selection2data(method='" + geochronometer + "'";
    if (geochronometer=='detritals' |
	geochronometer=='fissiontracks' |
	geochronometer=='U-Pb'  |
	geochronometer=='Pb-Pb' |
	geochronometer=='Ar-Ar' |
	geochronometer=='Th-U'  |
	geochronometer=='Rb-Sr' |
        geochronometer=='Sm-Nd' |
        geochronometer=='Re-Os' |
        geochronometer=='Lu-Hf') {
	out += ",format=" + prefs.settings[geochronometer].format; 
    }
    out += ");";
    switch (geochronometer){
    case 'U-Pb':
    case 'Pb-Pb':
	out += "IsoplotR::settings('iratio','U238U235'," +
	    prefs.constants.iratio.U238U235[0] + "," +
	    prefs.constants.iratio.U238U235[1] + ");"
	out += "IsoplotR::settings('lambda','U238'," +
	    prefs.constants.lambda.U238[0] + "," +
	    prefs.constants.lambda.U238[1] + ");"
	out += "IsoplotR::settings('lambda','U235'," +
	    prefs.constants.lambda.U235[0] + "," +
	    prefs.constants.lambda.U235[1] + ");"
	break;
    case 'Th-U':
	out += "IsoplotR::settings('lambda','Th230'," +
	    prefs.constants.lambda.Th230[0] + "," +
	    prefs.constants.lambda.Th230[1] + ");"
	out += "IsoplotR::settings('lambda','U234'," +
	    prefs.constants.lambda.U234[0] + "," +
	    prefs.constants.lambda.U234[1] + ");"
	break;
    case 'Ar-Ar':
	out += "IsoplotR::settings('iratio','Ar40Ar36'," +
	    prefs.constants.iratio.Ar40Ar36[0] + "," +
	    prefs.constants.iratio.Ar40Ar36[1] + ");"
	out += "IsoplotR::settings('lambda','K40'," +
	    prefs.constants.lambda.K40[0] + "," +
	    prefs.constants.lambda.K40[1] + ");"
	break;
    case 'Sm-Nd':
	out += "IsoplotR::settings('iratio','Sm144Sm152'," +
	    prefs.constants.iratio.Sm144Sm152[0] + "," +
	    prefs.constants.iratio.Sm144Sm152[1] + ");"
	out += "IsoplotR::settings('iratio','Sm147Sm152'," +
	    prefs.constants.iratio.Sm147Sm152[0] + "," +
	    prefs.constants.iratio.Sm147Sm152[1] + ");"
	out += "IsoplotR::settings('iratio','Sm148Sm152'," +
	    prefs.constants.iratio.Sm148Sm152[0] + "," +
	    prefs.constants.iratio.Sm148Sm152[1] + ");"
	out += "IsoplotR::settings('iratio','Sm149Sm152'," +
	    prefs.constants.iratio.Sm149Sm152[0] + "," +
	    prefs.constants.iratio.Sm149Sm152[1] + ");"
	out += "IsoplotR::settings('iratio','Sm150Sm152'," +
	    prefs.constants.iratio.Sm150Sm152[0] + "," +
	    prefs.constants.iratio.Sm150Sm152[1] + ");"
	out += "IsoplotR::settings('iratio','Sm154Sm152'," +
	    prefs.constants.iratio.Sm154Sm152[0] + "," +
	    prefs.constants.iratio.Sm154Sm152[1] + ");"
	out += "IsoplotR::settings('iratio','Nd142Nd144'," +
	    prefs.constants.iratio.Nd142Nd144[0] + "," +
	    prefs.constants.iratio.Nd142Nd144[1] + ");"
	out += "IsoplotR::settings('iratio','Nd143Nd144'," +
	    prefs.constants.iratio.Nd143Nd144[0] + "," +
	    prefs.constants.iratio.Nd143Nd144[1] + ");"
	out += "IsoplotR::settings('iratio','Nd145Nd144'," +
	    prefs.constants.iratio.Nd145Nd144[0] + "," +
	    prefs.constants.iratio.Nd145Nd144[1] + ");"
	out += "IsoplotR::settings('iratio','Nd146Nd144'," +
	    prefs.constants.iratio.Nd146Nd144[0] + "," +
	    prefs.constants.iratio.Nd146Nd144[1] + ");"
	out += "IsoplotR::settings('iratio','Nd148Nd144'," +
	    prefs.constants.iratio.Nd148Nd144[0] + "," +
	    prefs.constants.iratio.Nd148Nd144[1] + ");"
	out += "IsoplotR::settings('iratio','Nd150Nd144'," +
	    prefs.constants.iratio.Nd150Nd144[0] + "," +
	    prefs.constants.iratio.Nd150Nd144[1] + ");"
	out += "IsoplotR::settings('lambda','Sm147'," +
	    prefs.constants.lambda.Sm147[0] + "," +
	    prefs.constants.lambda.Sm147[1] + ");"	
	break;
    case 'Re-Os':
	out += "IsoplotR::settings('iratio','Os184Os192'," +
	    prefs.constants.iratio.Os184Os192[0] + "," +
	    prefs.constants.iratio.Os184Os192[1] + ");"
	out += "IsoplotR::settings('iratio','Os186Os192'," +
	    prefs.constants.iratio.Os186Os192[0] + "," +
	    prefs.constants.iratio.Os186Os192[1] + ");"
	out += "IsoplotR::settings('iratio','Os187Os192'," +
	    prefs.constants.iratio.Os187Os192[0] + "," +
	    prefs.constants.iratio.Os187Os192[1] + ");"
	out += "IsoplotR::settings('iratio','Os188Os192'," +
	    prefs.constants.iratio.Os188Os192[0] + "," +
	    prefs.constants.iratio.Os188Os192[1] + ");"
	out += "IsoplotR::settings('iratio','Os190Os192'," +
	    prefs.constants.iratio.Os190Os192[0] + "," +
	    prefs.constants.iratio.Os190Os192[1] + ");"
	out += "IsoplotR::settings('lambda','Re187'," +
	    prefs.constants.lambda.Re187[0] + "," +
	    prefs.constants.lambda.Re187[1] + ");"	
	break;
    case 'Rb-Sr':
	out += "IsoplotR::settings('iratio','Rb85Rb87'," +
	    prefs.constants.iratio.Rb85Rb87[0] + "," +
	    prefs.constants.iratio.Rb85Rb87[1] + ");"
	out += "IsoplotR::settings('iratio','Sr84Sr86'," +
	    prefs.constants.iratio.Sr84Sr86[0] + "," +
	    prefs.constants.iratio.Sr84Sr86[1] + ");"
	out += "IsoplotR::settings('iratio','Sr87Sr86'," +
	    prefs.constants.iratio.Sr87Sr86[0] + "," +
	    prefs.constants.iratio.Sr87Sr86[1] + ");"
	out += "IsoplotR::settings('iratio','Sr88Sr86'," +
	    prefs.constants.iratio.Sr88Sr86[0] + "," +
	    prefs.constants.iratio.Sr88Sr86[1] + ");"
	out += "IsoplotR::settings('lambda','Rb87'," +
	    prefs.constants.lambda.Rb87[0] + "," +
	    prefs.constants.lambda.Rb87[1] + ");"
	break;
    case 'Lu-Hf':
	out += "IsoplotR::settings('iratio','Lu176Lu175'," +
	    prefs.constants.iratio.Lu176Lu175[0] + "," +
	    prefs.constants.iratio.Lu176Lu175[1] + ");"
	out += "IsoplotR::settings('iratio','Hf174Hf177'," +
	    prefs.constants.iratio.Hf174Hf177[0] + "," +
	    prefs.constants.iratio.Hf174Hf177[1] + ");"
	out += "IsoplotR::settings('iratio','Hf176Hf177'," +
	    prefs.constants.iratio.Hf176Hf177[0] + "," +
	    prefs.constants.iratio.Hf176Hf177[1] + ");"
	out += "IsoplotR::settings('iratio','Hf178Hf177'," +
	    prefs.constants.iratio.Hf178Hf177[0] + "," +
	    prefs.constants.iratio.Hf178Hf177[1] + ");"
	out += "IsoplotR::settings('iratio','Hf179Hf177'," +
	    prefs.constants.iratio.Hf179Hf177[0] + "," +
	    prefs.constants.iratio.Hf179Hf177[1] + ");"
	out += "IsoplotR::settings('iratio','Hf180Hf177'," +
	    prefs.constants.iratio.Hf180Hf177[0] + "," +
	    prefs.constants.iratio.Hf180Hf177[1] + ");"
	out += "IsoplotR::settings('lambda','Lu176'," +
	    prefs.constants.lambda.Lu176[0] + "," +
	    prefs.constants.lambda.Lu176[1] + ");"
	break;
    case 'U-Th-He': 
	out += "IsoplotR::settings('iratio','U238U235'," +
	    prefs.constants.iratio.U238U235[0] + "," +
	    prefs.constants.iratio.U238U235[1] + ");"
	out += "IsoplotR::settings('lambda','U238'," +
	    prefs.constants.lambda.U238[0] + "," +
	    prefs.constants.lambda.U238[1] + ");"
	out += "IsoplotR::settings('lambda','U235'," +
	    prefs.constants.lambda.U235[0] + "," +
	    prefs.constants.lambda.U235[1] + ");"
	out += "IsoplotR::settings('lambda','Th232'," +
	    prefs.constants.lambda.Th232[0] + "," +
	    prefs.constants.lambda.Th232[1] + ");"
	out += "IsoplotR::settings('lambda','Sm147'," +
	    prefs.constants.lambda.Sm147[0] + "," +
	    prefs.constants.lambda.Sm147[1] + ");"
	break;
    case 'fissiontracks':
	if (prefs.settings.fissiontracks.format == 3){
	    var mineral = prefs.settings.fissiontracks.mineral;
	    out += "IsoplotR::settings('iratio','U238U235'," +
		prefs.constants.iratio.U238U235[0] + "," +
		prefs.constants.iratio.U238U235[1] + ");"
	    out += "IsoplotR::settings('lambda','U238'," +
		prefs.constants.lambda.U238[0] + "," +
		prefs.constants.lambda.U238[1] + ");"
	    out += "IsoplotR::settings('lambda','fission'," +
		prefs.constants.lambda.fission[0] + "," +
		prefs.constants.lambda.fission[1] + ");"
	    out += "IsoplotR::settings('etchfact','" + mineral + "'," +
		prefs.constants.etchfact[mineral] + ");"
	    out += "IsoplotR::settings('tracklength','" + mineral + "'," +
		prefs.constants.tracklength[mineral] + ");"
	    out += "IsoplotR::settings('mindens','" + mineral + "'," +
		prefs.constants.mindens[mineral] + ");"
	}	
	break;
    case 'detritals':
	break;
    }
    switch (plotdevice) {
    case 'concordia': 
	out += "IsoplotR::concordia(dat"; 
	break;
    case 'evolution': 
	out += "IsoplotR::evolution(dat"; 
	break;
    case 'isochron':
    case 'regression':
	out += "IsoplotR::isochron(dat";
	break;
    case 'radial':
	out += "IsoplotR::radialplot(dat"
	break;
    case 'spectrum':
	out += "IsoplotR::agespectrum(dat"
	break;
    case 'average':
	out += "IsoplotR::weightedmean(dat"
	break;
    case 'KDE':
	out += "IsoplotR::kde(dat";
	break;
    case 'CAD':
	out += "IsoplotR::cad(dat";
	break;
    case 'set-zeta':
	out += "IsoplotR::set.zeta(dat";
	break;
    case 'helioplot':
	out += "IsoplotR::helioplot(dat";
	break;
    case 'MDS':
	out += "IsoplotR::mds(dat";
	break;
    case 'ages':
	out += "IsoplotR::age(dat";
	break;
    }
    out += options +");"
    return out;
}
