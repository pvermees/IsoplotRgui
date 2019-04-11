// turns the options into a string to feed into R
function getOptions(prefs){
    var out = "";
    var geochronometer = prefs.settings.geochronometer;
    var plotdevice = prefs.settings.plotdevice;
    var pdsettings = prefs.settings[plotdevice];
    var gcsettings = prefs.settings[geochronometer];
    switch (plotdevice){
    case 'concordia':
	var mint = check(pdsettings.mint,null);
	var maxt = check(pdsettings.maxt,null);
	if (mint != null | maxt != null){
	    out += ",tlim=c(";
	    if (mint == null) { out += "0"; } else { out += mint; }
	    if (maxt == null) { out += ",4500)"; } else { out += "," + maxt + ")"; }
	} else {
	    out += ",tlim=NULL"
	}
	if (pdsettings.minx != 'auto' & pdsettings.maxx != 'auto'){
	    out += ",xlim=c(" + pdsettings.minx + "," + pdsettings.maxx + ")";
	}
	if (pdsettings.miny != 'auto' & pdsettings.maxy != 'auto'){
	    out += ",ylim=c(" + pdsettings.miny + "," + pdsettings.maxy + ")";
	}
	if (pdsettings.ticks != 'auto'){
	    out += ",ticks=c(" + pdsettings.ticks + ")";
	}
	out += ",alpha=" + pdsettings.alpha;
	out += ",wetherill=" + pdsettings.wetherill;
	out += ",exterr=" + pdsettings.exterr;
	out += ",show.numbers=" + pdsettings.shownumbers;
	out += ",show.age=" + pdsettings.showage;
	out += ",sigdig=" + pdsettings.sigdig;
	out += ",common.Pb=" + gcsettings.commonPb;
	out += ",ellipse.col=c(" + pdsettings.bg1 + "," + pdsettings.bg2 + ")";
	out += ",levels=selection2levels(method='" + geochronometer + "'";
	out += ",format=" + gcsettings.format + ")";
	out += ",omit=omitter(flags='x',method='" + geochronometer + "'";
	out += ",format=" + gcsettings.format + ")";
	out += ",hide=omitter(flags='X',method='" + geochronometer + "'";
	out += ",format=" + gcsettings.format + ")";
	out += ",clabel='" + pdsettings.clabel + "'";
	if (pdsettings.anchor==1){
	    out += ",anchor=list(TRUE," + pdsettings.tanchor + ")";
	} else if (pdsettings.anchor==2){
	    out += ",anchor=list(TRUE,NA)";
	}
	break;
    case 'radial':
	out += ",transformation='" + pdsettings.transformation + "'";
	if (geochronometer=='U-Th-He'){
	    out += ",levels=selection2levels(method='" + geochronometer + "')";
	    out += ",omit=omitter(flags='x',method='" + geochronometer + "')";
	    out += ",hide=omitter(flags='X',method='" + geochronometer + "')";
	} else {
	    out += ",levels=selection2levels(method='" + geochronometer + "'";
	    out += ",format=" + gcsettings.format + ")";
	    out += ",omit=omitter(flags='x',method='" + geochronometer + "'";
	    out += ",format=" + gcsettings.format + ")";
	    out += ",hide=omitter(flags='X',method='" + geochronometer + "'";
	    out += ",format=" + gcsettings.format + ")";
	}
	if (pdsettings.numpeaks == 'auto') out += ",k='auto'"
	else if (pdsettings.numpeaks == 'min') out += ",k='min'"
	else out += ",k=" + pdsettings.numpeaks ;
	if (pdsettings.mint != 'auto') out += ",from=" + pdsettings.mint;
	if (pdsettings.t0 != 'auto') out += ",t0=" + pdsettings.t0;
	if (pdsettings.maxt != 'auto') out += ",to=" + pdsettings.maxt;
	out += ",pch=" + pdsettings.pch;
	out += ",cex=" + pdsettings.cex;
	out += ",bg=c(" + pdsettings.bg1 + "," + pdsettings.bg2 + ")";
	out += ",alpha=" + pdsettings.alpha;
	out += ",sigdig=" + pdsettings.sigdig;
	out += ",show.numbers=" + pdsettings.shownumbers;
	out += ",clabel='" + pdsettings.clabel + "'";
	switch (geochronometer){
	case 'Th-U':
	    out += ",detritus=" + gcsettings.detritus;
	case 'Ar-Ar':
	case 'K-Ca':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",i2i=" + gcsettings.i2i;
	    break;
	case 'U-Pb':
	    var type = gcsettings.type;
	    out += ",type=" + type;
	    if (type==4) { out += ",cutoff.76=" + gcsettings.cutoff76; }
	    out += ",cutoff.disc=c(" + gcsettings.mindisc + "," + gcsettings.maxdisc + ")";
	case 'Pb-Pb':
	    out += ",common.Pb=" + gcsettings.commonPb;
	default:
	}
	break;
    case 'evolution':
	var transform = (pdsettings.transform=='TRUE');
	if (transform & pdsettings.mint != 'auto' & pdsettings.maxt != 'auto')
	    out += ",xlim=c(" + pdsettings.mint + "," + pdsettings.maxt + ")";
	if (!transform & pdsettings.min08 != 'auto' & pdsettings.max08 != 'auto')
	    out += ",xlim=c(" + pdsettings.min08 + "," + pdsettings.max08 + ")";
	if (pdsettings.min48 != 'auto' & pdsettings.max48 != 'auto')
	    out += ",ylim=c(" + pdsettings.min48 + "," + pdsettings.max48 + ")";
	out += ",alpha=" + pdsettings.alpha;
	out += ",show.numbers=" + pdsettings.shownumbers;
	out += ",sigdig=" + pdsettings.sigdig;
	out += ",transform=" + pdsettings.transform;
	out += ",detritus=" + gcsettings.detritus;
	out += ",exterr=" + pdsettings.exterr;
	out += ",isochron=" + pdsettings.isochron;
	out += ",levels=selection2levels(method='" + geochronometer + "'";
	out += ",format=" + gcsettings.format + ")";
	out += ",omit=omitter(flags='x',method='" + geochronometer + "'";
	out += ",format=" + gcsettings.format + ")";
	out += ",hide=omitter(flags='X',method='" + geochronometer + "'";
	out += ",format=" + gcsettings.format + ")";
	out += ",ellipse.col=c(" + pdsettings.bg1 + "," + pdsettings.bg2 + ")";
	out += ",model=" + pdsettings.model;
	out += ",clabel='" + pdsettings.clabel + "'";
	break;
    case 'isochron':
	if (geochronometer=='Pb-Pb' | geochronometer=='Ar-Ar')
	    out += ",inverse=" + pdsettings.inverse;
	if (geochronometer=='Pb-Pb')
	    out += ",growth=" + pdsettings.growth;
	if (geochronometer=='Th-U')
	    out += ",type=" + pdsettings.type;
	if (geochronometer!='U-Th-He')
	    out += ",exterr=" + pdsettings.exterr;
    case 'regression':
	if (pdsettings.minx != 'auto' & pdsettings.maxx != 'auto')
	    out += ",xlim=c(" + pdsettings.minx + "," + pdsettings.maxx + ")";
	if (pdsettings.miny != 'auto' & pdsettings.maxy != 'auto')
	    out += ",ylim=c(" + pdsettings.miny + "," + pdsettings.maxy + ")";
	out += ",alpha=" + pdsettings.alpha;
	out += ",show.numbers=" + pdsettings.shownumbers;
	out += ",sigdig=" + pdsettings.sigdig;
	out += ",model=" + pdsettings.model;
	out += ",clabel='" + pdsettings.clabel + "'";
	if (geochronometer=='other'){
	    out += ",levels=selection2levels(method='regression'";
	} else {
	    out += ",levels=selection2levels(method='" + geochronometer + "'";
	}
	if (geochronometer=='U-Th-He'){
	    out += ")";
	} else {
	    out += ",format=" + gcsettings.format + ")";
	}
	if (geochronometer=='other'){
	    out += ",omit=omitter(flags='x',method='regression'";
	} else {
	    out += ",omit=omitter(flags='x',method='" + geochronometer + "'";
	}
	if (geochronometer=='U-Th-He'){
	    out += ")";
	} else {
	    out += ",format=" + gcsettings.format + ")";
	}
	if (geochronometer=='other'){
	    out += ",hide=omitter(flags='X',method='regression'";
	} else {
	    out += ",hide=omitter(flags='X',method='" + geochronometer + "'";
	}
	if (geochronometer=='U-Th-He'){
	    out += ")";
	} else {
	    out += ",format=" + gcsettings.format + ")";
	}
	out += ",ellipse.col=c(" + pdsettings.bg1 + "," + pdsettings.bg2 + ")";
	break;
    case 'average':
	switch (geochronometer){
	case 'Th-U':
	    out += ",detritus=" + gcsettings.detritus;
	case 'Ar-Ar':
	case 'K-Ca':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",i2i=" + gcsettings.i2i;
	    break;
	case 'U-Pb':
	    var type = gcsettings.type;
	    out += ",type=" + type;
	    if (type==4) { out += ",cutoff.76=" + gcsettings.cutoff76; }
	    out += ",cutoff.disc=c(" + gcsettings.mindisc + "," + gcsettings.maxdisc + ")";
	case 'Pb-Pb':
	    out += ",common.Pb=" + gcsettings.commonPb;
	    break;
	}
	if (geochronometer != "other" &
	    geochronometer != "Th-U" &
	    geochronometer != 'U-Th-He'){
	    out += ",exterr=" + pdsettings.exterr;
	}
	out += ",detect.outliers=" + pdsettings.outliers;
	out += ",alpha=" + pdsettings.alpha;
	out += ",sigdig=" + pdsettings.sigdig;
	out += ",random.effects=" + pdsettings.randomeffects;
	out += ",ranked=" + pdsettings.ranked;
	out += ",levels=selection2levels(method='" + geochronometer + "'";
	if (geochronometer!='U-Th-He'){
	    out += ",format=" + gcsettings.format;
	}
	out += ")";
	out += ",rect.col=c(" + pdsettings.bg1 + "," + pdsettings.bg2 + ")";	
	out += ",outlier.col=" + pdsettings.bg3;
	out += ",clabel='" + pdsettings.clabel + "'";
	if (pdsettings.mint != 'auto') out += ",from=" + pdsettings.mint;
	if (pdsettings.maxt != 'auto') out += ",to=" + pdsettings.maxt;
	if (geochronometer=='U-Th-He'){
	    out += ",omit=omitter(flags='x',method='" + geochronometer + "')";
	} else {
	    out += ",omit=omitter(flags='x',method='" + geochronometer + "'";
	    out += ",format=" + gcsettings.format + ")";
	}
	if (geochronometer=='U-Th-He'){
	    out += ",hide=omitter(flags='X',method='" + geochronometer + "')";
	} else {
	    out += ",hide=omitter(flags='X',method='" + geochronometer + "'";
	    out += ",format=" + gcsettings.format + ")";
	}
	break;
    case 'spectrum':
	if (geochronometer=='Ar-Ar'){
	    out += ",i2i=" + gcsettings.i2i;
	    out += ",exterr=" + pdsettings.exterr;
	}
	out += ",plateau=" + pdsettings.plateau;
	out += ",random.effects=" + pdsettings.randomeffects;
	out += ",alpha=" + pdsettings.alpha;
	out += ",sigdig=" + pdsettings.sigdig;
	out += ",levels=selection2levels(method='" + geochronometer + "'";
	out += ",format=" + gcsettings.format + ")";
	out += ",plateau.col=c(" + pdsettings.bg1 + "," + pdsettings.bg2 + ")";	
	out += ",non.plateau.col=" + pdsettings.bg3;
	out += ",clabel='" + pdsettings.clabel + "'";
	if (geochronometer=='other'){
	    out += ",hide=omitter(flags=c('x','X'),method='" + geochronometer + "')";
	} else {
	    out += ",hide=omitter(flags=c('x','X'),method='" + geochronometer + "'";
	    out += ",format=" + gcsettings.format + ")";	    
	}
	break;
    case 'KDE':
	if (pdsettings.minx != 'auto') { out += ",from=" + pdsettings.minx; }
	else { out += ",from=NA"; }
	if (pdsettings.maxx != 'auto') { out += ",to=" + pdsettings.maxx; }
	else { out += ",to=NA"; }
	if (pdsettings.bandwidth != 'auto') { out += ",bw=" + pdsettings.bandwidth; }
	else { out += ",bw=NA"; }
	out += ",show.hist=" + pdsettings.showhist;
	out += ",adaptive=" + pdsettings.adaptive;
	switch (geochronometer){
	case 'Th-U':
	    out += ",detritus=" + gcsettings.detritus;
	case 'Ar-Ar':
	case 'K-Ca':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",i2i=" + gcsettings.i2i;
	    break;
	case 'U-Pb':
	    var type = gcsettings.type;
	    out += ",type=" + type;
	    if (type==4) { out += ",cutoff.76=" + gcsettings.cutoff76; }
	    out += ",cutoff.disc=c(" + gcsettings.mindisc + "," + gcsettings.maxdisc + ")";
	case 'Pb-Pb':
	    out += ",common.Pb=" + gcsettings.commonPb;
	    break;
	case 'detritals':
	    out += ",samebandwidth=" + pdsettings.samebandwidth;
	    out += ",normalise=" + pdsettings.normalise;
	    if (pdsettings.pchdetritals!='none') {
		out += ",pch=" + pdsettings.pchdetritals; }
	    break;
	default:
	}
	if (geochronometer!="detritals" & pdsettings.pch!='none'){
	    out += ",pch=" + pdsettings.pch;
	}
	out += ",log=" + pdsettings.log;
	if (pdsettings.binwidth != 'auto') { out += ",binwidth=" + pdsettings.binwidth; }
	else { out += ",binwidth=NA"; }
	if (geochronometer=='U-Th-He'){
	    out += ",hide=omitter(flags=c('x','X'),method='" + geochronometer + "')";
	} else if (geochronometer=='detritals'){
	    out += ",hide=c(" + gcsettings.hide + ')';
	} else {
	    out += ",hide=omitter(flags=c('x','X'),method='" + geochronometer + "'";
	    out += ",format=" + gcsettings.format + ")";
	}
	break;
    case 'CAD':
	if (pdsettings.pch!='none') { out += ",pch=" + pdsettings.pch; }
	out += ",verticals=" + pdsettings.verticals;
	switch (geochronometer){
	case 'Th-U':
	    out += ",detritus=" + gcsettings.detritus;
	case 'Ar-Ar':
	case 'K-Ca':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",i2i=" + gcsettings.i2i;
	    break;
	case 'U-Pb':
	    var type = gcsettings.type;
	    out += ",type=" + type;
	    if (type==4) { out += ",cutoff.76=" + gcsettings.cutoff76; }
	    out += ",cutoff.disc=c(" + gcsettings.mindisc + "," + gcsettings.maxdisc + ")";
	case 'Pb-Pb':
	    out += ",common.Pb=" + gcsettings.commonPb;
	    break;
	default:
	}
	if (geochronometer=='U-Th-He'){
	    out += ",hide=omitter(flags=c('x','X'),method='" + geochronometer + "')";
	} else if (geochronometer=='detritals'){
	    out += ",hide=c(" + gcsettings.hide + ')';
	} else {
	    out += ",hide=omitter(flags=c('x','X'),method='" + geochronometer + "'";
	    out += ",format=" + gcsettings.format + ")";
	}
	break;
    case 'set-zeta':
	var data = prefs.settings.data[geochronometer];
	out += ",tst=c(" + data.age[0] +
	             "," + data.age[1] + ")";
	out += ",exterr=" + pdsettings.exterr;
	out += ",sigdig=" + pdsettings.sigdig;
	out += ",update=FALSE";
	break;
    case 'helioplot':
	out += ",logratio=" + pdsettings.logratio;
	out += ",show.numbers=" + pdsettings.shownumbers;
	out += ",show.central.comp=" + pdsettings.showcentralcomp;
	out += ",alpha=" + pdsettings.alpha;
	out += ",sigdig=" + pdsettings.sigdig;
	if (pdsettings.minx != 'auto' & pdsettings.maxx != 'auto')
	    out += ",xlim=c(" + pdsettings.minx + "," + pdsettings.maxx + ")"
	if (pdsettings.miny != 'auto' & pdsettings.maxy != 'auto')
	    out += ",ylim=c(" + pdsettings.miny + "," + pdsettings.maxy + ")"
	if (pdsettings.fact != 'auto')
	    out += ",fact=" + pdsettings.fact;
	out += ",levels=selection2levels(method='" + geochronometer + "')";
	out += ",omit=omitter(flags='x',method='" + geochronometer + "')";
	out += ",hide=omitter(flags='X',method='" + geochronometer + "')";
	out += ",ellipse.col=c(" + pdsettings.bg1 + "," + pdsettings.bg2 + ")";
	out += ",model=" + pdsettings.model;
	out += ",clabel='" + pdsettings.clabel + "'";
	break;
    case 'MDS':
	out += ",classical=" + pdsettings.classical;
	out += ",shepard=" + pdsettings.shepard;
	out += ",nnlines=" + pdsettings.nnlines;
	if (pdsettings.ticks=='FALSE') out += ",xaxt='n',yaxt='n'";
	if (pdsettings.pch=='none') { out += ",pch=NA"; }
	else { out += ",pch=" + pdsettings.pch; }
	out += ",cex=" + pdsettings.cex;
	if (pdsettings.pos==1 | pdsettings.pos==2 | pdsettings.pos==3 | pdsettings.pos==4) 
	    out += ",pos=" + pdsettings.pos;
	out += ",col='" + pdsettings.col + "'";
	out += ",bg='" + pdsettings.bg + "'";
	out += ",hide=c(" + gcsettings.hide + ')';
	break;
    case 'ages':
	if (geochronometer == 'U-Pb')
	    out += ",show.p=" + pdsettings.show_p;
	if (geochronometer != 'U-Th-He')
	    out += ",exterr=" + pdsettings.exterr;
	switch (geochronometer){
	case 'Th-U':
	    out += ",detritus=" + gcsettings.detritus;
	case 'Ar-Ar':
	case 'K-Ca':
	case 'Pb-Pb':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    out += ",isochron=FALSE";
	    out += ",i2i=" + gcsettings.i2i;
	    break;
	case 'U-Pb':
	case 'Pb-Pb':
	    out += ",common.Pb=" + gcsettings.commonPb;
	    break;
	default:
	}
	out += ",sigdig=" + pdsettings.sigdig;
	break;
    default: // do nothing
    }
    return out;
}

