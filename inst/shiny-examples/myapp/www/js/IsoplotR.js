$(function(){

    function initialise(){
	$('#OUTPUT').hide();
	$('#RUN').hide();
	$('#CSV').hide();
	var out = {
	    constants: null,
	    settings: null,
	    data: [],
	    optionschanged: false
	}
	var cfile = './js/constants.json';
	var sfile = './js/settings.json';
	$.getJSON(cfile, function(data){
	    out.constants = data;
	});
	$.getJSON(sfile, function(data){
	    out.settings = data;
	    selectGeochronometer();
	    out = populate(out,true);
	    $("#INPUT").handsontable({ // add change handler asynchronously
		afterChange: function(changes,source){
		    getData(0,0,0,0); // placed here because we don't want to
		    handson2json();   // call the change handler until after
		}                     // IsoplotR has been initialised
	    });
	});
	return out;
    };

    function dnc(){
	var gc = IsoplotR.settings.geochronometer;
	switch (gc){
	case 'U-Pb':
	    var format = IsoplotR.settings["U-Pb"].format;
	    switch (format){
	    case 1: return 5;
	    case 2: return 5;
	    case 3: return 8;
	    case 4: return 9;
	    case 5: return 9;
	    case 6: return 12;
	    }
	case 'Pb-Pb':
	    var format = IsoplotR.settings["Pb-Pb"].format;
	    switch (format){
	    case 1: return 5;
	    case 2: return 5;
	    case 3: return 6;
	    }
	case 'Ar-Ar':
	    var format = IsoplotR.settings["Ar-Ar"].format;
	    switch (format){
	    case 1: return 6;
	    case 2: return 6;
	    case 3: return 7;
	    }
	case 'Th-U':
	    return 9;
	case 'fissiontracks':
	    var format = IsoplotR.settings.fissiontracks.format;
	    if (format<2){
		return 2;
	    } else {
		return 20;
	    }
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    var format = IsoplotR.settings[gc].format;
	    switch (format){
	    case 1: return 5;
	    case 2: return 6;
	    }
	case 'U-Th-He':
	    return 8;
	case 'detritals':
	    var firstrow = $("#INPUT").handsontable('getData')[0];
	    var nc = firstrow.length;
	    for (var i=(nc-1); i>0; i--){
		if (firstrow[i]!=null) return i+1;
	    }
	case 'other':
	    switch(IsoplotR.settings.plotdevice){
	    case 'regression':
		return 5;
	    case 'spectrum':
		return 3;
	    case 'radial':
	    case 'average':
		return 2;
	    case 'KDE':
	    case 'CAD':
		return 1;
	    }
	}
	return 0;
    }

    function json2handson(settings){
	var geochronometer = settings.geochronometer;
	var json = settings.data[geochronometer];
	switch (geochronometer){
	case "Ar-Ar":
	    $("#Jval").val(json.J[0]);
	    $("#Jerr").val(json.J[1]);
	    break;
	case "fissiontracks":
	    if (settings.fissiontracks.format < 3){
		$("#zetaVal").val(json.zeta[0]);
		$("#zetaErr").val(json.zeta[1]);
	    }
	    if (settings.fissiontracks.format < 2){
		$("#rhoDval").val(json.rhoD[0]);
		$("#rhoDerr").val(json.rhoD[1]);
	    }
	    if (settings.fissiontracks.format > 1){
		$("#spotSizeVal").val(json.spotSize);
	    }
	    if (settings.plotdevice=='set-zeta'){
		$("#standAgeVal").val(json.age[0]);
		$("#standAgeErr").val(json.age[1]);
	    }
	    break;
	default:
	}
	var row, header;
	var handson = {
	    data: [],
	    headers: []
	};
	$.each(json.data, function(k, v) {
	    handson.headers.push(k);
	});
	var m = handson.headers.length; // number of columns
	var n = (m>0) ? json.data[handson.headers[0]].length : 0; // number of rows
	for (var i=0; i<handson.headers.length; i++){ // maximum number of rows
	    if (json.data[handson.headers[i]].length > n) {
		n = json.data[handson.headers[i]].length;
	}   }
	for (var i=0; i<n; i++){
	    row = [];
	    for (var j=0; j<m; j++){
		row.push(json.data[handson.headers[j]][i]);
	    }
	    handson.data.push(row);
	}
	// handson.data.push([]); // add empty row in case json is empty
	$("#INPUT").handsontable({
	    data: handson.data,
	    colHeaders: handson.headers
	});
	// change headers for LA-ICP-MS-based fission track data
	if (geochronometer == 'fissiontracks' & settings.fissiontracks.format > 1){
	    var nc = $("#INPUT").handsontable('countCols');
	    var headers = ['Ns','A'];
	    for (var i=0; i<(nc-2)/2; i++){
		headers.push('U'+(i+1));
		headers.push('s[U'+(i+1)+']');		
	    }
	    $("#INPUT").handsontable({
		colHeaders: headers
	    });
	}
    }

    // overwrites the data in the IsoplotR preferences based on the handsontable
    function handson2json(){
	var out = $.extend(true, {}, IsoplotR); // clone
	var geochronometer = out.settings.geochronometer;
	var plotdevice = out.settings.plotdevice;
	var mydata = out.settings.data[geochronometer];
	switch (geochronometer){
	case "Ar-Ar":
	    mydata.J[0] = $("#Jval").val();
	    mydata.J[1] = $("#Jerr").val();
	    break;
	case "fissiontracks":
	    if (out.settings.fissiontracks.format < 3 &
		plotdevice != 'set-zeta'){
		mydata.zeta[0] = $("#zetaVal").val();
		mydata.zeta[1] = $("#zetaErr").val();
	    }
	    if (out.settings.fissiontracks.format < 2){
		mydata.rhoD[0] = $("#rhoDval").val();
		mydata.rhoD[1] = $("#rhoDerr").val();
	    }
	    if (out.settings.fissiontracks.format > 1){
		mydata.spotSize = $("#spotSizeVal").val();
	    }
	    if (plotdevice == 'set-zeta'){
		mydata.age[0] = $("#standAgeVal").val();
		mydata.age[1] = $("#standAgeErr").val();
	    }
	    break;
	default:
	}
	if (geochronometer=='detritals'){
	    $.each(mydata.data, function(k, v) {
		mydata.data[k] = null;
	    });
	    var labels = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
			  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
	    var label = '';
	    for (var k=0; k<dnc(); k++){
		if (k<26) {
		    label = labels[k];
		} else {
		    label = labels[Math.floor((k-1)/26)] + labels[k%26];
		}
		mydata.data[label] = $("#INPUT").handsontable('getDataAtCol',k);
	    }
	} else {
	    var i = 0;
	    $.each(mydata.data, function(k, v) {
		mydata.data[k] = $("#INPUT").handsontable('getDataAtCol',i++);
	    });
	}
	out.settings.data[geochronometer] = mydata;
	out.optionschanged = false;
	IsoplotR = out;
    }

    function getData(r,c,r2,c2){
	var geochronometer = IsoplotR.settings.geochronometer;
	var nr = 1+Math.abs(r2-r);
	var nc = 1+Math.abs(c2-c);
	var dat = [];
	var DNC = dnc();
	var toofewcols = (nc < DNC);
	var other1row = ((geochronometer=='other') & (nr==1));
	var detritals = (geochronometer=='detritals');
	var FT = (geochronometer=='fissiontracks');
	var UPb2 = (geochronometer=='U-Pb') & (IsoplotR.settings['U-Pb'].format==2);
	var UPb456 = (geochronometer=='U-Pb') & (IsoplotR.settings['U-Pb'].format>3);
	var ArAr1 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==1);
	var ArAr2 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==2);
	var ArAr3 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==3);
	if ( toofewcols | other1row) {
		nc = DNC;
		nr = $("#INPUT").handsontable('countRows');
		r = 0;
		c = 0;
		r2 = nr-1;
		c2 = nc-1;
	}
	dat = $("#INPUT").handsontable('getData',r,c,r2,c2);
	if ( toofewcols | detritals | FT){
	    var val = null;
	    var row = [];
	    var good = false;
	    var clean = [];
	    for (var i=0; i<nr; i++){
		row = [];
		good = false;
		for (var j=0; j<nc; j++){
		    val = dat[i][j];
		    if (val==null | val==""){
			if (UPb456|(UPb2 & j==4)|(ArAr2 & j==4)) { // rho
			    row.push(0);
			} else if ((ArAr1 & j==6)|(ArAr2 & j==6)|(ArAr3 & j==7)) { // Ar39
			    row.push(1);
			} else {
			    row.push('');
			}
		    } else {
			row.push(val);
			good = true;
		    }
		}
		if (good) {
		    clean.push(row);
		}
	    }
	    dat = clean;
	}
	switch (geochronometer){
	case  'Ar-Ar':
	    var J = $('#Jval').val();
	    var sJ = $('#Jerr').val();
	    IsoplotR.data = [nr,nc,J,sJ,dat];
	    break;
	case 'fissiontracks':
	    switch (IsoplotR.settings.fissiontracks.format){
	    case 1:
		var zeta = $('#zetaVal').val();
		var zetaErr = $('#zetaErr').val();
		var rhoD = $('#rhoDval').val();
		var rhoDerr = $('#rhoDerr').val();
		IsoplotR.data = [nr,nc,zeta,zetaErr,rhoD,rhoDerr,dat];
		break;
	    case 2:
		var zeta = $('#zetaVal').val();
		var zetaErr = $('#zetaErr').val();
		var spotSize = $('#spotSizeVal').val();
		IsoplotR.data = [nr,nc,zeta,zetaErr,spotSize,dat];
		break;
	    case 3:
		var spotSize = $('#spotSizeVal').val();
		IsoplotR.data = [nr,nc,spotSize,dat];
		break;
	    }
	    break;
	default:
	    IsoplotR.data = [nr,nc,dat];
	}
    }
    
    function showSettings(option){
	var set = IsoplotR.settings[option];
	var cst = IsoplotR.constants;
	switch (option){
	case 'U-Pb':
	    $('#UPb-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4UPb').show();
	    $('.hide4UPb').hide();
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#errU238U235').val(cst.iratio.U238U235[1]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaU235').val(cst.lambda.U235[0]);
	    $('#errLambdaU235').val(cst.lambda.U235[1]);
	    break;
	case 'Th-U':
	    $('#ThU-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4ThU').show();
	    $('.hide4ThU').hide();
	    $('#LambdaTh230').val(cst.lambda.Th230[0]);
	    $('#errLambdaTh230').val(cst.lambda.Th230[1]);
	    $('#LambdaU234').val(cst.lambda.U234[0]);
	    $('#errLambdaU234').val(cst.lambda.U234[1]);
	    $('#i2iThU').prop('checked',set.i2i=='TRUE');
	    break;
	case 'Pb-Pb':
	    $('#PbPb-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4PbPb').show();
	    $('.hide4PbPb').hide();
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#errU238U235').val(cst.iratio.U238U235[1]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaU235').val(cst.lambda.U235[0]);
	    $('#errLambdaU235').val(cst.lambda.U235[1]);
	    break;
	case 'Ar-Ar':
	    $('#ArAr-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4ArAr').show();
	    $('.hide4ArAr').hide();
	    $('#Ar40Ar36').val(cst.iratio.Ar40Ar36[0]),
	    $('#errAr40Ar36').val(cst.iratio.Ar40Ar36[1]),
	    $('#LambdaK40').val(cst.lambda.K40[0]),
	    $('#errLambdaK40').val(cst.lambda.K40[1]),
	    $('#i2iArAr').prop('checked',set.i2i=='TRUE');
	    break;
	case 'Th-U':
	    $('#ThU-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4ThU').show();
	    $('.hide4ThU').hide();
	    $('#i2iThU').prop('checked',set.i2i=='TRUE');
	    break;
	case 'Rb-Sr':
	    $('#RbSr-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4RbSr').show();
	    $('.hide4RbSr').hide();
	    $('#Rb85Rb87').val(cst.iratio.Rb85Rb87[0]);
	    $('#errRb85Rb87').val(cst.iratio.Rb85Rb87[1]);
	    $('#Sr84Sr86').val(cst.iratio.Sr84Sr86[0]);
	    $('#errSr84Sr86').val(cst.iratio.Sr84Sr86[1]);
	    $('#Sr87Sr86').val(cst.iratio.Sr87Sr86[0]);
	    $('#errSr87Sr86').val(cst.iratio.Sr87Sr86[1]);
	    $('#Sr88Sr86').val(cst.iratio.Sr88Sr86[0]);
	    $('#errSr88Sr86').val(cst.iratio.Sr88Sr86[1]);
	    $('#LambdaRb87').val(cst.lambda.Rb87[0]);
	    $('#errLambdaRb87').val(cst.lambda.Rb87[1]);
	    $('#i2iReOs').prop('checked',set.i2i=='TRUE');
	    break;
	case 'Sm-Nd':
	    $('#SmNd-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4SmNd').show();
	    $('.hide4SmNd').hide();
	    $('#Sm144Sm152').val(cst.iratio.Sm144Sm152[0]);
	    $('#errSm144Sm152').val(cst.iratio.Sm144Sm152[1]);
	    $('#Sm147Sm152').val(cst.iratio.Sm147Sm152[0]);
	    $('#errSm147Sm152').val(cst.iratio.Sm147Sm152[1]);
	    $('#Sm148Sm152').val(cst.iratio.Sm148Sm152[0]);
	    $('#errSm148Sm152').val(cst.iratio.Sm148Sm152[1]);
	    $('#Sm149Sm152').val(cst.iratio.Sm149Sm152[0]);
	    $('#errSm149Sm152').val(cst.iratio.Sm149Sm152[1]);
	    $('#Sm150Sm152').val(cst.iratio.Sm150Sm152[0]);
	    $('#errSm150Sm152').val(cst.iratio.Sm150Sm152[1]);
	    $('#Sm154Sm152').val(cst.iratio.Sm154Sm152[0]);
	    $('#errSm154Sm152').val(cst.iratio.Sm154Sm152[1]);
	    $('#Nd142Nd144').val(cst.iratio.Nd142Nd144[0]);
	    $('#errNd142Nd144').val(cst.iratio.Nd142Nd144[1]);
	    $('#Nd143Nd144').val(cst.iratio.Nd143Nd144[0]);
	    $('#errNd143Nd144').val(cst.iratio.Nd143Nd144[1]);
	    $('#Nd145Nd144').val(cst.iratio.Nd145Nd144[0]);
	    $('#errNd145Nd144').val(cst.iratio.Nd145Nd144[1]);
	    $('#Nd146Nd144').val(cst.iratio.Nd146Nd144[0]);
	    $('#errNd146Nd144').val(cst.iratio.Nd146Nd144[1]);
	    $('#Nd148Nd144').val(cst.iratio.Nd148Nd144[0]);
	    $('#errNd148Nd144').val(cst.iratio.Nd148Nd144[1]);
	    $('#Nd150Nd144').val(cst.iratio.Nd150Nd144[0]);
	    $('#errNd150Nd144').val(cst.iratio.Nd150Nd144[1]);
	    $('#LambdaSm147').val(cst.lambda.Sm147[0]);
	    $('#errLambdaSm147').val(cst.lambda.Sm147[1]);
	    $('#i2iSmNd').prop('checked',set.i2i=='TRUE');
	    break;
	case 'Re-Os':
	    $('#ReOs-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4ReOs').show();
	    $('.hide4ReOs').hide();
	    $('#Re185Re187').val(cst.iratio.Re185Re187[0]);
	    $('#errRe185Re187').val(cst.iratio.Re185Re187[1]);
	    $('#Os184Os192').val(cst.iratio.Os184Os192[0]);
	    $('#errOs184Os192').val(cst.iratio.Os184Os192[1]);
	    $('#Os186Os192').val(cst.iratio.Os186Os192[0]);
	    $('#errOs186Os192').val(cst.iratio.Os186Os192[1]);
	    $('#Os187Os192').val(cst.iratio.Os187Os192[0]);
	    $('#errOs187Os192').val(cst.iratio.Os187Os192[1]);
	    $('#Os188Os192').val(cst.iratio.Os188Os192[0]);
	    $('#errOs188Os192').val(cst.iratio.Os188Os192[1]);
	    $('#Os189Os192').val(cst.iratio.Os189Os192[0]);
	    $('#errOs189Os192').val(cst.iratio.Os189Os192[1]);
	    $('#Os190Os192').val(cst.iratio.Os190Os192[0]);
	    $('#errOs190Os192').val(cst.iratio.Os190Os192[1]);
	    $('#LambdaRe187').val(cst.lambda.Re187[0]);
	    $('#errLambdaRe187').val(cst.lambda.Re187[1]);
	    $('#i2iReOs').prop('checked',set.i2i=='TRUE');
	    break;
	case 'Lu-Hf':
	    $('#LuHf-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('.show4LuHf').show();
	    $('.hide4LuHf').hide();
	    $('#Lu176Lu175').val(cst.iratio.Lu176Lu175[0]);
	    $('#errLu176Lu175').val(cst.iratio.Lu176Lu175[1]);
	    $('#Hf174Hf177').val(cst.iratio.Hf174Hf177[0]);
	    $('#errHf174Hf177').val(cst.iratio.Hf174Hf177[1]);
	    $('#Hf176Hf177').val(cst.iratio.Hf176Hf177[0]);
	    $('#errHf176Hf177').val(cst.iratio.Hf176Hf177[1]);
	    $('#Hf178Hf177').val(cst.iratio.Hf178Hf177[0]);
	    $('#errHf178Hf177').val(cst.iratio.Hf178Hf177[1]);
	    $('#Hf179Hf177').val(cst.iratio.Hf179Hf177[0]);
	    $('#errHf179Hf177').val(cst.iratio.Hf179Hf177[1]);
	    $('#Hf180Hf177').val(cst.iratio.Hf180Hf177[0]);
	    $('#errHf180Hf177').val(cst.iratio.Hf180Hf177[1]);
	    $('#LambdaLu176').val(cst.lambda.Lu176[0]);
	    $('#errLambdaLu176').val(cst.lambda.Lu176[1]);
	    $('#i2iLuHf').prop('checked',set.i2i=='TRUE');
	    break;
	case 'U-Th-He':
	    $('.show4UThHe').show();
	    $('.hide4UThHe').hide();
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#errU238U235').val(cst.iratio.U238U235[1]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaU235').val(cst.lambda.U235[0]);
	    $('#errLambdaU235').val(cst.lambda.U235[1]);
	    $('#LambdaTh232').val(cst.lambda.Th232[0]);
	    $('#errLambdaTh232').val(cst.lambda.Th232[1]);
	    $('#LambdaSm147').val(cst.lambda.Sm147[0]);
	    $('#errLambdaSm147').val(cst.lambda.Sm147[1]);
	    break;
	case 'fissiontracks':
	    $('.show4fissiontracks').show();
	    $('.hide4fissiontracks').hide();
	    if (set.format==1){
		$('.show4EDM').show();
		$('.hide4EDM').hide();
	    } else if (set.format==2){
		$('.show4ICP').show();
		$('.hide4ICP').hide();
	    } else if (set.format==3){
		$('.show4absolute').show();
		$('.hide4absolute').hide();
	    }
	    $('#FT-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#errU238U235').val(cst.iratio.U238U235[1]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaFission').val(cst.lambda.fission[0]);
	    $('#errLambdaFission').val(cst.lambda.fission[1]);
	    var mineral = set.mineral;
	    $('#mineral-option option[value='+mineral+']').
		prop('selected', 'selected');
	    $('#etchfact').val(cst.etchfact[mineral]);
	    $('#tracklength').val(cst.tracklength[mineral]);
	    $('#mindens').val(cst.mindens[mineral]);
	    break;
	case 'detritals':
	    $('.show4detritals').show();
	    $('.hide4detritals').hide();
	    $('#headers-on').prop('checked',set.format==1);
	    break;
	case 'other':
	    $('.show4other').show();
	    $('.hide4other').hide();
	    break;
	case 'concordia':
	    $('#tera-wasserburg').prop('checked',set.wetherill!='TRUE');
	    $('#conc-age-option option[value='+set.showage+']').
		prop('selected', 'selected');
	    $('#mint').val(set.mint);
	    $('#maxt').val(set.maxt);
	    $('#alpha').val(set.alpha);
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'isochron':
	    $('#ThU-isochron-types option[value='+set.type+']').
		prop('selected', 'selected');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
	    $('#isochron-exterr').prop('checked',set.exterr=='TRUE')	    
	case 'regression':
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#isochron-minx').val(set.minx);
	    $('#isochron-maxx').val(set.maxx);
	    $('#isochron-miny').val(set.miny);
	    $('#isochron-maxy').val(set.maxy);
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'radial':
	    $('#transformation option[value='+set.transformation+']').
		prop('selected', 'selected');
	    $('#mixtures option[value='+set.numpeaks+']').
		prop('selected', 'selected');
	    $('#mint').val(set.mint);
	    $('#t0').val(set.t0);
	    $('#maxt').val(set.maxt);
	    $('#sigdig').val(set.sigdig);
	    $('#pch').val(set.pch);
	    $('#cex').val(set.cex);
	    $('#bg').val(set.bg);
	    $('#cutoff76').val(set.cutoff76);
	    $('#mindisc').val(set.mindisc);
	    $('#maxdisc').val(set.maxdisc);
	    break;
	case 'average':
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#outliers').prop('checked',set.outliers=='TRUE');
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#cutoff76').val(set.cutoff76);
	    $('#mindisc').val(set.mindisc);
	    $('#maxdisc').val(set.maxdisc);
	    break;
	case 'spectrum':
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#plateau').prop('checked',set.plateau=='TRUE');
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'KDE':
	    $('#showhist').prop('checked',set.showhist=='TRUE');
	    $('#adaptive').prop('checked',set.adaptive=='TRUE');
	    $('#samebandwidth').prop('checked',set.samebandwidth=='TRUE');
	    $('#normalise').prop('checked',set.normalise=='TRUE');
	    $('#log').prop('checked',set.log=='TRUE');
	    $('#minx').val(set.minx);
	    $('#maxx').val(set.maxx);
	    $('#bandwidth').val(set.bandwidth);
	    $('#binwidth').val(set.binwidth);
	    $('#pchdetritals').val(set.pchdetritals);
	    $('#pch').val(set.pch);
	    $('#cutoff76').val(set.cutoff76);
	    $('#mindisc').val(set.mindisc);
	    $('#maxdisc').val(set.maxdisc);
	    break;
	case 'CAD':
	    $('#verticals').prop('checked',set.verticals=='TRUE');
	    $('#pch').val(set.pch);
	    $('#cutoff76').val(set.cutoff76);
	    $('#mindisc').val(set.mindisc);
	    $('#maxdisc').val(set.maxdisc);
	    break;
	case 'set-zeta':
	    $('.show4zeta').show();
	    $('.hide4zeta').hide();
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'ages':
	    if (geochronometer != 'U-Th-He') {
		$('#age-exterr').prop('checked',set.exterr=='TRUE');
	    }
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'MDS':
	    $('#classical').prop('checked',set.classical=='TRUE');
	    $('#shepard').prop('checked',set.shepard=='TRUE');
	    $('#nnlines').prop('checked',set.nnlines=='TRUE');
	    $('#ticks').prop('checked',set.ticks=='TRUE');
	    $('#pch').val(set.pch);
	    $('#cex').val(set.cex);
	    $('#pos').val(set.pos);
	    $('#col').val(set.col);
	    $('#bg').val(set.bg);
	    break;
	case 'helioplot':
	    $('#logratio').prop('checked',set.logratio=='TRUE');
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
	    $('#showcentralcomp').prop('checked',set.showcentralcomp=='TRUE');
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#minx').val(set.minx);
	    $('#maxx').val(set.maxx);
	    $('#miny').val(set.miny);
	    $('#maxy').val(set.maxy);
	    $('#fact').val(set.fact);
	    break;
	case 'evolution':
	    $('#transform-evolution').prop('checked',set.transform=='TRUE');
	    $('#isochron-evolution').prop('checked',set.isochron=='TRUE');
	    $('#detrital-correction').prop('checked',set.detrital=='TRUE');
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#min08').val(set.min08);
	    $('#max08').val(set.max08);
	    $('#min48').val(set.min48);
	    $('#max48').val(set.max48);
	    $('#mint').val(set.mint);
	    $('#maxt').val(set.maxt);
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    if (set.transform=='TRUE'){
		$('.show4evotrans').show();
		$('.hide4evotrans').hide();
	    } else {
		$('.show4evotrans').hide();
		$('.hide4evotrans').show();
	    }
	    break;
	default:
	}
    }

    function recordSettings(){
	var plotdevice = IsoplotR.settings.plotdevice;
	var geochronometer = IsoplotR.settings.geochronometer;
	var pdsettings = IsoplotR.settings[plotdevice];
	var gcsettings = IsoplotR.constants;
	switch (plotdevice){
	case 'concordia':
	    pdsettings.wetherill =
		$('#tera-wasserburg').prop('checked') ? 'FALSE' : 'TRUE';
	    pdsettings["showage"] = $('#conc-age-option').prop("value");
	    pdsettings.mint =
		isValidAge($('#mint').val()) ? $('#mint').val() : 'auto';
	    pdsettings.maxt =
		isValidAge($('#maxt').val()) ? $('#maxt').val() : 'auto';
	    if ($('#alpha').val() > 0 & $('#alpha').val() < 1) { 
		pdsettings.alpha = $('#alpha').val(); 
	    }
	    pdsettings.exterr = 
		$('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.shownumbers =
		$('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.sigdig = $('#sigdig').val();
	    break;
	case 'isochron':
	    pdsettings.type = 1*$('option:selected', $("#ThU-isochron-types")).attr('value');
	    pdsettings.inverse = $('#inverse').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.exterr = $('#isochron-exterr').prop('checked') ? 'TRUE' : 'FALSE';
	case 'regression':
	    pdsettings.shownumbers = $('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.minx = $('#isochron-minx').val();
	    pdsettings.maxx = $('#isochron-maxx').val();
	    pdsettings.miny = $('#isochron-miny').val();
	    pdsettings.maxy = $('#isochron-maxy').val();
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    break;
	case 'radial':
	    pdsettings.transformation =
		$('option:selected', $("#transformation")).attr('value');
	    pdsettings.mint = $('#mint').val();
	    pdsettings.t0 = $('#t0').val();
	    pdsettings.maxt = $('#maxt').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    pdsettings.pch = $('#pch').val();
	    pdsettings["cex"] = $('#cex').val();
	    pdsettings.bg = $('#bg').val();
	    pdsettings.cutoff76 = $('#cutoff76').val();
	    pdsettings.mindisc = $('#mindisc').val();
	    pdsettings.maxdisc = $('#maxdisc').val();
	    break;
	case 'average':
	    if (geochronometer != "other"){
		pdsettings.exterr =
		    $('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    }
	    pdsettings["outliers"] = 
		$('#outliers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    pdsettings["cutoff76"] = $('#cutoff76').val();
	    pdsettings["mindisc"] = $('#mindisc').val();
	    pdsettings["maxdisc"] = $('#maxdisc').val();
	    break;
	case 'spectrum':
	    if (geochronometer != "other"){
		pdsettings.exterr =
		    $('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    }
	    pdsettings["plateau"] = 
		$('#plateau').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    break;
	case 'KDE':
	    pdsettings["showhist"] = 
		$('#showhist').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["adaptive"] = 
		$('#adaptive').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["samebandwidth"] = 
		$('#samebandwidth').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["normalise"] = 
		$('#normalise').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["log"] = 
		$('#log').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["minx"] = $('#minx').val();
	    pdsettings["maxx"] = $('#maxx').val();
	    pdsettings["bandwidth"] = $('#bandwidth').val();
	    pdsettings["binwidth"] = $('#binwidth').val();
	    pdsettings["pchdetritals"] = $('#pchdetritals').val();
	    pdsettings["pch"] = $('#pch').val();
	    pdsettings["cutoff76"] = $('#cutoff76').val();
	    pdsettings["mindisc"] = $('#mindisc').val();
	    pdsettings["maxdisc"] = $('#maxdisc').val();
	    break;
	case 'CAD':
	    pdsettings["pch"] = $('#pch').val();
	    pdsettings["verticals"] = 
		$('#verticals').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["cutoff76"] = $('#cutoff76').val();
	    pdsettings["mindisc"] = $('#mindisc').val();
	    pdsettings["maxdisc"] = $('#maxdisc').val();
	    break;
	case 'set-zeta':
	    IsoplotR.settings.data[geochronometer].age[0] = $('#standAgeVal').val();
	    IsoplotR.settings.data[geochronometer].age[1] = $('#standAgeErr').val();
	    pdsettings.exterr = 
		$('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.sigdig = $('#sigdig').val();
	    break;
	case 'MDS':
	    pdsettings["classical"] =
		$('#classical').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["shepard"] =
		$('#shepard').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["nnlines"] =
		$('#nnlines').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["ticks"] =
		$('#ticks').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["pch"] = $('#pch').val();
	    pdsettings["cex"] = $('#cex').val();
	    pdsettings["pos"] = $('#pos').val();
	    pdsettings["col"] = $('#col').val();
	    pdsettings["bg"] = $('#bg').val();
	    break;
	case 'ages':
	    if (geochronometer != 'U-Th-He'){
		pdsettings.exterr = $('#age-exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    }
	    pdsettings.sigdig = $('#sigdig').val();
	case 'helioplot':
	    pdsettings.logratio = 
		$('#logratio').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.shownumbers = 
		$('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.showcentralcomp = 
		$('#showcentralcomp').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["alpha"] = $('#alpha').val();
	    pdsettings["sigdig"] = $('#sigdig').val();
	    pdsettings["minx"] = $('#minx').val();
	    pdsettings["maxx"] = $('#maxx').val();
	    pdsettings["miny"] = $('#miny').val();
	    pdsettings["maxy"] = $('#maxy').val();
	    pdsettings["fact"] = $('#fact').val();
	    break;
	case 'evolution':
	    pdsettings.transform =
		$('#transform-evolution').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.isochron =
		$('#isochron-evolution').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.detrital = $('#detrital-correction').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.shownumbers = $('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.exterr = $('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.min08 =
		isValidAge($('#min08').val()) ? $('#min08').val() : 'auto';
	    pdsettings.max08 =
		isValidAge($('#max08').val()) ? $('#max08').val() : 'auto';
	    pdsettings.min48 =
		isValidAge($('#min48').val()) ? $('#min48').val() : 'auto';
	    pdsettings.max48 =
		isValidAge($('#max48').val()) ? $('#max48').val() : 'auto';
	    pdsettings.mint =
		isValidAge($('#mint').val()) ? $('#mint').val() : 'auto';
	    pdsettings.maxt =
		isValidAge($('#maxt').val()) ? $('#maxt').val() : 'auto';
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    break;
	default:
	}
	switch (geochronometer){
	case 'U-Pb':
	case 'Pb-Pb':
	    gcsettings.iratio.U238U235[0] = $("#U238U235").val();
	    gcsettings.iratio.U238U235[1] = $("#errU238U235").val();
	    gcsettings.lambda.U238[0] = $("#LambdaU238").val();
	    gcsettings.lambda.U238[1] = $("#errLambdaU238").val();
	    gcsettings.lambda.U235[0] = $("#LambdaU235").val();
	    gcsettings.lambda.U235[1] = $("#errLambdaU235").val();
	    break;
	case 'Th-U':
	    gcsettings.lambda.Th230[0] = $("#LambdaTh230").val();
	    gcsettings.lambda.Th230[1] = $("#errLambdaTh230").val();
	    gcsettings.lambda.U234[0] = $("#LambdaU234").val();
	    gcsettings.lambda.U234[1] = $("#errLambdaU234").val();
	    IsoplotR.settings[geochronometer].i2i = 
		$("#i2iThU").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Ar-Ar':
	    gcsettings.iratio.Ar40Ar36[0] = $("#Ar40Ar36").val();
	    gcsettings.iratio.Ar40Ar36[1] = $("#errAr40Ar36").val();
	    gcsettings.lambda.K40[0] = $("#LambdaK40").val();
	    gcsettings.lambda.K40[1] = $("#errLambdaK40").val();
	    IsoplotR.settings[geochronometer].i2i = 
		$("#i2iArAr").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Rb-Sr':
	    gcsettings.iratio.Rb85Rb87[0] = $('#Rb85Rb87').val();
	    gcsettings.iratio.Rb85Rb87[1] = $('#errRb85Rb87').val();
	    gcsettings.iratio.Sr84Sr86[0] = $('#Sr84Sr86').val();
	    gcsettings.iratio.Sr84Sr86[1] = $('#errSr84Sr86').val();
	    gcsettings.iratio.Sr87Sr86[0] = $('#Sr87Sr86').val();
	    gcsettings.iratio.Sr87Sr86[1] = $('#errSr87Sr86').val();
	    gcsettings.iratio.Sr88Sr86[0] = $('#Sr88Sr86').val();
	    gcsettings.iratio.Sr88Sr86[1] = $('#errSr88Sr86').val();
	    gcsettings.lambda.Rb87[0] = $('#LambdaRb87').val();
	    gcsettings.lambda.Rb87[1]= $('#errLambdaRb87').val();
	    IsoplotR.settings[geochronometer].i2i = 
		$("#i2iRbSr").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Sm-Nd':
	    gcsettings.iratio.Sm144Sm152[0] = $('#Sm144Sm152').val();
	    gcsettings.iratio.Sm144Sm152[1] = $('#errSm144Sm152').val();
	    gcsettings.iratio.Sm147Sm152[0] = $('#Sm147Sm152').val();
	    gcsettings.iratio.Sm147Sm152[1] = $('#errSm147Sm152').val();
	    gcsettings.iratio.Sm148Sm152[0] = $('#Sm148Sm152').val();
	    gcsettings.iratio.Sm148Sm152[1] = $('#errSm148Sm152').val();
	    gcsettings.iratio.Sm149Sm152[0] = $('#Sm149Sm152').val();
	    gcsettings.iratio.Sm149Sm152[1] = $('#errSm149Sm152').val();
	    gcsettings.iratio.Sm150Sm152[0] = $('#Sm150Sm152').val();
	    gcsettings.iratio.Sm150Sm152[1] = $('#errSm150Sm152').val();
	    gcsettings.iratio.Sm154Sm152[0] = $('#Sm154Sm152').val();
	    gcsettings.iratio.Sm154Sm152[1] = $('#errSm154Sm152').val();
	    gcsettings.iratio.Nd142Nd144[0] = $('#Nd142Nd144').val();
	    gcsettings.iratio.Nd142Nd144[1] = $('#errNd142Nd144').val();
	    gcsettings.iratio.Nd143Nd144[0] = $('#Nd143Nd144').val();
	    gcsettings.iratio.Nd143Nd144[1] = $('#errNd143Nd144').val();
	    gcsettings.iratio.Nd145Nd144[0] = $('#Nd145Nd144').val();
	    gcsettings.iratio.Nd145Nd144[1] = $('#errNd145Nd144').val();
	    gcsettings.iratio.Nd146Nd144[0] = $('#Nd146Nd144').val();
	    gcsettings.iratio.Nd146Nd144[1] = $('#errNd146Nd144').val();
	    gcsettings.iratio.Nd148Nd144[0] = $('#Nd148Nd144').val();
	    gcsettings.iratio.Nd148Nd144[1] = $('#errNd148Nd144').val();
	    gcsettings.iratio.Nd150Nd144[0] = $('#Nd150Nd144').val();
	    gcsettings.iratio.Nd150Nd144[1] = $('#errNd150Nd144').val();
	    gcsettings.lambda.Sm147[0] = $('#LambdaSm147').val();
	    gcsettings.lambda.Sm147[1] = $('#errLambdaSm147').val();
	    IsoplotR.settings[geochronometer].i2i = 
		$("#i2iSmNd").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Re-Os':
	    gcsettings.iratio.Re185Re187[0] = $('#Re185Re187').val();
	    gcsettings.iratio.Re185Re187[1] = $('#errRe185Re187').val();
	    gcsettings.iratio.Os184Os192[0] = $('#Os184Os192').val();
	    gcsettings.iratio.Os184Os192[1] = $('#errOs184Os192').val();
	    gcsettings.iratio.Os186Os192[0] = $('#Os186Os192').val();
	    gcsettings.iratio.Os186Os192[1] = $('#errOs186Os192').val();
	    gcsettings.iratio.Os187Os192[0] = $('#Os187Os192').val();
	    gcsettings.iratio.Os187Os192[1] = $('#errOs187Os192').val();
	    gcsettings.iratio.Os188Os192[0] = $('#Os188Os192').val();
	    gcsettings.iratio.Os188Os192[1] = $('#errOs188Os192').val();
	    gcsettings.iratio.Os189Os192[0] = $('#Os189Os192').val();
	    gcsettings.iratio.Os189Os192[1] = $('#errOs189Os192').val();
	    gcsettings.iratio.Os190Os192[0] = $('#Os190Os192').val();
	    gcsettings.iratio.Os190Os192[1] = $('#errOs190Os192').val();
	    gcsettings.lambda.Re187[0] = $('#LambdaRe187').val();
	    gcsettings.lambda.Re187[1] = $('#errLambdaRe187').val();
	    IsoplotR.settings[geochronometer].i2i = 
		$("#i2iReOs").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Lu-Hf':
	    gcsettings.iratio.Lu176Lu175[0] = $('#Lu176Lu175').val();
	    gcsettings.iratio.Lu176Lu175[1] = $('#errLu176Lu175').val();
	    gcsettings.iratio.Hf174Hf177[0] = $('#Hf174Hf177').val();
	    gcsettings.iratio.Hf174Hf177[1] = $('#errHf174Hf177').val();
	    gcsettings.iratio.Hf176Hf177[0] = $('#Hf176Hf177').val();
	    gcsettings.iratio.Hf176Hf177[1] = $('#errHf176Hf177').val();
	    gcsettings.iratio.Hf178Hf177[0] = $('#Hf178Hf177').val();
	    gcsettings.iratio.Hf178Hf177[1] = $('#errHf178Hf177').val();
	    gcsettings.iratio.Hf179Hf177[0] = $('#Hf179Hf177').val();
	    gcsettings.iratio.Hf179Hf177[1] = $('#errHf179Hf177').val();
	    gcsettings.iratio.Hf180Hf177[0] = $('#Hf180Hf177').val();
	    gcsettings.iratio.Hf180Hf177[1] = $('#errHf180Hf177').val();
	    gcsettings.lambda.Lu176[0] = $('#LambdaLu176').val();
	    gcsettings.lambda.Lu176[1] = $('#errLambdaLu176').val();
	    IsoplotR.settings[geochronometer].i2i = 
		$("#i2iLuHf").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'U-Th-He':
	    gcsettings.iratio.U238U235[0] = $("#U238U235").val();
	    gcsettings.iratio.U238U235[1] = $("#errU238U235").val();
	    gcsettings.lambda.U238[0] = $("#LambdaU238").val();
	    gcsettings.lambda.U238[1] = $("#errLambdaU238").val();
	    gcsettings.lambda.U235[0] = $("#LambdaU235").val();
	    gcsettings.lambda.U235[1] = $("#errLambdaU235").val();
	    gcsettings.lambda.Th232[0] = $("#LambdaTh232").val();
	    gcsettings.lambda.Th232[1] = $("#errLambdaTh232").val();
	    gcsettings.lambda.Sm147[0] = $("#LambdaSm147").val();
	    gcsettings.lambda.Sm147[1] = $("#errLambdaSm147").val();
	    break;
	case 'detritals':
	    IsoplotR.settings[geochronometer].format = 
		$("#headers-on").prop('checked') ? 1 : 2;
	    break;
	case 'fissiontracks':
	    var mineral = $('#mineral-option').prop('value');
	    IsoplotR.settings[geochronometer].mineral = mineral;
	    IsoplotR.settings[geochronometer].format = 
		1*$('option:selected', $("#FT-formats")).attr('value');
	    gcsettings.iratio.U238U235[0] = $("#U238U235").val();
	    gcsettings.iratio.U238U235[1] = $("#errU238U235").val();
	    gcsettings.lambda.U238[0] = $("#LambdaU238").val();
	    gcsettings.lambda.U238[1] = $("#errLambdaU238").val();
	    gcsettings.etchfact[mineral] = $("#etchfact").val();
	    gcsettings.tracklength[mineral] = $("#tracklength").val();
	    gcsettings.mindens[mineral] = $("#mindens").val();
	    break;
	default:
	}
    }
    
    function changePlotDevice(){
	var gc = IsoplotR.settings.geochronometer;
	var opd = IsoplotR.settings.plotdevice; // old plot device
	var npd = $('option:selected', $("#plotdevice")).attr('id');
	IsoplotR.settings.plotdevice = npd;
	IsoplotR.optionschanged = false;
	$('#myscript').empty();
        if (npd == 'ages'){
	    $('#PLOT').hide();
	    $('#PDF').hide();
	    $('#RUN').show();
	    $('#CSV').show();
        } else if (npd == 'set-zeta') {
	    $('#PLOT').hide();
	    $('#PDF').hide();
	    $('#RUN').show();
	    $('#CSV').hide();    
	} else {
	    $('#PLOT').show();
	    $('#PDF').show();
	    $('#RUN').hide();
	    $('#CSV').hide();
        }
	if (gc == "other"){
	    populate(IsoplotR,true);
	} else {
	    populate(IsoplotR,false);
	}
	if (gc == 'fissiontracks' & npd == 'set-zeta'){
	    $(".show4zeta").show();
	    $(".hide4zeta").hide();
	} else if (gc == 'fissiontracks' & opd == 'set-zeta'){
	    $(".show4zeta").hide();
	    $(".hide4zeta").show();
	}
    }

    function selectGeochronometer(){
	var geochronometer = IsoplotR.settings.geochronometer;
	var plotdevice = IsoplotR.settings.plotdevice;
	$("#Jdiv").hide();
	$("#zetaDiv").hide();
	$("#rhoDdiv").hide();
	$("#spotSizeDiv").hide();
	switch (geochronometer){
	case 'U-Pb':
	    setSelectedMenus(['concordia','radial','average',
			      'KDE','CAD','ages']);
	    break;
	case 'Ar-Ar':
	    setSelectedMenus(['isochron','radial','spectrum',
			      'average','KDE','CAD','ages']);
	    $("#Jdiv").show();
	    $(".helioplot").hide()
	    break;
	case 'Pb-Pb':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    setSelectedMenus(['isochron','radial','average',
			      'KDE','CAD','ages']);
	    break;
	case 'U-Th-He':
	    setSelectedMenus(['helioplot','radial','average',
			      'KDE','CAD','ages']);
	    break;
	case 'fissiontracks':
	    var format = IsoplotR.settings.fissiontracks.format;
	    setSelectedMenus(['radial','average','KDE',
			      'CAD','set-zeta','ages']);
	    if (format < 3){ $("#zetaDiv").show(); }
	    if (format < 2){ $("#rhoDdiv").show(); }
	    if (format > 1){ $("#spotSizeDiv").show(); }
	    break;
	case 'Th-U':
	    setSelectedMenus(['evolution','isochron','radial',
			      'average','KDE','CAD','ages']);
	    break;
	case 'detritals':
	    setSelectedMenus(['KDE','CAD','MDS']);
	    break;
	case 'other':
	    setSelectedMenus(['radial','regression','spectrum',
			      'average','KDE','CAD']);
	    break;
	default:
	    setSelectedMenus(['concordia','helioplot','evolution','isochron',
			      'radial','regression','spectrum','average',
			      'KDE','CAD','set-zeta','MDS','ages']);
	}
	IsoplotR = populate(IsoplotR,false);
	$("#plotdevice").selectmenu("refresh");
    }

    function setSelectedMenus(options){
	var html = '';
	if ($.inArray('concordia',options)>-1)
	    html += '<option id="concordia">concordia</option>';
	if ($.inArray('helioplot',options)>-1)
	    html += '<option id="helioplot">helioplot</option>';
	if ($.inArray('evolution',options)>-1)
	    html += '<option id="evolution">evolution</option>';
	if ($.inArray('isochron',options)>-1)
	    html += '<option id="isochron">isochron</option>';
	if ($.inArray('radial',options)>-1)
	    html += '<option id="radial">radial plot</option>';
	if ($.inArray('regression',options)>-1)
	    html += '<option id="regression">regression</option>';
	if ($.inArray('spectrum',options)>-1)
	    html += '<option id="spectrum">age spectrum</option>';
	if ($.inArray('average',options)>-1)
	    html += '<option id="average">weighted mean</option>';
	if ($.inArray('KDE',options)>-1)
	    html += '<option id="KDE">KDE</option>';
	if ($.inArray('CAD',options)>-1)
	    html += '<option id="CAD">CAD</option>';
	if ($.inArray('set-zeta',options)>-1)
	    html += '<option id="set-zeta">get &zeta;</option>';
	if ($.inArray('MDS',options)>-1)
	    html += '<option id="MDS">MDS</option>';
	if ($.inArray('ages',options)>-1)
	    html += '<option id="ages">ages</option>';
	$('#plotdevice').html(html);
	$(options[0]).prop('selected',true);
	IsoplotR.settings.plotdevice = 
	    $('option:selected', $("#plotdevice")).attr('id');
    }

    // populate the handsontable with stored data
    function populate(prefs,forcedefaults){
	var geochronometer = prefs.settings.geochronometer;
	var plotdevice = prefs.settings.plotdevice;
	var data = prefs.settings.data[geochronometer];
	if (forcedefaults | $.isEmptyObject(data)){
	    switch (geochronometer){
	    case "U-Pb":
	    case "Pb-Pb":
	    case "Ar-Ar":
	    case "Rb-Sr":
	    case "Sm-Nd":
	    case "Re-Os":
	    case "Lu-Hf":
	    case "Th-U":
	    case "fissiontracks":
		var format = prefs.settings[geochronometer].format;
		prefs.settings.data[geochronometer] =
		    example(geochronometer,plotdevice,format);
		break;
	    default:
		prefs.settings.data[geochronometer] =
		    example(geochronometer,plotdevice);
	    }
	}
	json2handson(prefs.settings);
	return prefs;
    }

    function update(){
	if (IsoplotR.optionschanged){
	    recordSettings();
	    IsoplotR.optionschanged = false;
	} else {
	    handson2json();
	}
	if (IsoplotR.data.length==0) getData(0,0,0,0);
	Shiny.onInputChange("data",IsoplotR.data);
	Shiny.onInputChange("Rcommand",getRcommand(IsoplotR));
    }

    $.chooseNumRadialPeaks = function(){
	IsoplotR.settings.radial.numpeaks =
	    $('option:selected', $("#mixtures")).attr('value');	
    }
    
    $.chooseTransformation = function(){
	IsoplotR.settings.radial.transformation =
	    $('option:selected', $("#transformation")).attr('value');
    }

    $.chooseThUisochronType = function(){
	var type = 1*$('option:selected', $("#ThU-isochron-types")).attr('value');
	IsoplotR.settings.isochron.type = type;
    }
    
    $.chooseEvolutionTransformation = function(){
	var selected =  $("#transform-evolution").prop('checked');
	if (selected){
	    $('.show4evotrans').show();
	    $('.hide4evotrans').hide();
	} else {
	    $('.show4evotrans').hide();
	    $('.hide4evotrans').show();
	}
    }
    
    $.chooseUPbformat = function(){
	chooseFormat("#UPb-formats","U-Pb")
    }
    $.choosePbPbformat = function(){
	chooseFormat("#PbPb-formats","Pb-Pb")
    }
    $.chooseArArformat = function(){
	chooseFormat("#ArAr-formats","Ar-Ar")
    }
    $.chooseThUformat = function(){
	chooseFormat("#ThU-formats","Th-U")
    }
    $.chooseRbSrformat = function(){
	chooseFormat("#RbSr-formats","Rb-Sr")
    }
    $.chooseSmNdformat = function(){
	chooseFormat("#SmNd-formats","Sm-Nd")
    }
    $.chooseReOsformat = function(){
	chooseFormat("#ReOs-formats","Re-Os")
    }
    $.chooseLuHfformat = function(){
	chooseFormat("#LuHf-formats","Lu-Hf")
    }
    $.chooseFTformat = function(){
	var format = chooseFormat("#FT-formats","fissiontracks")
	switch (format){
	case 1:
	    $(".show4EDM").show();
	    $(".hide4EDM").hide();
	    break;
	case 2:
	    $(".show4ICP").show();
	    $(".hide4ICP").hide();
	    break;
	case 3:
	    $(".show4absolute").show();
	    $(".hide4absolute").hide();
	    break;
	}
	if (plotdevice == 'set-zeta'){
	    $(".show4zeta").show();
	    $(".hide4zeta").hide();
	}
    }    
    function chooseFormat(ID,chronometer){
	var format = 1*$('option:selected', $(ID)).attr('value');
	IsoplotR.settings[chronometer].format = format;
	IsoplotR = populate(IsoplotR,true);
	return(format)
    }
    
    $.chooseMineral = function(){
	var cst = IsoplotR.constants;
	var mineral = $('option:selected', $("#mineral-option")).val();
	switch (mineral){
	case 'apatite':
	    $("#etchfact").val(cst.etchfact[mineral]);
	    $("#tracklength").val(cst.tracklength[mineral]);
	    $("#mindens").val(cst.mindens[mineral]);
	    break;
	case 'zircon':
	    $("#etchfact").val(cst.etchfact[mineral]);
	    $("#tracklength").val(cst.tracklength[mineral]);
	    $("#mindens").val(cst.mindens[mineral]);
	    break;
	}
    }
    
    $(".button").button()
    
    $("#INPUT").handsontable({
	data : [[]],
	minRows: 100,
	minCols: 26,
	rowHeaders: true,
	colHeaders: true,
	contextMenu: true,
	observeChanges: true,
	manualColumnResize: true,
	afterSelectionEnd: function (r,c,r2,c2){
	    getData(r,c,r2,c2);
	}
    });

    $("#OUTPUT").handsontable({
	data : [[]],
	minRows: 100,
	minCols: 26,
	rowHeaders: true,
	colHeaders: true,
	contextMenu: true,
	observeChanges: false,
	manualColumnResize: true
    });
    
    $("select").selectmenu({ width : 'auto' });
    $("#geochronometer").selectmenu({
	change: function( event, ui ) {
	    IsoplotR.settings.geochronometer =
		$('option:selected', $("#geochronometer")).attr('id');
	    selectGeochronometer();
	}
    });
    $("#plotdevice").selectmenu({
	change: function( event, ui ) { changePlotDevice(); },
	focus: function( event, ui ) { changePlotDevice(); }
    });
    
    $("#helpmenu").dialog({ autoOpen: false, width: 500 });
    
    $('body').on('click', 'help', function(){
	var text = help($(this).attr('id'));
	$("#helpmenu").html(text);
	$("#helpmenu").dialog('open');
    });

    $("#OPEN").on('change', function(e){
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e){
	    IsoplotR = JSON.parse(this.result);
	    var set = IsoplotR.settings;
	    $("#" + set.geochronometer ).prop("selected",true);
	    $("#geochronometer").selectmenu("refresh");
	    selectGeochronometer()
	    json2handson(set);
	}
	reader.readAsText(file);
    });

    $("#SAVE").click(function( event ) {
	var fname = prompt("Please enter a file name", "IsoplotR.json");
	if (fname != null){
	    handson2json();
	    $('#fname').attr("href","data:text/plain," + JSON.stringify(IsoplotR));
	    $('#fname').attr("download",fname);
	    $('#fname')[0].click();
	}
    });

    $("#OPTIONS").click(function(){
	var plotdevice = IsoplotR.settings.plotdevice;
	var geochronometer = IsoplotR.settings.geochronometer;
	var fname = "";
	$("#OUTPUT").hide();
	$("#myplot").show();
	$("#myplot").load("options/index.html",function(){
	    fname = "options/" + geochronometer + ".html";
	    $("#geochronometer-options").load(fname,function(){
		fname = "options/" + plotdevice + ".html";
		$("#plotdevice-options").load(fname,function(){
		    showSettings(geochronometer);
		    showSettings(plotdevice);
		    IsoplotR.optionschanged = true;
		});
	    });
	});
    });

    $("#HELP").click(function(){
	var plotdevice = IsoplotR.settings.plotdevice;
	var geochronometer = IsoplotR.settings.geochronometer;
	var fname = "";
	$("#OUTPUT").hide();
	$("#myplot").show();
	fname = "help/" + geochronometer + ".html";
	$("#myplot").load(fname,function(){
	    switch (geochronometer){
	    case 'U-Pb':
		switch (IsoplotR.settings['U-Pb'].format){
		case 1:
		    $('.show4UPb1').show();
		    break;
		case 2:
		    $('.show4UPb2').show();
		    break;
		case 3:
		    $('.show4UPb3').show();
		    break;
		}
		break;
	    case 'Th-U':
		switch (IsoplotR.settings['Th-U'].format){
		case 1:
		    $('.show4ThU1').show();
		    break;
		case 2:
		    $('.show4ThU2').show();
		    break;
		}
		break;
	    case 'Pb-Pb':
		switch (IsoplotR.settings['Pb-Pb'].format){
		case 1:
		    $('.show4PbPb1').show();
		    break;
		case 2:
		    $('.show4PbPb2').show();
		    break;
		case 3:
		    $('.show4PbPb3').show();
		    break;
		}
		break;
	    case 'Ar-Ar':
		switch (IsoplotR.settings['Ar-Ar'].format){
		case 1:
		    $('.show4ArAr1').show();
		    break;
		case 2:
		    $('.show4ArAr2').show();
		    break;
		case 3:
		    $('.show4ArAr3').show();
		    break;
		}
		break;
	    case 'Rb-Sr':
		switch (IsoplotR.settings['Rb-Sr'].format){
		case 1:
		    $('.show4RbSr1').show();
		    break;
		case 2:
		    $('.show4RbSr2').show();
		    break;
		}
		break;
	    case 'Sm-Nd':
		switch (IsoplotR.settings['Sm-Nd'].format){
		case 1:
		    $('.show4SmNd1').show();
		    break;
		case 2:
		    $('.show4SmNd2').show();
		    break;
		}
		break;
	    case 'Re-Os':
		switch (IsoplotR.settings['Re-Os'].format){
		case 1:
		    $('.show4ReOs1').show();
		    break;
		case 2:
		    $('.show4ReOs2').show();
		    break;
		}
		break;
	    case 'Lu-Hf':
		switch (IsoplotR.settings['Lu-Hf'].format){
		case 1:
		    $('.show4LuHf1').show();
		    break;
		case 2:
		    $('.show4LuHf2').show();
		    break;
		}
		break;
	    case 'fissiontracks':
		switch (IsoplotR.settings.fissiontracks.format){
		case 1:
		    $('.show4EDM').show();
		    break;
		case 2:
		    $('.show4ICP').show();
		    break;
		case 3:
		    $('.show4absolute').show();
		    break;
		}
		if (IsoplotR.settings.plotdevice=='set-zeta'){
		    $('.show4zeta').show();
		    $('.hide4zeta').hide();
		}
		break;
	    case 'other':
		switch (plotdevice){
		case 'radial':
		    $('.show4radial').show();
		    break;
		case 'regression':
		    $('.show4regression').show();
		    break;
		case 'spectrum':
		    $('.show4spectrum').show();
		    break;
		case 'average':
		    $('.show4weightedmean').show();
		    break;
		case 'KDE':
		    $('.show4kde').show();
		    break;
		case 'CAD':
		    $('.show4cad').show();
		    break;
		}
		break;
	    }
	});
    });

    
    $("#DEFAULTS").click(function(){
	var cfile = './js/constants.json';
	$.getJSON(cfile, function(data){
	    IsoplotR.constants = data;
	});
	IsoplotR = populate(IsoplotR,true);
    });

    $("#CLEAR").click(function(){
	$("#INPUT").handsontable({
	    data: [[]]
	});
	$("#OUTPUT").handsontable({
	    data: [[]]
	});
    });
    
    $("#PLOT").click(function(){
	$("#OUTPUT").hide();
	update();
	$("#myplot").load("loader.html", function(){
	    $("#PLOTTER").click();
	})
    });

    $("#RUN").click(function(){
	$("#OUTPUT").handsontable('clear');
	$("#OUTPUT").handsontable('deselectCell');
	$("#OUTPUT").show();
	update();
	$("#myscript").load("loader.html", function(){
	    $("#RUNNER").click(); 
	});
    });

    var IsoplotR = initialise();

});
