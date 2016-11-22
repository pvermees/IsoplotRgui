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
	if (geochronometer=="U-Pb"){
	    out += ",cutoff.76=" + settings.cutoff76;
	    out += ",cutoff.disc=c(" + settings.mindisc + "," + settings.maxdisc + ")";
	}
	break;
    case 'isochron':
	out += ",inverse=" + settings.inverse;
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
	if (geochronometer != "other"){
	    out += ",exterr=" + settings.exterr;
	}
	out += ",detect.outliers=" + settings.outliers;
	out += ",alpha=" + settings.alpha;
	out += ",sigdig=" + settings.sigdig;
	break;
    case 'spectrum':
	if (geochronometer != "other"){
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
	if (geochronometer=="detritals"){
	    out += ",samebandwidth=" + settings.samebandwidth;
	    out += ",normalise=" + settings.normalise;
	    if (settings.pchdetritals!='none') { out += ",pch=" + settings.pchdetritals; }
	} else if (geochronometer=="U-Pb"){
	    if (settings.pch!='none') { out += ",pch=" + settings.pch; }
	    out += ",cutoff.76=" + settings.cutoff76;
	    out += ",cutoff.disc=c(" + settings.mindisc + "," + settings.maxdisc + ")";
	} else {
	    if (settings.pch!='none') { out += ",pch=" + settings.pch; }
	}
	out += ",log=" + settings.log;
	if (settings.binwidth != 'auto') { out += ",binwidth=" + settings.binwidth; }
	else { out += ",binwidth=NA"; }
	break;
    case 'CAD':
	if (settings.pch!='none') { out += ",pch=" + settings.pch; }
	out += ",verticals=" + settings.verticals;
	if (geochronometer=="U-Pb"){
	    out += ",cutoff.76=" + settings.cutoff76;
	    out += ",cutoff.disc=c(" + settings.mindisc + "," + settings.maxdisc + ")";
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
    if (geochronometer=='Ar-Ar' & plotdevice=='spectrum') { 
	out += ",format=2"; 
    }
    if (geochronometer=='detritals' |
	geochronometer=='fissiontracks') {
	out += ",format=" + prefs.settings[geochronometer].format; 
    }
    out += ");";
    switch (geochronometer){
    case 'U-Pb': 
	out += "IsoplotR::iratio('U238U235',x=" + prefs.constants.iratio.U238U235[0] + 
  	       ",e=" + prefs.constants.iratio.U238U235[1] + ");"
	out += "IsoplotR::lambda('U238',x=" + prefs.constants.lambda.U238[0] + 
  	       ",e=" + prefs.constants.lambda.U238[1] + ");"
	out += "IsoplotR::lambda('U235',x=" + prefs.constants.lambda.U235[0] + 
  	       ",e=" + prefs.constants.lambda.U235[1] + ");"
	break;
    case 'Ar-Ar':
	out += "IsoplotR::iratio('Ar40Ar36',x=" + prefs.constants.iratio.Ar40Ar36[0] + 
     	       ",e=" + prefs.constants.iratio.Ar40Ar36[1] + ");"
	out += "IsoplotR::lambda('K40',x=" + prefs.constants.lambda.K40[0] + 
  	       ",e=" + prefs.constants.lambda.K40[1] + ");"
	break;
    case 'U-Th-He': 
	out += "IsoplotR::iratio('U238U235',x=" + prefs.constants.iratio.U238U235[0] + 
  	       ",e=" + prefs.constants.iratio.U238U235[1] + ");"
	out += "IsoplotR::lambda('U238',x=" + prefs.constants.lambda.U238[0] + 
  	       ",e=" + prefs.constants.lambda.U238[1] + ");"
	out += "IsoplotR::lambda('U235',x=" + prefs.constants.lambda.U235[0] + 
  	       ",e=" + prefs.constants.lambda.U235[1] + ");"
	out += "IsoplotR::lambda('Th232',x=" + prefs.constants.lambda.Th232[0] + 
  	       ",e=" + prefs.constants.lambda.Th232[1] + ");"
	out += "IsoplotR::lambda('Sm147',x=" + prefs.constants.lambda.Sm147[0] + 
  	       ",e=" + prefs.constants.lambda.Sm147[1] + ");"
	break;
    case 'detritals':
	break;
    }
    switch (plotdevice) {
    case 'concordia': 
	out += "IsoplotR::concordia(dat"; 
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