function concatenate(vector){
    var out = "c(" + vector[0];
    for (i=1; i<vector.length; i++){
	out += "," + vector[i];
    }
    out += ")";
    return out;
}

function getRcommand(prefs){
    var geochronometer = prefs.settings.geochronometer;
    var plotdevice = prefs.settings.plotdevice;
    var options = getOptions(prefs);
    var gcsettings = prefs.settings[geochronometer];
    var out = "dat <- selection2data(method='" + geochronometer + "'";
    if (geochronometer=='detritals' |
	geochronometer=='fissiontracks' |
	geochronometer=='U-Pb'  |
	geochronometer=='Pb-Pb' |
	geochronometer=='Ar-Ar' |
	geochronometer=='K-Ca' |
	geochronometer=='Th-U'  |
	geochronometer=='Rb-Sr' |
        geochronometer=='Sm-Nd' |
        geochronometer=='Re-Os' |
        geochronometer=='Lu-Hf') {
	out += ",format=" + gcsettings.format;
    } else if (geochronometer=='other'){
	out += ",format='" + plotdevice + "'";
    }
    if (geochronometer=='U-Pb' && gcsettings.diseq=='TRUE'){
	out += ",U48=" + gcsettings.U48;
	out += ",Th0U8=" + gcsettings.Th0U8;
	out += ",Ra6U8=" + gcsettings.Ra6U8;
	out += ",Pa1U5=" + gcsettings.Pa1U5;
    } else if (geochronometer=='Th-U'){
	out += ",Th02=" + concatenate(gcsettings.Th02);
	out += ",Th02U48=" + concatenate(gcsettings.Th02U48);
    }
    out += ",ierr=" + prefs.settings.ierr;
    out += ");";
    switch (geochronometer){
    case 'U-Pb':
	out += "IsoplotR::settings('iratio','Pb207Pb206'," +
	    prefs.constants.iratio.Pb207Pb206[0] + ");"
    case 'Pb-Pb':
	out += "IsoplotR::settings('iratio','Pb206Pb204'," +
	    prefs.constants.iratio.Pb206Pb204[0] + ");"
	out += "IsoplotR::settings('iratio','Pb207Pb204'," +
	    prefs.constants.iratio.Pb207Pb204[0] + ");"
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
    case 'K-Ca':
	out += "IsoplotR::settings('iratio','Ca40Ca44'," +
	    prefs.constants.iratio.Ca40Ca44[0] + "," +
	    prefs.constants.iratio.Ca40Ca44[1] + ");"
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
    if ((plotdevice != 'ages') && (plotdevice != 'set-zeta')){
	out += "par(cex=" + prefs.settings.par.cex + ");";
    }
    switch (plotdevice) {
    case 'concordia': 
	out += "IsoplotR::concordia(dat"; 
	break;
    case 'evolution': 
	out += "IsoplotR::evolution(dat"; 
	break;
    case 'regression':
	out += "dat <- IsoplotR::data2york(dat,format=" +
	    prefs.settings['other'].format + ");"
    case 'isochron':
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
