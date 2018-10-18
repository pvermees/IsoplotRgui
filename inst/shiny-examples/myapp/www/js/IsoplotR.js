$(function(){

    function initialise(){
	$('#OUTPUT').hide();
	$('#RUN').hide();
	$('#CSV').hide();
	$('#myplot').load('welcome.html')
	var out = {
	    constants: null,
	    settings: null,
	    data4server: [],
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
		    getData4Server(); // placed here because we don't want to
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
	    case 1: return 6;
	    case 2: return 6;
	    case 3: return 9;
	    case 4: return 10;
	    case 5: return 10;
	    case 6: return 13;
	    }
	case 'Pb-Pb':
	    var format = IsoplotR.settings["Pb-Pb"].format;
	    switch (format){
	    case 1: return 6;
	    case 2: return 6;
	    case 3: return 7;
	    }
	case 'Ar-Ar':
	    var format = IsoplotR.settings["Ar-Ar"].format;
	    switch (format){
	    case 1: return 7;
	    case 2: return 7;
	    case 3: return 8;
	    }
	case 'K-Ca':
	    var format = IsoplotR.settings["K-Ca"].format;
	    switch (format){
	    case 1: return 6;
	    case 2: return 7;
	    }
	case 'Th-U':
	    var format = IsoplotR.settings["Th-U"].format;
	    switch (format){
	    case 1: return 10;
	    case 2: return 10;
	    case 3: return 6;
	    case 4: return 6;
	    }
	case 'fissiontracks':
	    var format = IsoplotR.settings.fissiontracks.format;
	    if (format<2){
		return 3;
	    } else {
		return 20;
	    }
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    var format = IsoplotR.settings[gc].format;
	    switch (format){
	    case 1: return 6;
	    case 2: return 7;
	    }
	case 'U-Th-He':
	    return 9;
	case 'detritals':
	    var firstrow = $("#INPUT").handsontable('getData')[0];
	    var nc = firstrow.length;
	    for (var i=(nc-1); i>0; i--){
		if (firstrow[i]!=null) return i+1;
	    }
	case 'other':
	    switch(IsoplotR.settings.plotdevice){
	    case 'regression':
		if (IsoplotR.settings["other"].format == 1){ return 6; }
		else {return 7;}
	    case 'spectrum':
		return 3;
	    case 'radial':
	    case 'average':
		return 3;
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
	if (geochronometer == 'fissiontracks' &
	    settings.fissiontracks.format > 1){
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

    // overwrites the data in the IsoplotR 
    // preferences based on the handsontable
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
	    var labels = ['A','B','C','D','E','F','G','H','I','J',
			  'K','L','M','N','O','P','Q','R','S','T',
			  'U','V','W','X','Y','Z'];
	    var label = '';
	    for (var k=0; k<dnc(); k++){
		if (k<26) {
		    label = labels[k];
		} else {
		    label = labels[Math.floor((k-1)/26)] + labels[k%26];
		}
		mydata.data[label] =
		    $("#INPUT").handsontable('getDataAtCol',k);
	    }
	} else {
	    var i = 0;
	    $.each(mydata.data, function(k, v) {
		mydata.data[k] =
		    $("#INPUT").handsontable('getDataAtCol',i++);
	    });
	}
	out.settings.data[geochronometer] = mydata;
	out.optionschanged = false;
	IsoplotR = out;
    }

    function getData4Server(){
	var selected = $("#INPUT").handsontable('getSelected');
	var selection = [0,0,0,0];
	if (typeof selected != 'undefined'){
	    selection = selected[0];
	}
	var r1 = selection[0];
	var c1 = selection[1];
	var r2 = selection[2];
	var c2 = selection[3];
	var nr = 1+Math.abs(r2-r1);
	var nc = 1+Math.abs(c2-c1);
	var dat = [];
	var DNC = dnc();
	var toofewcols = (geochronometer!='detritals') & (nc < DNC);
	var onerow = ((geochronometer=='other' |
		       geochronometer=='detritals') &
		      (nr==1));
	if (toofewcols | onerow) {
	    nc = DNC;
	    c1 = 0;
	    c2 = nc-1;
	    nr = $("#INPUT").handsontable('countRows');
	    r1 = 0;
	    r2 = nr-1;
	}
	geochronometer = IsoplotR.settings.geochronometer;
	var d = $("#INPUT").handsontable('getData',r1,c1,r2,c2);
	var dat = cleanData(geochronometer,d,nr,nc);
	switch (geochronometer){
	case  'Ar-Ar':
	    var J = $('#Jval').val();
	    var sJ = $('#Jerr').val();
	    IsoplotR.data4server = [nr,nc,J,sJ,dat];
	    break;
	case 'fissiontracks':
	    switch (IsoplotR.settings.fissiontracks.format){
	    case 1:
		var zeta = $('#zetaVal').val();
		var zetaErr = $('#zetaErr').val();
		var rhoD = $('#rhoDval').val();
		var rhoDerr = $('#rhoDerr').val();
		IsoplotR.data4server = [nr,nc,zeta,zetaErr,rhoD,rhoDerr,dat];
		break;
	    case 2:
		var zeta = $('#zetaVal').val();
		var zetaErr = $('#zetaErr').val();
		var spotSize = $('#spotSizeVal').val();
		IsoplotR.data4server = [nr,nc,zeta,zetaErr,spotSize,dat];
		break;
	    case 3:
		var spotSize = $('#spotSizeVal').val();
		IsoplotR.data4server = [nr,nc,spotSize,dat];
		break;
	    }
	    break;
	default:
	    IsoplotR.data4server = [nr,nc,dat];
	}
    }

    function cleanData(geochronometer,dat,nr,nc){
	var ArAr1 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==1);
	var ArAr2 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==2);
	var ArAr3 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==3);
	var ThU34 = (geochronometer=='Th-U') & (IsoplotR.settings['Th-U'].format>2);
	var detrital1 = (geochronometer=='detritals') &
	    (IsoplotR.settings['detritals'].format==1);
	var val = null;
	var row = [];
	var good = false;
	var clean = [];
	for (var i=0; i<nr; i++){
	    row = [];
	    good = false;
	    for (var j=0; j<nc; j++){
		val = dat[i][j];
		if ($.isNumeric(val)){
		    row.push(Number(val));
		    good = true;
		} else {
		    if (detrital1 & i==0){ // col names
			row.push(val);
			good = true;
		    } else if ((ArAr2 & j==4)|(ThU34 & j==4)) { // rho
			row.push(0);
		    } else if ((ArAr1 & j==5)|(ArAr2 & j==5)|(ArAr3 & j==6)) { // Ar39
			row.push(1);
		    } else {
			row.push('');
		    }
		}
	    }
	    if (good) {
		clean.push(row);
	    }
	}
	return(clean);
    }
    
    function showOrHide(){
	var geochronometer = IsoplotR.settings.geochronometer;
	var plotdevice = IsoplotR.settings.plotdevice;
	var set = IsoplotR.settings[geochronometer];
	var pd = IsoplotR.settings[plotdevice];
	switch (geochronometer){
	case 'U-Pb':
	    $('.show4UPb').show();
	    $('.hide4UPb').hide();
	    switch (set.format){
	    case 1:
		$('.show4UPb1').show();
		$('.hide4UPb1').hide();
		break;
	    case 2:
		$('.show4UPb2').show();
		$('.hide4UPb2').hide();
		break;
	    case 3:
		$('.show4UPb3').show();
		$('.hide4UPb3').hide();
		break;
	    case 4:
		$('.show4UPb4').show();
		$('.hide4UPb4').hide();
		break;
	    case 5:
		$('.show4UPb5').show();
		$('.hideUPb5').hide();
		break;
	    case 6:
		$('.show4UPb6').show();
		$('.hide4UPb6').hide();
		break;
	    }
	    switch (set.type){
	    case 1:
	    case 2:
	    case 3:
	    case 5:
		$(".show4UPbType4").hide();
		break;
	    case 4:
		$(".show4UPbType4").show();
		break;
	    }
	    if (set.commonPb==3 & set.format<4){
		$('.show4commonPbwithout204').show();
		$('.show4commonPbwith204').hide();
	    } else if (set.commonPb==3){
		$('.show4commonPbwithout204').hide();
		$('.show4commonPbwith204').show();
	    }
	    break;
	case 'Th-U':
	    $('.show4ThU').show();
	    $('.hide4ThU').hide();
	    switch (set.format){
	    case 1:
		$('.show4ThU1').show();
		$('.hide4ThU1').hide();
		break;
	    case 2:
		$('.show4ThU2').show();
		$('.hide4ThU2').hide();
		break;
	    case 3:
		$('.show4ThU3').show();
		$('.hide4ThU3').hide();
		break;
	    case 4:
		$('.show4ThU4').show();
		$('.hide4ThU4').hide();
		break;
	    }
	    switch (set.detritus){
	    case 2:
		$('.show4Th230corr').show();
		$('.show4assumedTh230corr').show();
		$('.show4measuredTh230corr').hide();
		break;
	    case 3:
		$('.show4Th230corr').show();
		$('.show4assumedTh230corr').hide();
		$('.show4measuredTh230corr').show();
		break;
	    default:
		$('.show4Th230corr').hide();
	    }
	    break;
	case 'Pb-Pb':
	    $('.show4PbPb').show();
	    $('.hide4PbPb').hide();
	    switch (set.format){
	    case 1:
		$('.show4PbPb1').show();
		$('.hide4PbPb1').hide();
		break;
	    case 2:
		$('.show4PbPb2').show();
		$('.hide4PbPb2').hide();
		break;
	    case 3:
		$('.show4PbPb3').show();
		$('.hide4PbPb3').hide();
		break;
	    }
	    break;
	case 'Ar-Ar':
	    $('.show4ArAr').show();
	    $('.hide4ArAr').hide();
	    switch (set.format){
	    case 1:
		$('.show4ArAr1').show();
		$('.hide4ArAr1').hide();
		break;
	    case 2:
		$('.show4ArAr2').show();
		$('.hide4ArAr2').hide();
		break;
	    case 3:
		$('.show4ArAr3').show();
		$('.hide4ArAr3').hide();
		break;
	    }
	    break;
	case 'K-Ca':
	    $('.show4KCa').show();
	    $('.hide4KCa').hide();
	    switch (set.format){
	    case 1:
		$('.show4KCa1').show();
		$('.hide4KCa1').hide();
		break;
	    case 2:
		$('.show4KCa2').show();
		$('.hide4KCa2').hide();
		break;
	    }
	    break;
	case 'Rb-Sr':
	    $('.show4RbSr').show();
	    $('.hide4RbSr').hide();
	    switch (set.format){
	    case 1:
		$('.show4RbSr1').show();
		$('.hide4RbSr1').hide();
		break;
	    case 2:
		$('.show4RbSr2').show();
		$('.hide4RbSr2').hide();
		break;
	    }
	    break;
	case 'Sm-Nd':
	    $('.show4SmNd').show();
	    $('.hide4SmNd').hide();
	    switch (set.format){
	    case 1:
		$('.show4SmNd1').show();
		$('.hide4SmNd1').hide();
		break;
	    case 2:
		$('.show4SmNd2').show();
		$('.hide4SmNd2').hide();
		break;
	    }
	    break;
	case 'Re-Os':
	    $('.show4ReOs').show();
	    $('.hide4ReOs').hide();
	    switch (set.format){
	    case 1:
		$('.show4ReOs1').show();
		$('.hide4ReOs1').hide();
		break;
	    case 2:
		$('.show4ReOs2').show();
		$('.hide4ReOs2').hide();
		break;
	    }
	    break;
	case 'Lu-Hf':
	    $('.show4LuHf').show();
	    $('.hide4LuHf').hide();
	    switch (set.format){
	    case 1:
		$('.show4LuHf1').show();
		$('.hide4LuHf1').hide();
		break;
	    case 2:
		$('.show4LuHf2').show();
		$('.hide4LuHf2').hide();
		break;
	    }
	    break;
	case 'U-Th-He':
	    $('.show4UThHe').show();
	    $('.hide4UThHe').hide();
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
	    break;
	case 'detritals':
	    $('.show4detritals').show();
	    $('.hide4detritals').hide();
	    break;
	case 'other':
	    $('.show4other').show();
	    $('.hide4other').hide();
	    switch (plotdevice){
	    case 'radial':
		$('.show4radial').show();
		$('.hide4radial').hide();
		break;
	    case 'regression':
		$('.show4regression').show();
		$('.hide4regression').hide();
		break;
	    case 'spectrum':
		$('.show4spectrum').show();
		$('.hide4spectrum').hide();
		break;
	    case 'average':
		$('.show4weightedmean').show();
		$('.hide4weightedmean').hide();
		break;
	    case 'KDE':
		$('.show4kde').show();
		$('.hide4kde').show();
		break;
	    case 'CAD':
		$('.show4cad').show();
		$('.hide4cad').show();
		break;
	    }
	    break;
	}
	switch (plotdevice){
	case 'concordia':
	    switch (pd.showage){
	    case 0:
		$('.hide4noUPbAge').hide();
		break;
	    case 1:
		$('.show4concordiaAge').show();
		$('.hide4concordiaAge').hide();
		break;
	    case 2:
	    case 3:
	    case 4:
		$('.show4discordia').show();
		$('.hide4discordia').hide();
		switch (pd.showage){
		case 2:
		    $('.show4model1').show();
		    $('.hide4model1').hide();
		    break;
		case 3:
		    $('.show4model2').show();
		    $('.hide4model2').hide();
		    break;
		case 4:
		    $('.show4model3').show();
		    $('.hide4model3').hide();
		    break;
		}
		break;
	    }
	    if (pd.anchor == 1){
		$('.show4tanchor').show();
	    } else {
		$('.show4tanchor').hide();
	    }
	    if (pd.anchor==2 & set.format<4){
		$('.show4commonPbwithout204').show();
	    } else if (pd.anchor==2){
		$('.show4commonPbwith204').show();
	    } else if (set.commonPb!=3){
		$('.show4commonPbwithout204').hide();
		$('.show4commonPbwith204').hide();
	    }
	    break;
	    
	case 'evolution':
	    $(".hide4evolution").hide();
	    switch (pd.isochron){
	    case "TRUE":
		$(".show4isochron").show();
		break;
	    case "FALSE":
		$(".show4isochron").hide();
		break;
	    }
	    if (pd.transform=='TRUE'){
		$('.show4evotrans').show();
		$('.hide4evotrans').hide();
	    } else {
		$('.show4evotrans').hide();
		$('.hide4evotrans').show();
	    }
	case 'isochron':
	    $(".hide4isochron").hide();
	case 'helioplot':
	    switch (pd.model){
	    case 1:
		$('.show4model1').show();
		$('.hide4model1').hide();
		break;
	    case 2:
		$('.show4model2').show();
		$('.hide4model2').hide();
		break;
	    case 3:
		$('.show4model3').show();
		$('.hide4model3').hide();
		break;
	    }
	    break;
	}
    }
    
    function showSettings(option){
	var set = IsoplotR.settings[option];
	var cst = IsoplotR.constants;
	showOrHide();
	switch (option){
	case 'U-Pb':
	    $('#UPb-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#UPb-age-type option[value='+set.type+']').
		prop('selected', 'selected');
	    $('#common-Pb-option option[value='+set.commonPb+']').
		prop('selected', 'selected');
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#errU238U235').val(cst.iratio.U238U235[1]);
	    $('#Pb207Pb206').val(cst.iratio.Pb207Pb206[0]);
	    $('#Pb206Pb204').val(cst.iratio.Pb206Pb204[0]);
	    $('#Pb207Pb204').val(cst.iratio.Pb207Pb204[0]);
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaU235').val(cst.lambda.U235[0]);
	    $('#errLambdaU235').val(cst.lambda.U235[1]);
	    $('#cutoff76').val(set.cutoff76);
	    $('#mindisc').val(set.mindisc);
	    $('#maxdisc').val(set.maxdisc);
	    break;
	case 'Th-U':
	    $('#ThU-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#detritus option[value='+set.detritus+']').
		prop('selected', 'selected');
	    $('#i2iThU').prop('checked',set.i2i=='TRUE');
	    $('#Th02').val(set.Th02[0]);
	    $('#errTh02').val(set.Th02[1]);
	    $('#Th0U8').val(set.Th02U48[0]);
	    $('#errTh0U8').val(set.Th02U48[1]);
	    $('#Th2U8').val(set.Th02U48[2]);
	    $('#errTh2U8').val(set.Th02U48[3]);
	    $('#U48').val(set.Th02U48[4]);
	    $('#errU48').val(set.Th02U48[5]);
	    $('#rXY').val(set.Th02U48[6]);
	    $('#rXZ').val(set.Th02U48[7]);
	    $('#rYZ').val(set.Th02U48[8]);
	    $('#LambdaTh230').val(cst.lambda.Th230[0]);
	    $('#errLambdaTh230').val(cst.lambda.Th230[1]);
	    $('#LambdaU234').val(cst.lambda.U234[0]);
	    $('#errLambdaU234').val(cst.lambda.U234[1]);
	    $("#U234U238").val(cst.iratio.U234U238[0]);
	    $("#errU234U238").val(cst.iratio.U234U238[1]);
	    $("#Th230Th232").val(cst.iratio.Th230Th232[0]);
	    $("#errTh230Th232").val(cst.iratio.Th230Th232[1]);
	    break;
	case 'Pb-Pb':
	    $('#PbPb-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#errU238U235').val(cst.iratio.U238U235[1]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaU235').val(cst.lambda.U235[0]);
	    $('#errLambdaU235').val(cst.lambda.U235[1]);
	    $('#common-Pb-option option[value='+set.commonPb+']').
		prop('selected', 'selected');
	    $('#Pb206Pb204').val(cst.iratio.Pb206Pb204[0]);
	    $('#Pb207Pb204').val(cst.iratio.Pb207Pb204[0]);
	    break;
	case 'Ar-Ar':
	    $('#ArAr-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#Ar40Ar36').val(cst.iratio.Ar40Ar36[0]),
	    $('#errAr40Ar36').val(cst.iratio.Ar40Ar36[1]),
	    $('#LambdaK40').val(cst.lambda.K40[0]),
	    $('#errLambdaK40').val(cst.lambda.K40[1]),
	    $('#i2iArAr').prop('checked',set.i2i=='TRUE');
	    break;
	case 'K-Ca':
	    $('#KCa-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#Ca40Ca44').val(cst.iratio.Ca40Ca44[0]);
	    $('#errCa40Ca44').val(cst.iratio.Ca40Ca44[1]);
	    $('#LambdaK40').val(cst.lambda.K40[0]),
	    $('#errLambdaK40').val(cst.lambda.K40[1]),
	    $('#i2iKCa').prop('checked',set.i2i=='TRUE');
	    break;
	case 'Rb-Sr':
	    $('#RbSr-formats option[value='+set.format+']').
		prop('selected', 'selected');
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
	    $('#i2iRbSr').prop('checked',set.i2i=='TRUE');
	    break;
	case 'Sm-Nd':
	    $('#SmNd-formats option[value='+set.format+']').
		prop('selected', 'selected');
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
	    $('#headers-on').prop('checked',set.format==1);
	    break;
	case 'other':
	    if (IsoplotR.settings.plotdevice=='regression'){
		$('#regression-format option[value='+set.format+']').
		    prop('selected', 'selected');
	    }
	    break;
	case 'concordia':
	    $('#tera-wasserburg').prop('checked',set.wetherill!='TRUE');
	    $('#conc-age-option option[value='+set.showage+']').
		prop('selected', 'selected');
	    $('#anchor-option option[value='+set.anchor+']').
		prop('selected', 'selected');
	    $('#mint').val(set.mint);
	    $('#maxt').val(set.maxt);
	    $('#minx').val(set.minx);
	    $('#maxx').val(set.maxx);
	    $('#miny').val(set.miny);
	    $('#maxy').val(set.maxy);
	    $('#alpha').val(set.alpha);
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
	    $('#sigdig').val(set.sigdig);
	    $('#bg1').val(set.bg1);
	    $('#bg2').val(set.bg2);
	    $('#clabel').val(set.clabel);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    $('#tanchor').val(set.tanchor);
	    break;
	case 'isochron':
	    $('#ThU-isochron-types option[value='+set.type+']').
		prop('selected', 'selected');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
	    $('#isochron-exterr').prop('checked',set.exterr=='TRUE')
	    $('#PbPb-growth').prop('checked',set.growth=='TRUE')
	    $('#bg').val(set.bg);
	case 'regression':
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
	    $('#isochron-minx').val(set.minx);
	    $('#isochron-maxx').val(set.maxx);
	    $('#isochron-miny').val(set.miny);
	    $('#isochron-maxy').val(set.maxy);
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#isochron-models option[value='+set.model+']').
		prop('selected', 'selected');
	    $('#bg1').val(set.bg1);
	    $('#bg2').val(set.bg2);
	    $('#clabel').val(set.clabel);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    break;
	case 'radial':
	    $('#transformation option[value='+set.transformation+']').
		prop('selected', 'selected');
	    $('#mixtures option[value='+set.numpeaks+']').
		prop('selected', 'selected');
	    var shownumbers = (set.shownumbers=='TRUE');
	    $('#shownumbers').prop('checked',shownumbers);
	    $('#pch').val(set.pch);
	    if (shownumbers){ $('#radial-pch').hide(); }
	    else { $('#radial-pch').show(); }
	    $('#mint').val(set.mint);
	    $('#t0').val(set.t0);
	    $('#maxt').val(set.maxt);
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#bg1').val(set.bg1);
	    $('#bg2').val(set.bg2);
	    $('#clabel').val(set.clabel);
	    $('#pcex').val(set.cex);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    break;
	case 'average':
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#outliers').prop('checked',set.outliers=='TRUE');
	    $('#randomeffects').prop('checked',set.randomeffects=='TRUE');
	    $('#ranked').prop('checked',set.ranked=='TRUE');
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#mint').val(set.mint);
	    $('#maxt').val(set.maxt);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    break;
	case 'spectrum':
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#plateau').prop('checked',set.plateau=='TRUE');
	    $('#randomeffects').prop('checked',set.randomeffects=='TRUE');
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#cex').val(IsoplotR.settings.par.cex);
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
	    $('#cex').val(IsoplotR.settings.par.cex);
	    break;
	case 'CAD':
	    $('#verticals').prop('checked',set.verticals=='TRUE');
	    $('#pch').val(set.pch);
	    $('#cex').val(IsoplotR.settings.par.cex);
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
	    $('#pos').val(set.pos);
	    $('#col').val(set.col);
	    $('#bg').val(set.bg);
	    $('#pcex').val(set.cex);
	    $('#cex').val(IsoplotR.settings.par.cex);
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
	    $('#bg1').val(set.bg1);
	    $('#bg2').val(set.bg2);
	    $('#helioplot-models option[value='+set.model+']').
		prop('selected', 'selected');
	    $('#clabel').val(set.clabel);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    break;
	case 'evolution':
	    if (set.isochron=="TRUE"){ $('.show4evolutionIsochron').show(); }
	    else { $('.show4evolutionIsochron').hide(); }
	    $('#transform-evolution').prop('checked',set.transform=='TRUE');
	    $('#isochron-evolution').prop('checked',set.isochron=='TRUE');
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
	    $('#bg1').val(set.bg1);
	    $('#bg2').val(set.bg2);
	    $('#evolution-isochron-models option[value='+set.model+']').
		prop('selected', 'selected');
	    $('#clabel').val(set.clabel);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    break;
	default:
	}
    }

    function recordSettings(){
	var plotdevice = IsoplotR.settings.plotdevice;
	var geochronometer = IsoplotR.settings.geochronometer;
	var pdsettings = IsoplotR.settings[plotdevice];
	var gcsettings = IsoplotR.settings[geochronometer];
	var set = IsoplotR.constants;
	switch (plotdevice){
	case 'concordia':
	    pdsettings.wetherill =
		$('#tera-wasserburg').prop('checked') ? 'FALSE' : 'TRUE';
	    pdsettings.showage = 1*$('#conc-age-option').prop("value");
	    pdsettings.anchor = 1*$('#anchor-option').prop("value");
	    pdsettings.mint = check($('#mint').val(),'auto');
	    pdsettings.maxt = check($('#maxt').val(),'auto');
	    pdsettings.minx = check($('#minx').val(),'auto');
	    pdsettings.maxx = check($('#maxx').val(),'auto');
	    pdsettings.miny = check($('#miny').val(),'auto');
	    pdsettings.maxy = check($('#maxy').val(),'auto');
	    if ($('#alpha').val() > 0 & $('#alpha').val() < 1) { 
		pdsettings.alpha = $('#alpha').val(); 
	    }
	    pdsettings.exterr = 
		$('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.shownumbers =
		$('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.sigdig = $('#sigdig').val();
	    pdsettings.bg1 = $('#bg1').val();
	    pdsettings.bg2 = $('#bg2').val();
	    pdsettings.clabel = $('#clabel').val();
	    IsoplotR.settings.par.cex = $('#cex').val();
	    pdsettings.tanchor = $('#tanchor').val();
	    break;
	case 'isochron':
	    pdsettings.type = 1*$('option:selected', $("#ThU-isochron-types")).attr('value');
	    pdsettings.inverse = $('#inverse').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.exterr = $('#isochron-exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.growth = $('#PbPb-growth').prop('checked') ? 'TRUE' : 'FALSE';
	case 'regression':
	    pdsettings.shownumbers = $('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.minx = check($('#isochron-minx').val(),'auto');
	    pdsettings.maxx = check($('#isochron-maxx').val(),'auto');
	    pdsettings.miny = check($('#isochron-miny').val(),'auto');
	    pdsettings.maxy = check($('#isochron-maxy').val(),'auto');
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    pdsettings.model = 1*$('option:selected', $("#isochron-models")).attr('value');
	    pdsettings.bg1 = $('#bg1').val();
	    pdsettings.bg2 = $('#bg2').val();
	    pdsettings.clabel = $('#clabel').val();
	    IsoplotR.settings.par.cex = $('#cex').val();
	    break;
	case 'radial':
	    pdsettings.shownumbers = $('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.transformation =
		$('option:selected', $("#transformation")).attr('value');
	    pdsettings.mint = $('#mint').val();
	    pdsettings.t0 = $('#t0').val();
	    pdsettings.maxt = $('#maxt').val();
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    pdsettings.pch = $('#pch').val();
	    pdsettings.bg1 = $('#bg1').val();
	    pdsettings.bg2 = $('#bg2').val();
	    pdsettings.clabel = $('#clabel').val();
	    i2i(geochronometer);
	    pdsettings["cex"] = $('#pcex').val();
	    IsoplotR.settings.par.cex = $('#cex').val();
	    break;
	case 'average':
	    if (geochronometer != "other"){
		pdsettings.exterr =
		    $('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    }
	    pdsettings["outliers"] = 
		$('#outliers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["randomeffects"] = 
		$('#randomeffects').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["ranked"] = 
		$('#ranked').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    pdsettings.mint = check($('#mint').val(),'auto');
	    pdsettings.maxt = check($('#maxt').val(),'auto');
	    i2i(geochronometer);
	    IsoplotR.settings.par.cex = $('#cex').val();
	    break;
	case 'spectrum':
	    if (geochronometer != "other"){
		pdsettings.exterr =
		    $('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    }
	    pdsettings["plateau"] = 
		$('#plateau').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings["randomeffects"] = 
		$('#randomeffects').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    i2i(geochronometer);
	    IsoplotR.settings.par.cex = $('#cex').val();
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
	    i2i(geochronometer);
	    IsoplotR.settings.par.cex = $('#cex').val();
	    break;
	case 'CAD':
	    pdsettings["pch"] = $('#pch').val();
	    pdsettings["verticals"] = 
		$('#verticals').prop('checked') ? 'TRUE' : 'FALSE';
	    i2i(geochronometer);
	    IsoplotR.settings.par.cex = $('#cex').val();
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
	    pdsettings["pos"] = $('#pos').val();
	    pdsettings["col"] = $('#col').val();
	    pdsettings["bg"] = $('#bg').val();
	    pdsettings["cex"] = $('#pcex').val();
	    IsoplotR.settings.par.cex = $('#cex').val();
	    break;
	case 'ages':
	    if (geochronometer != 'U-Th-He'){
		pdsettings.exterr = $('#age-exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    }
	    pdsettings.sigdig = $('#sigdig').val();
	    i2i(geochronometer);
	    break;
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
	    pdsettings.bg1 = $('#bg1').val();
	    pdsettings.bg2 = $('#bg2').val();
	    pdsettings.model = 1*$('option:selected',
				   $("#helioplot-models")).attr('value');
	    pdsettings.clabel = $('#clabel').val();
	    IsoplotR.settings.par.cex = $('#cex').val();
	    break;
	case 'evolution':
	    pdsettings.transform =
		$('#transform-evolution').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.isochron =
		$('#isochron-evolution').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.shownumbers =
		$('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.exterr =
		$('#exterr').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.min08 = check($('#min08').val(),'auto');
	    pdsettings.max08 = check($('#max08').val(),'auto');
	    pdsettings.min48 = check($('#min48').val(),'auto');
	    pdsettings.max48 = check($('#max48').val(),'auto');
	    pdsettings.mint = check($('#mint').val(),'auto');
	    pdsettings.maxt = check($('#maxt').val(),'auto');
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    pdsettings.bg1 = $('#bg1').val();
	    pdsettings.bg2 = $('#bg2').val();
	    pdsettings.model = 1*$('option:selected',
				   $("#evolution-isochron-models")).attr('value');
	    pdsettings.clabel = $('#clabel').val();
	    i2i(geochronometer);
	    IsoplotR.settings.par.cex = $('#cex').val();
	    break;
	default:
	}
	switch (geochronometer){
	case 'U-Pb':
	    if (plotdevice == 'average' | plotdevice == 'KDE' |
		plotdevice == 'CAD' | plotdevice == 'radial'){
		gcsettings["cutoff76"] = $('#cutoff76').val();
		gcsettings["mindisc"] = $('#mindisc').val();
		gcsettings["maxdisc"] = $('#maxdisc').val();
	    }
	    set.iratio.Pb207Pb206[0] = $('#Pb207Pb206').val();
	    set.iratio.Pb206Pb204[0] = $('#Pb206Pb204').val();
	    set.iratio.Pb207Pb204[0] = $('#Pb207Pb204').val();
	case 'Pb-Pb':
	    set.iratio.U238U235[0] = $("#U238U235").val();
	    set.iratio.U238U235[1] = $("#errU238U235").val();
	    set.lambda.U238[0] = $("#LambdaU238").val();
	    set.lambda.U238[1] = $("#errLambdaU238").val();
	    set.lambda.U235[0] = $("#LambdaU235").val();
	    set.lambda.U235[1] = $("#errLambdaU235").val();
	    break;
	case 'Th-U':
	    gcsettings.Th02[0] = $("#Th02").val();
	    gcsettings.Th02[1] = $("#errTh02").val();
	    gcsettings.Th02U48[0] = $("#Th0U8").val();
	    gcsettings.Th02U48[1] = $("#errTh0U8").val();
	    gcsettings.Th02U48[2] = $("#Th2U8").val();
	    gcsettings.Th02U48[3] = $("#errTh2U8").val();
	    gcsettings.Th02U48[4] = $("#U48").val();
	    gcsettings.Th02U48[5] = $("#errU48").val();
	    gcsettings.Th02U48[6] = $("#rXY").val();
	    gcsettings.Th02U48[7] = $("#rXZ").val();
	    gcsettings.Th02U48[8] = $("#rYZ").val();
	    set.lambda.Th230[0] = $("#LambdaTh230").val();
	    set.lambda.Th230[1] = $("#errLambdaTh230").val();
	    set.lambda.U234[0] = $("#LambdaU234").val();
	    set.lambda.U234[1] = $("#errLambdaU234").val();
	    set.iratio.U234U238[0] = $("#U234U238").val();
	    set.iratio.U234U238[1] = $("#errU234U238").val();
	    set.iratio.Th230Th232[0] = $("#Th230Th232").val();
	    set.iratio.Th230Th232[1] = $("#errTh230Th232").val();
	    break;
	case 'Ar-Ar':
	    set.iratio.Ar40Ar36[0] = $("#Ar40Ar36").val();
	    set.iratio.Ar40Ar36[1] = $("#errAr40Ar36").val();
	    set.lambda.K40[0] = $("#LambdaK40").val();
	    set.lambda.K40[1] = $("#errLambdaK40").val();
	    break;
	case 'K-Ca':
	    set.iratio.Ca40Ca44[0] = $('#Ca40Ca44').val();
	    set.iratio.Ca40Ca44[1] = $('#errCa40Ca44').val();
	    set.lambda.K40[0] = $("#LambdaK40").val();
	    set.lambda.K40[1] = $("#errLambdaK40").val();
	    break;
	case 'Rb-Sr':
	    set.iratio.Rb85Rb87[0] = $('#Rb85Rb87').val();
	    set.iratio.Rb85Rb87[1] = $('#errRb85Rb87').val();
	    set.iratio.Sr84Sr86[0] = $('#Sr84Sr86').val();
	    set.iratio.Sr84Sr86[1] = $('#errSr84Sr86').val();
	    set.iratio.Sr87Sr86[0] = $('#Sr87Sr86').val();
	    set.iratio.Sr87Sr86[1] = $('#errSr87Sr86').val();
	    set.iratio.Sr88Sr86[0] = $('#Sr88Sr86').val();
	    set.iratio.Sr88Sr86[1] = $('#errSr88Sr86').val();
	    set.lambda.Rb87[0] = $('#LambdaRb87').val();
	    set.lambda.Rb87[1]= $('#errLambdaRb87').val();
	    break;
	case 'Sm-Nd':
	    set.iratio.Sm144Sm152[0] = $('#Sm144Sm152').val();
	    set.iratio.Sm144Sm152[1] = $('#errSm144Sm152').val();
	    set.iratio.Sm147Sm152[0] = $('#Sm147Sm152').val();
	    set.iratio.Sm147Sm152[1] = $('#errSm147Sm152').val();
	    set.iratio.Sm148Sm152[0] = $('#Sm148Sm152').val();
	    set.iratio.Sm148Sm152[1] = $('#errSm148Sm152').val();
	    set.iratio.Sm149Sm152[0] = $('#Sm149Sm152').val();
	    set.iratio.Sm149Sm152[1] = $('#errSm149Sm152').val();
	    set.iratio.Sm150Sm152[0] = $('#Sm150Sm152').val();
	    set.iratio.Sm150Sm152[1] = $('#errSm150Sm152').val();
	    set.iratio.Sm154Sm152[0] = $('#Sm154Sm152').val();
	    set.iratio.Sm154Sm152[1] = $('#errSm154Sm152').val();
	    set.iratio.Nd142Nd144[0] = $('#Nd142Nd144').val();
	    set.iratio.Nd142Nd144[1] = $('#errNd142Nd144').val();
	    set.iratio.Nd143Nd144[0] = $('#Nd143Nd144').val();
	    set.iratio.Nd143Nd144[1] = $('#errNd143Nd144').val();
	    set.iratio.Nd145Nd144[0] = $('#Nd145Nd144').val();
	    set.iratio.Nd145Nd144[1] = $('#errNd145Nd144').val();
	    set.iratio.Nd146Nd144[0] = $('#Nd146Nd144').val();
	    set.iratio.Nd146Nd144[1] = $('#errNd146Nd144').val();
	    set.iratio.Nd148Nd144[0] = $('#Nd148Nd144').val();
	    set.iratio.Nd148Nd144[1] = $('#errNd148Nd144').val();
	    set.iratio.Nd150Nd144[0] = $('#Nd150Nd144').val();
	    set.iratio.Nd150Nd144[1] = $('#errNd150Nd144').val();
	    set.lambda.Sm147[0] = $('#LambdaSm147').val();
	    set.lambda.Sm147[1] = $('#errLambdaSm147').val();
	    break;
	case 'Re-Os':
	    set.iratio.Re185Re187[0] = $('#Re185Re187').val();
	    set.iratio.Re185Re187[1] = $('#errRe185Re187').val();
	    set.iratio.Os184Os192[0] = $('#Os184Os192').val();
	    set.iratio.Os184Os192[1] = $('#errOs184Os192').val();
	    set.iratio.Os186Os192[0] = $('#Os186Os192').val();
	    set.iratio.Os186Os192[1] = $('#errOs186Os192').val();
	    set.iratio.Os187Os192[0] = $('#Os187Os192').val();
	    set.iratio.Os187Os192[1] = $('#errOs187Os192').val();
	    set.iratio.Os188Os192[0] = $('#Os188Os192').val();
	    set.iratio.Os188Os192[1] = $('#errOs188Os192').val();
	    set.iratio.Os189Os192[0] = $('#Os189Os192').val();
	    set.iratio.Os189Os192[1] = $('#errOs189Os192').val();
	    set.iratio.Os190Os192[0] = $('#Os190Os192').val();
	    set.iratio.Os190Os192[1] = $('#errOs190Os192').val();
	    set.lambda.Re187[0] = $('#LambdaRe187').val();
	    set.lambda.Re187[1] = $('#errLambdaRe187').val();
	    break;
	case 'Lu-Hf':
	    set.iratio.Lu176Lu175[0] = $('#Lu176Lu175').val();
	    set.iratio.Lu176Lu175[1] = $('#errLu176Lu175').val();
	    set.iratio.Hf174Hf177[0] = $('#Hf174Hf177').val();
	    set.iratio.Hf174Hf177[1] = $('#errHf174Hf177').val();
	    set.iratio.Hf176Hf177[0] = $('#Hf176Hf177').val();
	    set.iratio.Hf176Hf177[1] = $('#errHf176Hf177').val();
	    set.iratio.Hf178Hf177[0] = $('#Hf178Hf177').val();
	    set.iratio.Hf178Hf177[1] = $('#errHf178Hf177').val();
	    set.iratio.Hf179Hf177[0] = $('#Hf179Hf177').val();
	    set.iratio.Hf179Hf177[1] = $('#errHf179Hf177').val();
	    set.iratio.Hf180Hf177[0] = $('#Hf180Hf177').val();
	    set.iratio.Hf180Hf177[1] = $('#errHf180Hf177').val();
	    set.lambda.Lu176[0] = $('#LambdaLu176').val();
	    set.lambda.Lu176[1] = $('#errLambdaLu176').val();
	    break;
	case 'U-Th-He':
	    set.iratio.U238U235[0] = $("#U238U235").val();
	    set.iratio.U238U235[1] = $("#errU238U235").val();
	    set.lambda.U238[0] = $("#LambdaU238").val();
	    set.lambda.U238[1] = $("#errLambdaU238").val();
	    set.lambda.U235[0] = $("#LambdaU235").val();
	    set.lambda.U235[1] = $("#errLambdaU235").val();
	    set.lambda.Th232[0] = $("#LambdaTh232").val();
	    set.lambda.Th232[1] = $("#errLambdaTh232").val();
	    set.lambda.Sm147[0] = $("#LambdaSm147").val();
	    set.lambda.Sm147[1] = $("#errLambdaSm147").val();
	    break;
	case 'detritals':
	    gcsettings.format = $("#headers-on").prop('checked') ? 1 : 2;
	    break;
	case 'fissiontracks':
	    var mineral = $('#mineral-option').prop('value');
	    gcsettings.mineral = mineral;
	    gcsettings.format = 1*$('option:selected', $("#FT-formats")).attr('value');
	    set.iratio.U238U235[0] = $("#U238U235").val();
	    set.iratio.U238U235[1] = $("#errU238U235").val();
	    set.lambda.U238[0] = $("#LambdaU238").val();
	    set.lambda.U238[1] = $("#errLambdaU238").val();
	    set.etchfact[mineral] = $("#etchfact").val();
	    set.tracklength[mineral] = $("#tracklength").val();
	    set.mindens[mineral] = $("#mindens").val();
	    break;
	default:
	}
    }

    function i2i(geochronometer){
	var gcsettings = IsoplotR.settings[geochronometer];
	switch (geochronometer){
	case 'Ar-Ar':
	    gcsettings.i2i = $("#i2iArAr").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'K-Ca':
	    gcsettings.i2i = $("#i2iKCa").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Th-U':
	    gcsettings.i2i = $("#i2iThU").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Rb-Sr':
	    gcsettings.i2i = $("#i2iRbSr").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Sm-Nd':
	    gcsettings.i2i = $("#i2iSmNd").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Re-Os':
	    gcsettings.i2i = $("#i2iReOs").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Lu-Hf':
	    gcsettings.i2i = $("#i2iLuHf").prop('checked') ? "TRUE" : "FALSE";
	    break;
	case 'Pb-Pb':
	    gcsettings.commonPb =
		1*$('option:selected', $("#common-Pb-option")).attr('value');
	    break;
	}
    }
    
    function changePlotDevice(){
	var gc = IsoplotR.settings.geochronometer;
	var opd = IsoplotR.settings.plotdevice; // old plot device
	var npd = $('option:selected', $("#plotdevice")).attr('id');
	IsoplotR.settings.plotdevice = npd;
	IsoplotR.optionschanged = false;
	$("#myplot").empty();
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
	case 'K-Ca':
	case 'Pb-Pb':
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    setSelectedMenus(['isochron','radial','average',
			      'KDE','CAD','ages']);
	    break;
	case 'U-Th-He':
	    setSelectedMenus(['helioplot','isochron',
			      'radial','average',
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
	    case "K-Ca":
	    case "Rb-Sr":
	    case "Sm-Nd":
	    case "Re-Os":
	    case "Lu-Hf":
	    case "Th-U":
	    case "other":
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
	getData4Server();
	if (IsoplotR.optionschanged){
	    recordSettings();
	    IsoplotR.optionschanged = false;
	} else {
	    handson2json();
	}
	Shiny.onInputChange("data",IsoplotR.data4server);
	Shiny.onInputChange("Rcommand",getRcommand(IsoplotR));
    }

    $.toggle_radial_pch = function(){
	var selected = $("#shownumbers").prop('checked');
	if (selected){
	    $('#radial-pch').hide();
	} else {
	    $('#radial-pch').show();
	}
    }

    $.toggle_shepard_box = function(){
	var selected = $("#classical").prop('checked');
	if (selected){
	    $('#shepard-box').hide();
	} else {
	    $('#shepard-box').show();
	}
    }
    
    $.chooseNumRadialPeaks = function(){
	IsoplotR.settings.radial.numpeaks =
	    $('option:selected', $("#mixtures")).attr('value');	
    }
    
    $.chooseTransformation = function(){
	IsoplotR.settings.radial.transformation =
	    $('option:selected', $("#transformation")).attr('value');
    }

    $.chooseConcAgeOption = function(){
	var option = 1*$('option:selected', $("#conc-age-option")).attr('value');
	if (option < 2){
	    $('.show4discordia').hide();
	} else {
	    $('.show4discordia').show();
	}
    }
    $.chooseAnchorOption = function(){
	var option = 1*$('option:selected', $("#anchor-option")).attr('value');
	IsoplotR.settings.concordia.anchor = option;
	showOrHide();
    }
    
    // method = 'U-Pb' or 'Pb-Pb'
    $.chooseCommonPbOption = function(method){
	var option = 1*$('option:selected', $("#common-Pb-option")).attr('value');
	IsoplotR.settings[method].commonPb = option;
	showOrHide();
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
    $.chooseEvolutionIsochron = function(){
	var selected =  $("#isochron-evolution").prop('checked');
	if (selected){
	    $('.show4evolutionIsochron').show();
	} else {
	    $('.show4evolutionIsochron').hide();
	}
    }
    $.chooseTh230correction = function(){
	var type = 1*$('option:selected', $("#detritus")).attr('value');
	IsoplotR.settings["Th-U"].detritus = type;
	showOrHide();
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
    $.chooseKCaformat = function(){
	chooseFormat("#KCa-formats","K-Ca")
    }
    $.chooseThUformat = function(){
	IsoplotR.settings["Th-U"].format = chooseFormat("#ThU-formats","Th-U")
	showOrHide();
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

    $.chooseRegressionFormat = function(){
	var format = 1*$('option:selected', $("#regression-format")).attr('value');
	IsoplotR.settings['other'].format = format;
	IsoplotR = populate(IsoplotR,true);
    }

    $.chooseUPbAgeType = function(){
	var type = 1*$('option:selected', $("#UPb-age-type")).attr('value');
	IsoplotR.settings["U-Pb"].type = type;
	showOrHide();
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
	outsideClickDeselects: false,
	selectionMode: 'range'
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
	    changePlotDevice();
	    IsoplotR.optionschanged = false;
	}
    });
    $("#plotdevice").selectmenu({
	change: function( event, ui ) { changePlotDevice(); }
    });
    
    $("#helpmenu").dialog({ autoOpen: false, width: 500 });
    
    $('body').on('click', 'help', function(){
	var text = help($(this).attr('id'));
	$("#helpmenu").html(text);
	$("#helpmenu").dialog('open');
	showOrHide();
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
	IsoplotR.optionschanged = false;
	var plotdevice = IsoplotR.settings.plotdevice;
	var geochronometer = IsoplotR.settings.geochronometer;
	var fname = "";
	$("#OUTPUT").hide();
	$("#myplot").show();
	$("#myplot").load("help/index.html",function(){
	    fname = "help/" + geochronometer + ".html";
	    $("#input-help").load(fname,function(){
		fname = "help/" + plotdevice + ".html";
		$("#references").load(fname,function(){
		    showOrHide();
		});
	    });
	});
    });
    
    $("#DEFAULTS").click(function(){
	$("#myplot").empty();
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
	update();
	$("#OUTPUT").hide();
	$("#myplot").html("<div id='loader' class='blink_me'>Processing...</div>");
	$("#PLOTTER").click();
    });

    $("#RUN").click(function(){
	update();
	$("#myplot").empty();
	$("#OUTPUT").handsontable('clear');
	$("#OUTPUT").handsontable('deselectCell');
	$("#OUTPUT").handsontable('setDataAtCell',0,0,'Processing...');
	$("#OUTPUT").show();
	$("#RUNNER").click();
    });

    var IsoplotR = initialise();

});
