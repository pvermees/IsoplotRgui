$(function(){

    function loadJson(filename, callback) {
        $.getJSON(filename, callback).fail(function() {
            console.error("Failed to load " + filename);
        });
    }

    function withData(callback) {
        loadJson('./js/constants.json', function(constants) {
            loadJson('./js/settings.json', function(settings) {
                loadJson('./js/data.json', function(data) {
                    loadJson('./js/languages.json', function(languages) {
                        callback(constants, settings, data, languages);
                    });
                });
            });
        });
    }

    function initialise(){
        $('#OUTPUT').hide();
        $('#RUN').hide();
        $('#CSV').hide();
        IsoplotR = {
            constants: null,
            settings: null,
            data: null,
            languages: null,
            data4server: [],
            optionschanged: false
        }
        withData(function(constants, settings, data, languages) {
            IsoplotR.constants = constants;
            IsoplotR.settings = settings;
            IsoplotR.data = data;
            IsoplotR.languages = languages;
            settings.geochronometer =
                $('option:selected', $("#geochronometer")).attr('id');
            const languageElement = document.getElementById("language");
            const lang = localStorage.getItem("language");
          	for (const i in languages.languages_supported) {
                const s = languages.languages_supported[i];
                if (lang !== null && lang.startsWith(s.prefix)) {
                    settings.language = s.code;
                }
                const option = document.createElement("option");
                option.id = "lang_" + s.code;
                option.value = s.code;
                option.innerHTML = s.name;
                languageElement.appendChild(option);
            }
            selectGeochronometer();
            IsoplotR = populate(IsoplotR,true);

            // allow tests to initiate translation, even with unsupported languages
            window.translatePage = function() {
                IsoplotR.settings.language = this.localStorage.getItem("language");
            translate();
        }

        translate();
        welcome();
        $("#INPUT").handsontable({ // add change handler asynchronously
            afterChange: function(changes,source){
                getData4Server(); // placed here because we don't want to
                handson2json();   // call the change handler until after
            }                     // IsoplotR has been initialised
        });
    });
    rrpc.initialize();
    };

    function dnc(){
	var gc = IsoplotR.settings.geochronometer;
	switch (gc){
	case 'U-Pb':
	    var format = IsoplotR.settings["U-Pb"].format;
	    switch (format){
	    case 1:
	    case 2: return 7;
	    case 3: return 10;
	    case 4:
	    case 5: return 11;
	    case 6: return 14;
	    case 7:
	    case 8: return 16;
	    }
	case 'Pb-Pb':
	    var format = IsoplotR.settings["Pb-Pb"].format;
	    switch (format){
	    case 1:
	    case 2: return 7;
	    case 3: return 8;
	    }
	case 'Ar-Ar':
	    var format = IsoplotR.settings["Ar-Ar"].format;
	    switch (format){
	    case 1:
	    case 2: return 8;
	    case 3: return 9;
	    }
	case 'Th-Pb':
	    var format = IsoplotR.settings["Th-Pb"].format;
	    switch (format){
	    case 1:
	    case 2: return 7;
	    case 3: return 8;
	    }
	case 'K-Ca':
	    var format = IsoplotR.settings["K-Ca"].format;
	    switch (format){
	    case 1:
	    case 2: return 7;
	    case 3: return 8;
	    }
	case 'Th-U':
	    var format = IsoplotR.settings["Th-U"].format;
	    switch (format){
	    case 1:
	    case 2: return 11;
	    case 3:
	    case 4: return 7;
	    }
	case 'fissiontracks':
	    var format = IsoplotR.settings.fissiontracks.format;
	    if (format<2){
		return 4;
	    } else {
		return 14;
	    }
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	case 'Lu-Hf':
	    var format = IsoplotR.settings[gc].format;
	    switch (format){
	    case 1:
	    case 2: return 7;
	    case 3: return 8;
	    }
	case 'U-Th-He':
	    return 10;
	case 'detritals':
	    var firstrow = $("#INPUT").handsontable('getData')[0];
	    var nc = firstrow.length;
	    for (var i=(nc-1); i>0; i--){
		if (firstrow[i]!=null && firstrow[i]!="") return i+1;
	    }
	case 'other':
	    switch(IsoplotR.settings.plotdevice){
	    case 'regression':
		if (IsoplotR.settings["other"].format == 1){ return 7; }
		else {return 8;}
	    case 'spectrum':
		return 5;
	    case 'radial':
	    case 'average':
		return 4;
	    case 'KDE':
	    case 'CAD':
		return 2;
	    }
	}
	return 0;
    }

    function json2handson(){
	var geochronometer = IsoplotR.settings.geochronometer;
	var json = IsoplotR.data[geochronometer];
	var gcsettings = IsoplotR.settings[geochronometer];
	switch (geochronometer){
	case "Ar-Ar":
	    $("#Jval").val(json.J[0]);
	    $("#Jerr").val(json.J[1]);
	    break;
	case "fissiontracks":
	    if (gcsettings.format < 3){
		$("#zetaVal").val(json.zeta[0]);
		$("#zetaErr").val(json.zeta[1]);
	    }
	    if (gcsettings.format < 2){
		$("#rhoDval").val(json.rhoD[0]);
		$("#rhoDerr").val(json.rhoD[1]);
	    }
	    if (gcsettings.format > 1){
		$("#spotSizeVal").val(json.spotSize);
	    }
	    if (IsoplotR.settings.plotdevice=='set-zeta'){
		$("#standAgeVal").val(json.age[0]);
		$("#standAgeErr").val(json.age[1]);
	    }
	    break;
	default:
	}
	var row;
	var handson = {
	    data: [],
	    headers: []
	};
	$.each(json.data, function(k, v) {
	    handson.headers.push(k);
	});
	var nc = handson.headers.length;
	var nr = (nc>0) ? json.data[handson.headers[0]].length : 0;
	for (var i=0; i<handson.headers.length; i++){
	    if (json.data[handson.headers[i]].length > nr) {
		nr = json.data[handson.headers[i]].length;
	    }   }
	for (var i=0; i<nr; i++){
	    row = [];
	    for (var j=0; j<nc; j++){
		row.push(json.data[handson.headers[j]][i]);
	    }
	    handson.data.push(row);
	}
	$("#INPUT").handsontable({
	    data: handson.data,
	    colHeaders: handson.headers
	});
	
	$("#language").val(IsoplotR.settings.language);
	$("#language").selectmenu("refresh");
    }
    
    // overwrites the data in the IsoplotR 
    // preferences based on the handsontable
    function handson2json(){
	var out = $.extend(true, {}, IsoplotR); // clone
	var geochronometer = out.settings.geochronometer;
	var plotdevice = out.settings.plotdevice;
	var mydata = out.data[geochronometer];
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
	    mydata.data = {}; // clear the object
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
	out.data[geochronometer] = mydata;
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
	var data = cleanData(geochronometer,d,nr,nc);
	IsoplotR.data4server = {
		nr, nc, data
	};
	switch (geochronometer){
	case  'Ar-Ar':
		IsoplotR.data4server.J = $('#Jval').val();
		IsoplotR.data4server.sJ = $('#Jerr').val();
	    break;
	case 'fissiontracks':
	    switch (IsoplotR.settings.fissiontracks.format){
	    case 1:
		IsoplotR.data4server.zeta = $('#zetaVal').val();
		IsoplotR.data4server.zetaErr = $('#zetaErr').val();
		IsoplotR.data4server.rhoD = $('#rhoDval').val();
		IsoplotR.data4server.rhoDerr = $('#rhoDerr').val();
		break;
	    case 2:
		IsoplotR.data4server.zeta = $('#zetaVal').val();
		IsoplotR.data4server.zetaErr = $('#zetaErr').val();
		IsoplotR.data4server.spotSize = $('#spotSizeVal').val();
		break;
	    case 3:
		IsoplotR.data4server.mineral = IsoplotR.settings.fissiontracks.mineral;
		IsoplotR.data4server.spotSize = $('#spotSizeVal').val();
		break;
	    }
	    break;
	}
    }

    function cleanData(geochronometer,dat,nr,nc){
	var ArAr1 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==1);
	var ArAr2 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==2);
	var ArAr3 = (geochronometer=='Ar-Ar') & (IsoplotR.settings['Ar-Ar'].format==3);
	var ThU34 = (geochronometer=='Th-U') & (IsoplotR.settings['Th-U'].format>2);
	var detrital1 = (geochronometer=='detritals') &
	    (IsoplotR.settings['detritals'].format==1);
	var omitters = ["U-Pb","Pb-Pb","Th-Pb","Ar-Ar","K-Ca","Rb-Sr","Sm-Nd",
			"Re-Os","Lu-Hf","U-Th-He","fissiontracks","Th-U","other"];
	var omissable = ($.inArray(geochronometer,omitters)>-1);
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
		    } else if (omissable & j==(nc-1) & val!=null){ // omit
			row.push(val);
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
	translate();
	switch (IsoplotR.settings.ierr){
	case 1:
	    $('.show4ierr1').show();
	    $('.hide4ierr1').hide();
	    break;
	case 2:
	    $('.show4ierr2').show();
	    $('.hide4ierr2').hide();
	    break;
	case 3:
	    $('.show4ierr3').show();
	    $('.hide4ierr3').hide();
	    break;
	case 4:
	    $('.show4ierr4').show();
	    $('.hide4ierr4').hide();
	    break;
	}
	switch (geochronometer){
	case 'U-Pb':
	    $('.show4UPb').show();
	    $('.hide4UPb').hide();
	    if (set.type==4){
		$('.show4UPbType4').show();
	    } else {
		$('.show4UPbType4').hide();
	    }
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
		$('.hide4UPb5').hide();
		break;
	    case 6:
		$('.show4UPb6').show();
		$('.hide4UPb6').hide();
		break;
	    case 7:
		$(".show4UPb7").show();
		$('.hide4UPb7').hide();
		break;
	    case 8:
		$(".show4UPb8").show();
		$('.hide4UPb8').hide();
		break;
	    }
	    switch (set.cutoffdisc){
	    case 0:
		$(".show4cutoffdisc").hide();
		break;
	    case 1:
	    case 2:
		$(".show4cutoffdisc").show();
		break;
	    }
	    if (set.diseq=='TRUE'){
		$(".show4diseq").show();
		if (set.U48[1]>0){
		    $(".show4U48diseq").show();
		} else {
		    $(".show4U48diseq").hide();
		}
		if (set.ThU[1]==3){
		    $(".show4ThUdiseq").show();
		    $(".show4ThUdiseq12").hide();
		    $(".show4ThUdiseq3").show();
		} else if (set.ThU[1]>0){
		    $(".show4ThUdiseq").show();
		    $(".show4ThUdiseq12").show();
		    $(".show4ThUdiseq3").hide();
		} else {
		    $(".show4ThUdiseq").hide();
		    $(".show4ThUdiseq12").hide();
		    $(".show4ThUdiseq3").hide();
		}
		if (set.RaU[1]>0){
		    $(".show4RaUdiseq").show();
		} else {
		    $(".show4RaUdiseq").hide();
		}
		if (set.PaU[1]>0){
		    $(".show4PaUdiseq").show();
		} else {
		    $(".show4PaUdiseq").hide();
		}
	    } else {
		$(".show4diseq").hide();
	    }
	    if (set.commonPb!=1 & pd.anchor!=1){
		$('.show4commonPbwithout204').hide();
		$('.show4commonPbwith204').hide();
		$('.show4commonPbwith208').hide();
	    } else if (set.format<4){
		$('.show4commonPbwithout204').show();
		$('.show4commonPbwith204').hide();
		$('.show4commonPbwith208').hide();
	    } else if (set.format<7){
		$('.show4commonPbwithout204').hide();
		$('.show4commonPbwith204').show();
		$('.show4commonPbwith208').hide();
	    } else {
		$('.show4commonPbwithout204').hide();
		$('.show4commonPbwith204').hide();
		$('.show4commonPbwith208').show();
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
	    if (set.commonPb==1){
		$('.show4nominalCommonPb').show();
	    } else {
		$('.show4nominalCommonPb').hide();
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
	    if (set.format<3){
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
	    } else {
		$('.show4Th230corr').show();
		$('.show4assumedTh230corr').show();
		$('.show4measuredTh230corr').hide();
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
	case 'Th-Pb':
	    $('.show4ThPb').show();
	    $('.hide4ThPb').hide();
	    switch (set.format){
	    case 1:
		$('.show4ThPb1').show();
		$('.hide4ThPb1').hide();
		break;
	    case 2:
		$('.show4ThPb2').show();
		$('.hide4ThPb2').hide();
		break;
	    case 3:
		$('.show4ThPb3').show();
		$('.hide4ThPb3').hide();
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
	    case 3:
		$('.show4KCa3').show();
		$('.hide4KCa3').hide();
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
	    case 3:
		$('.show4RbSr3').show();
		$('.hide4RbSr3').hide();
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
	    case 3:
		$('.show4SmNd3').show();
		$('.hide4SmNd3').hide();
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
	    case 3:
		$('.show4ReOs3').show();
		$('.hide4ReOs3').hide();
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
	    case 3:
		$('.show4LuHf3').show();
		$('.hide4LuHf3').hide();
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
		$('.hide4kde').hide();
		break;
	    case 'CAD':
		$('.show4cad').show();
		$('.hide4cad').hide();
		break;
	    }
	    break;
	}
	switch (plotdevice){
	case 'concordia':
    	    $('.show4concplot').show();
	    $('.hide4concplot').hide();
	    switch (pd.type){
	    case 1:
		$('.show4wetherill').show();
		$('.hide4wetherill').hide();
		break;
	    case 2:
		$('.show4terawasserburg').show();
		$('.hide4terawasserburg').hide();
		break;
	    case 3:
		$('.show4UThPbconcordia').show();
		$('.hide4UThPbconcordia').hide();
		break;
	    }
	    switch (pd.showage){
	    case 0:
		$('.show4noUPbAge').show();
		$('.hide4noUPbAge').hide();
		break;
	    case 1:
		$('.show4concordia').show();
		$('.hide4concordia').hide();
		break;
	    case 2:
		$('.show4discordia').show();
		$('.hide4discordia').hide();
		$('.show4model1').show();
		$('.hide4model1').hide();
		break;
	    case 3:
		$('.show4discordia').show();
		$('.hide4discordia').hide();
		$('.show4model2').show();
		$('.hide4model2').hide();
		break;
	    case 4:
		$('.show4discordia').show();
		$('.hide4discordia').hide();
		$('.show4model3').show();
		$('.hide4model3').hide();
		break;
	    }
	    if (pd.anchor == 2){
		$('.show4tanchor').show();
	    } else {
		$('.show4tanchor').hide();
	    }
	    break;
	case 'average':
	    if (pd.randomeffects=='TRUE'){
		$('.show4randomeffects').show();
		$('.hide4randomeffects').hide();
	    } else {
		$('.show4randomeffects').hide();
		$('.hide4randomeffects').show();		
	    }
	    break;
	case 'isochron':
	    $(".hide4isochron").hide();
	    $(".show4Th230corr").hide();
	    if (pd.anchor == 2){
		$('.show4tanchor').show();
	    } else {
		$('.show4tanchor').hide();
	    }
	case 'regression':
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
	case 'radial':
	    if (pd.shownumbers=='TRUE'){
		$('#radial-pch').hide();
	    } else {
		$('#radial-pch').show();
	    }
	    break;
	case 'ages':
	    switch (pd.showdisc){
	    case 0:
		$(".show4discordance").hide();
		break;
	    case 1:
	    case 2:
		$(".show4discordance").show();
	    }
	    $('#discoption option[value='+pd.discoption+']').
		prop('selected', 'selected');
	    switch (pd.discoption){
	    case 1:
	    case 2:
	    case 3:
	    case 4:
	    case 5:
		$('.show4ages_disc').show();
		break;
	    case 6:
		$('.show4ages_pconc').show();
	    }
	    break;
	case 'evolution':
	    $(".hide4evolution").hide();
	    if (pd.transform=='TRUE'){
		$('.show4evotrans').show();
		$('.hide4evotrans').hide();
	    } else {
		$('.show4evotrans').hide();
		$('.hide4evotrans').show();
	    }
	    if (pd.isochron=='TRUE'){
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
		$('.show4evolutionIsochron').show();
	    } else {
		$('.show4evolutionIsochron').hide();
	    }
	    break;
	case 'set-zeta':
	    $(".show4zeta").show();
	    $(".hide4zeta").hide();
	    break;
	case 'MDS':
	    if (pd.classical=='TRUE'){
		$('#shepard-box').hide();
	    } else {
		$('#shepard-box').show();
	    }
	    break;
	}
    }

    function showSettings(option){
	var set = IsoplotR.settings[option];
	var cst = IsoplotR.constants;
	showOrHide();
	$('#ierr option[value='+IsoplotR.settings.ierr+']').
	    prop('selected', 'selected');
	switch (option){
	case 'U-Pb':
	    $('#UPb-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#UPb-age-type option[value='+set.type+']').
		prop('selected', 'selected');
	    $('#common-Pb-option option[value='+set.commonPb+']').
		prop('selected', 'selected');
	    $('#discordance-filter option[value='+set.cutoffdisc+']').
		prop('selected', 'selected');
	    $('#discoption option[value='+set.discoption+']').
		prop('selected', 'selected');	    
	    $('#U48-diseq option[value='+set.U48[1]+']').
		prop('selected', 'selected');
	    $('#ThU-diseq option[value='+set.ThU[1]+']').
		prop('selected', 'selected');
	    $('#RaU-diseq option[value='+set.RaU[1]+']').
		prop('selected', 'selected');
	    $('#PaU-diseq option[value='+set.PaU[1]+']').
		prop('selected', 'selected');
	    $('#diseq').prop('checked',set.diseq=='TRUE');
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#errU238U235').val(cst.iratio.U238U235[1]);
	    $('#Pb206Pb204').val(cst.iratio.Pb206Pb204[0]);
	    $('#errPb206Pb204').val(cst.iratio.Pb206Pb204[1]);
	    $('#Pb207Pb204').val(cst.iratio.Pb207Pb204[0]);
	    $('#errPb207Pb204').val(cst.iratio.Pb207Pb204[1]);
	    $('#Pb207Pb206').val(cst.iratio.Pb207Pb206[0]);
	    $('#errPb207Pb206').val(cst.iratio.Pb207Pb206[1]);
	    $('#Pb208Pb206').val(cst.iratio.Pb208Pb206[0]);
	    $('#errPb208Pb206').val(cst.iratio.Pb208Pb206[1]);
	    $('#Pb208Pb207').val(cst.iratio.Pb208Pb207[0]);
	    $('#errPb208Pb207').val(cst.iratio.Pb208Pb207[1]);
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaU235').val(cst.lambda.U235[0]);
	    $('#errLambdaU235').val(cst.lambda.U235[1]);
	    $('#LambdaTh232').val(cst.lambda.Th232[0]);
	    $('#errLambdaTh232').val(cst.lambda.Th232[1]);
	    $('#LambdaU234').val(cst.lambda.U234[0]);
	    $('#errLambdaU234').val(cst.lambda.U234[1]);
	    $('#LambdaTh230').val(cst.lambda.Th230[0]);
	    $('#errLambdaTh230').val(cst.lambda.Th230[1]);
	    $('#LambdaRa226').val(cst.lambda.Ra226[0]);
	    $('#errLambdaRa226').val(cst.lambda.Ra226[1]);
	    $('#LambdaPa231').val(cst.lambda.Pa231[0]);
	    $('#errLambdaPa231').val(cst.lambda.Pa231[1]);
	    $('#cutoff76').val(set.cutoff76);
	    $('#mindisc').val(set.mindisc[set.discoption-1]);
	    $('#maxdisc').val(set.maxdisc[set.discoption-1]);
	    $('#U48').val(set.U48[0]);
	    $('#ThU').val(set.ThU[0]);
	    $('#RaU').val(set.RaU[0]);
	    $('#PaU').val(set.PaU[0]);
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
	    $('#errPb206Pb204').val(cst.iratio.Pb206Pb204[1]);
	    $('#Pb207Pb204').val(cst.iratio.Pb207Pb204[0]);
	    $('#errPb207Pb204').val(cst.iratio.Pb207Pb204[1]);
	    $('#inverse').prop('checked',set.inverse=='TRUE');
	    $('#projerr').prop('checked',set.projerr=='TRUE');
	    break;
	case 'Ar-Ar':
	    $('#ArAr-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#Ar40Ar36').val(cst.iratio.Ar40Ar36[0]),
	    $('#errAr40Ar36').val(cst.iratio.Ar40Ar36[1]),
	    $('#LambdaK40').val(cst.lambda.K40[0]),
	    $('#errLambdaK40').val(cst.lambda.K40[1]),
	    $('#i2iArAr').prop('checked',set.i2i=='TRUE');
	    $('#projerr').prop('checked',set.projerr=='TRUE');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
	    break;
	case 'Th-Pb':
	    $('#ThPb-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#Pb208Pb204').val(cst.iratio.Pb208Pb204[0]);
	    $('#errPb208Pb204').val(cst.iratio.Pb208Pb204[1]);
	    $('#LambdaTh232').val(cst.lambda.Th232[0]),
	    $('#errLambdaTh232').val(cst.lambda.Th232[1]),
	    $('#i2iThPb').prop('checked',set.i2i=='TRUE');
	    $('#projerr').prop('checked',set.projerr=='TRUE');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
	    break;
	case 'K-Ca':
	    $('#KCa-formats option[value='+set.format+']').
		prop('selected', 'selected');
	    $('#Ca40Ca44').val(cst.iratio.Ca40Ca44[0]);
	    $('#errCa40Ca44').val(cst.iratio.Ca40Ca44[1]);
	    $('#LambdaK40').val(cst.lambda.K40[0]),
	    $('#errLambdaK40').val(cst.lambda.K40[1]),
	    $('#i2iKCa').prop('checked',set.i2i=='TRUE');
	    $('#projerr').prop('checked',set.projerr=='TRUE');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
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
	    $('#projerr').prop('checked',set.projerr=='TRUE');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
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
	    $('#projerr').prop('checked',set.projerr=='TRUE');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
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
	    $('#projerr').prop('checked',set.projerr=='TRUE');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
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
	    $('#projerr').prop('checked',set.projerr=='TRUE');
	    $('#inverse').prop('checked',set.inverse=='TRUE');
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
	    $('#mineral-option option[value='+set.mineral+']').
		prop('selected', 'selected');
	    $('#etchfact').val(cst.etchfact[set.mineral]);
	    $('#tracklength').val(cst.tracklength[set.mineral]);
	    $('#mindens').val(cst.mindens[set.mineral]);
	    break;
	case 'detritals':
	    $('#headers-on').prop('checked',set.format==1);
	    $('#hide').val(set.hide);
	    break;
	case 'other':
	    if (IsoplotR.settings.plotdevice=='regression'){
		$('#regression-format option[value='+set.format+']').
		    prop('selected', 'selected');
	    }
	    break;
	case 'concordia':
	    $('#concordia-type option[value='+set.type+']').
		prop('selected', 'selected');
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
	    $('#ellipsefill').val(set.ellipsefill);
	    $('#ellipsestroke').val(set.ellipsestroke);
	    $('#clabel').val(set.clabel);
	    $('#ticks').val(set.ticks);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    $('#tanchor').val(set.tanchor);
	    break;
	case 'isochron':
	    $('#ThU-isochron-types option[value='+set.ThUtype+']').
		prop('selected', 'selected');
	    $('#UPb-isochron-types option[value='+set.UPbtype+']').
		prop('selected', 'selected');
	    $('#anchor-option option[value='+set.anchor+']').
		prop('selected', 'selected');
	    $('#isochron-exterr').prop('checked',set.exterr=='TRUE')
	    $('#PbPb-growth').prop('checked',set.growth=='TRUE')
	    $('#joint').prop('checked',set.joint=='TRUE')
	    $('#tanchor').val(set.tanchor);
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
	    $('#ellipsefill').val(set.ellipsefill);
	    $('#ellipsestroke').val(set.ellipsestroke);
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
	    $('#z0').val(set.z0);
	    $('#maxt').val(set.maxt);
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#bg').val(set.bg);
	    $('#clabel').val(set.clabel);
	    $('#pcex').val(set.cex);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    $('#exterr').prop('checked',set.exterr=='TRUE');
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
	    $('#rectcol').val(set.rectcol);
	    $('#outliercol').val(set.outliercol);
	    $('#clabel').val(set.clabel);
	    break;
	case 'spectrum':
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#plateau').prop('checked',set.plateau=='TRUE');
	    $('#randomeffects').prop('checked',set.randomeffects=='TRUE');
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    $('#plateaucol').val(set.plateaucol);
	    $('#nonplateaucol').val(set.nonplateaucol);
	    $('#clabel').val(set.clabel);
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
	    $('#rugdetritals').prop('checked',set.rugdetritals=='TRUE');
	    $('#rug').prop('checked',set.rug=='TRUE');
	    $('#cex').val(IsoplotR.settings.par.cex);
	    break;
	case 'CAD':
	    $('#verticals').prop('checked',set.verticals=='TRUE');
	    $('#pch').val(set.pch);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    $('#colmap').val(set.colmap);
	    break;
	case 'set-zeta':
	    $('.show4zeta').show();
	    $('.hide4zeta').hide();
	    $('#exterr').prop('checked',set.exterr=='TRUE');
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'ages':
	    if (geochronometer == 'U-Pb'){
		$('#showdisc option[value='+set.showdisc+']').
		    prop('selected', 'selected');
		$('#discoption option[value='+set.discoption+']').
		    prop('selected', 'selected');
	    }
	    if (geochronometer != 'U-Th-He') {
		$('#age-exterr').prop('checked',set.exterr=='TRUE');
	    }
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'MDS':
	    $('#classical').prop('checked',set.classical=='TRUE');
	    $('#shepard').prop('checked',set.shepard=='TRUE');
	    $('#nnlines').prop('checked',set.nnlines=='TRUE');
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
	    $('#ellipsefill').val(set.ellipsefill);
	    $('#ellipsestroke').val(set.ellipsestroke);
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
	    $('#ellipsefill').val(set.ellipsefill);
	    $('#ellipsestroke').val(set.ellipsestroke);
	    $('#evolution-isochron-models option[value='+set.model+']').
		prop('selected', 'selected');
	    $('#clabel').val(set.clabel);
	    $('#cex').val(IsoplotR.settings.par.cex);
	    break;
	default:
	}
    }

    function recordSettings(){
	var geochronometer = IsoplotR.settings.geochronometer;
	var plotdevice = IsoplotR.settings.plotdevice;
	var gcsettings = IsoplotR.settings[geochronometer];
	var pdsettings = IsoplotR.settings[plotdevice];
	var cst = IsoplotR.constants;
	switch (geochronometer){
	case 'U-Pb':
	    if (plotdevice == 'average' | plotdevice == 'KDE' |
		plotdevice == 'CAD' | plotdevice == 'radial'){
		gcsettings.type = getOption("#UPb-age-type");
		gcsettings.cutoff76 = getNumber('#cutoff76');
		gcsettings.cutoffdisc = getOption("#discordance-filter");
		var opt = getOption("#discoption");
		gcsettings.discoption = opt;
		gcsettings.mindisc[opt-1] = getNumber('#mindisc');
		gcsettings.maxdisc[opt-1] = getNumber('#maxdisc');
	    }
	    if (gcsettings.format<7 & gcsettings.type==6){
		gcsettings.type = 4;
	    }
	    gcsettings.diseq = truefalse('#diseq');
	    gcsettings.U48[1] = getOption('#U48-diseq');
	    gcsettings.ThU[1] = getOption('#ThU-diseq');
	    gcsettings.RaU[1] = getOption('#RaU-diseq');
	    gcsettings.PaU[1] = getOption('#PaU-diseq');
	    if (gcsettings.format<7 & gcsettings.ThU[1]==3){
		gcsettings.ThU[1] = 2;
	    }
	    gcsettings.U48[0] = getNumber('#U48');
	    gcsettings.ThU[0] = getNumber('#ThU');
	    gcsettings.RaU[0] = getNumber('#RaU');
	    gcsettings.PaU[0] = getNumber('#PaU');
	    cst.iratio.Pb207Pb206[0] = getNumber('#Pb207Pb206');
	    cst.iratio.Pb208Pb206[0] = getNumber('#Pb208Pb206');
	    cst.iratio.Pb208Pb207[0] = getNumber('#Pb208Pb207');
	    cst.lambda.Th232[0] = getNumber("#LambdaTh232");
	    cst.lambda.Th232[1] = getNumber("#errLambdaTh232");
	    cst.lambda.U234[0] = getNumber("#LambdaU234");
	    cst.lambda.U234[1] = getNumber("#errLambdaU234");
	    cst.lambda.Th230[0] = getNumber("#LambdaTh230");
	    cst.lambda.Th230[1] = getNumber("#errLambdaTh230");
	    cst.lambda.Ra226[0] = getNumber("#LambdaRa226");
	    cst.lambda.Ra226[1] = getNumber("#errLambdaRa226");
	    cst.lambda.Pa231[0] = getNumber("#LambdaPa231");
	    cst.lambda.Pa231[1] = getNumber("#errLambdaPa231");
	case 'Pb-Pb':
	    gcsettings.commonPb = getOption("#common-Pb-option");
	    cst.iratio.U238U235[0] = getNumber("#U238U235");
	    cst.iratio.U238U235[1] = getNumber("#errU238U235");
	    cst.lambda.U238[0] = getNumber("#LambdaU238");
	    cst.lambda.U238[1] = getNumber("#errLambdaU238");
	    cst.lambda.U235[0] = getNumber("#LambdaU235");
	    cst.lambda.U235[1] = getNumber("#errLambdaU235");
	    cst.iratio.Pb206Pb204[0] = getNumber('#Pb206Pb204');
	    cst.iratio.Pb206Pb204[1] = getNumber('#errPb206Pb204');
	    cst.iratio.Pb207Pb204[0] = getNumber('#Pb207Pb204');
	    cst.iratio.Pb207Pb204[1] = getNumber('#errPb207Pb204');
	    break;
	case 'Th-U':
	    gcsettings.detritus = getOption("#detritus");
	    gcsettings.Th02[0] = getNumber("#Th02");
	    gcsettings.Th02[1] = getNumber("#errTh02");
	    gcsettings.Th02U48[0] = getNumber("#Th0U8");
	    gcsettings.Th02U48[1] = getNumber("#errTh0U8");
	    gcsettings.Th02U48[2] = getNumber("#Th2U8");
	    gcsettings.Th02U48[3] = getNumber("#errTh2U8");
	    gcsettings.Th02U48[4] = getNumber("#U48");
	    gcsettings.Th02U48[5] = getNumber("#errU48");
	    gcsettings.Th02U48[6] = getNumber("#rXY");
	    gcsettings.Th02U48[7] = getNumber("#rXZ");
	    gcsettings.Th02U48[8] = getNumber("#rYZ");
	    cst.lambda.Th230[0] = getNumber("#LambdaTh230");
	    cst.lambda.Th230[1] = getNumber("#errLambdaTh230");
	    cst.lambda.U234[0] = getNumber("#LambdaU234");
	    cst.lambda.U234[1] = getNumber("#errLambdaU234");
	    cst.iratio.U234U238[0] = getNumber("#U234U238");
	    cst.iratio.U234U238[1] = getNumber("#errU234U238");
	    cst.iratio.Th230Th232[0] = getNumber("#Th230Th232");
	    cst.iratio.Th230Th232[1] = getNumber("#errTh230Th232");
	    break;
	case 'Ar-Ar':
	    cst.iratio.Ar40Ar36[0] = getNumber("#Ar40Ar36");
	    cst.iratio.Ar40Ar36[1] = getNumber("#errAr40Ar36");
	    cst.lambda.K40[0] = getNumber("#LambdaK40");
	    cst.lambda.K40[1] = getNumber("#errLambdaK40");
	    break;
	case 'Th-Pb':
	    cst.iratio.Pb208Pb204[0] = getNumber('#Pb208Pb204');
	    cst.iratio.Pb208Pb204[1] = getNumber('#errPb208Pb204');
	    cst.lambda.Th232[0] = getNumber("#LambdaTh232");
	    cst.lambda.Th232[1] = getNumber("#errLambdaTh232");
	    break;
	case 'K-Ca':
	    cst.iratio.Ca40Ca44[0] = getNumber('#Ca40Ca44');
	    cst.iratio.Ca40Ca44[1] = getNumber('#errCa40Ca44');
	    cst.lambda.K40[0] = getNumber("#LambdaK40");
	    cst.lambda.K40[1] = getNumber("#errLambdaK40");
	    break;
	case 'Rb-Sr':
	    cst.iratio.Rb85Rb87[0] = getNumber('#Rb85Rb87');
	    cst.iratio.Rb85Rb87[1] = getNumber('#errRb85Rb87');
	    cst.iratio.Sr84Sr86[0] = getNumber('#Sr84Sr86');
	    cst.iratio.Sr84Sr86[1] = getNumber('#errSr84Sr86');
	    cst.iratio.Sr87Sr86[0] = getNumber('#Sr87Sr86');
	    cst.iratio.Sr87Sr86[1] = getNumber('#errSr87Sr86');
	    cst.iratio.Sr88Sr86[0] = getNumber('#Sr88Sr86');
	    cst.iratio.Sr88Sr86[1] = getNumber('#errSr88Sr86');
	    cst.lambda.Rb87[0] = getNumber('#LambdaRb87');
	    cst.lambda.Rb87[1]= getNumber('#errLambdaRb87');
	    break;
	case 'Sm-Nd':
	    cst.iratio.Sm144Sm152[0] = getNumber('#Sm144Sm152');
	    cst.iratio.Sm144Sm152[1] = getNumber('#errSm144Sm152');
	    cst.iratio.Sm147Sm152[0] = getNumber('#Sm147Sm152');
	    cst.iratio.Sm147Sm152[1] = getNumber('#errSm147Sm152');
	    cst.iratio.Sm148Sm152[0] = getNumber('#Sm148Sm152');
	    cst.iratio.Sm148Sm152[1] = getNumber('#errSm148Sm152');
	    cst.iratio.Sm149Sm152[0] = getNumber('#Sm149Sm152');
	    cst.iratio.Sm149Sm152[1] = getNumber('#errSm149Sm152');
	    cst.iratio.Sm150Sm152[0] = getNumber('#Sm150Sm152');
	    cst.iratio.Sm150Sm152[1] = getNumber('#errSm150Sm152');
	    cst.iratio.Sm154Sm152[0] = getNumber('#Sm154Sm152');
	    cst.iratio.Sm154Sm152[1] = getNumber('#errSm154Sm152');
	    cst.iratio.Nd142Nd144[0] = getNumber('#Nd142Nd144');
	    cst.iratio.Nd142Nd144[1] = getNumber('#errNd142Nd144');
	    cst.iratio.Nd143Nd144[0] = getNumber('#Nd143Nd144');
	    cst.iratio.Nd143Nd144[1] = getNumber('#errNd143Nd144');
	    cst.iratio.Nd145Nd144[0] = getNumber('#Nd145Nd144');
	    cst.iratio.Nd145Nd144[1] = getNumber('#errNd145Nd144');
	    cst.iratio.Nd146Nd144[0] = getNumber('#Nd146Nd144');
	    cst.iratio.Nd146Nd144[1] = getNumber('#errNd146Nd144');
	    cst.iratio.Nd148Nd144[0] = getNumber('#Nd148Nd144');
	    cst.iratio.Nd148Nd144[1] = getNumber('#errNd148Nd144');
	    cst.iratio.Nd150Nd144[0] = getNumber('#Nd150Nd144');
	    cst.iratio.Nd150Nd144[1] = getNumber('#errNd150Nd144');
	    cst.lambda.Sm147[0] = getNumber('#LambdaSm147');
	    cst.lambda.Sm147[1] = getNumber('#errLambdaSm147');
	    break;
	case 'Re-Os':
	    cst.iratio.Re185Re187[0] = getNumber('#Re185Re187');
	    cst.iratio.Re185Re187[1] = getNumber('#errRe185Re187');
	    cst.iratio.Os184Os192[0] = getNumber('#Os184Os192');
	    cst.iratio.Os184Os192[1] = getNumber('#errOs184Os192');
	    cst.iratio.Os186Os192[0] = getNumber('#Os186Os192');
	    cst.iratio.Os186Os192[1] = getNumber('#errOs186Os192');
	    cst.iratio.Os187Os192[0] = getNumber('#Os187Os192');
	    cst.iratio.Os187Os192[1] = getNumber('#errOs187Os192');
	    cst.iratio.Os188Os192[0] = getNumber('#Os188Os192');
	    cst.iratio.Os188Os192[1] = getNumber('#errOs188Os192');
	    cst.iratio.Os189Os192[0] = getNumber('#Os189Os192');
	    cst.iratio.Os189Os192[1] = getNumber('#errOs189Os192');
	    cst.iratio.Os190Os192[0] = getNumber('#Os190Os192');
	    cst.iratio.Os190Os192[1] = getNumber('#errOs190Os192');
	    cst.lambda.Re187[0] = getNumber('#LambdaRe187');
	    cst.lambda.Re187[1] = getNumber('#errLambdaRe187');
	    break;
	case 'Lu-Hf':
	    cst.iratio.Lu176Lu175[0] = getNumber('#Lu176Lu175');
	    cst.iratio.Lu176Lu175[1] = getNumber('#errLu176Lu175');
	    cst.iratio.Hf174Hf177[0] = getNumber('#Hf174Hf177');
	    cst.iratio.Hf174Hf177[1] = getNumber('#errHf174Hf177');
	    cst.iratio.Hf176Hf177[0] = getNumber('#Hf176Hf177');
	    cst.iratio.Hf176Hf177[1] = getNumber('#errHf176Hf177');
	    cst.iratio.Hf178Hf177[0] = getNumber('#Hf178Hf177');
	    cst.iratio.Hf178Hf177[1] = getNumber('#errHf178Hf177');
	    cst.iratio.Hf179Hf177[0] = getNumber('#Hf179Hf177');
	    cst.iratio.Hf179Hf177[1] = getNumber('#errHf179Hf177');
	    cst.iratio.Hf180Hf177[0] = getNumber('#Hf180Hf177');
	    cst.iratio.Hf180Hf177[1] = getNumber('#errHf180Hf177');
	    cst.lambda.Lu176[0] = getNumber('#LambdaLu176');
	    cst.lambda.Lu176[1] = getNumber('#errLambdaLu176');
	    break;
	case 'U-Th-He':
	    cst.iratio.U238U235[0] = getNumber("#U238U235");
	    cst.iratio.U238U235[1] = getNumber("#errU238U235");
	    cst.lambda.U238[0] = getNumber("#LambdaU238");
	    cst.lambda.U238[1] = getNumber("#errLambdaU238");
	    cst.lambda.U235[0] = getNumber("#LambdaU235");
	    cst.lambda.U235[1] = getNumber("#errLambdaU235");
	    cst.lambda.Th232[0] = getNumber("#LambdaTh232");
	    cst.lambda.Th232[1] = getNumber("#errLambdaTh232");
	    cst.lambda.Sm147[0] = getNumber("#LambdaSm147");
	    cst.lambda.Sm147[1] = getNumber("#errLambdaSm147");
	    break;
	case 'detritals':
	    gcsettings.format = $("#headers-on").prop('checked') ? 1 : 2;
	    gcsettings.hide = $('#hide').val();
	    break;
	case 'fissiontracks':
	    gcsettings.format = getOption("#FT-formats");
	    cst.iratio.U238U235[0] = getNumber("#U238U235");
	    cst.iratio.U238U235[1] = getNumber("#errU238U235");
	    cst.lambda.U238[0] = getNumber("#LambdaU238");
	    cst.lambda.U238[1] = getNumber("#errLambdaU238");
	    if (gcsettings.format == 3){
		cst.lambda.fission[0] = getNumber("#LambdaFission");
		cst.lambda.fission[1] = getNumber("#errLambdaFission");
		gcsettings.mineral = $('#mineral-option').prop('value');
		cst.etchfact[gcsettings.mineral] = getNumber("#etchfact");
		cst.tracklength[gcsettings.mineral] = getNumber("#tracklength");
		cst.mindens[gcsettings.mineral] = getNumber("#mindens");
	    }
	    break;
	default:
	}
	switch (plotdevice){
	case 'concordia':
	    pdsettings.type = getOption('#concordia-type');
	    pdsettings.exterr = truefalse('#exterr');
	    pdsettings.shownumbers = truefalse('#shownumbers');
	    pdsettings.showage = getOption('#conc-age-option');
	    pdsettings.mint = check($('#mint').val(),'auto');
	    pdsettings.maxt = check($('#maxt').val(),'auto');
	    pdsettings.minx = check($('#minx').val(),'auto');
	    pdsettings.maxx = check($('#maxx').val(),'auto');
	    pdsettings.miny = check($('#miny').val(),'auto');
	    pdsettings.maxy = check($('#maxy').val(),'auto');
	    pdsettings.ellipsefill = $('#ellipsefill').val();
	    pdsettings.ellipsestroke = $('#ellipsestroke').val();
	    pdsettings.clabel = $('#clabel').val();
	    pdsettings.ticks = $('#ticks').val();
	    pdsettings.alpha = getNumber('#alpha');
	    pdsettings.sigdig = getInt('#sigdig');
	    pdsettings.anchor = getOption("#anchor-option")
	    pdsettings.tanchor = getNumber('#tanchor');
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    break;
	case 'isochron':
	    pdsettings.UPbtype = getOption("#UPb-isochron-types");
	    pdsettings.ThUtype = getOption("#ThU-isochron-types");
	    pdsettings.anchor = getOption("#anchor-option")
	    pdsettings.tanchor = getNumber('#tanchor');
	    pdsettings.exterr = truefalse('#isochron-exterr');
	    pdsettings.growth = truefalse('#PbPb-growth');
	    pdsettings.joint = truefalse('#joint');
	    pdsettings.model = getOption("#isochron-models");
	    inverse(geochronometer);
	case 'regression':
	    pdsettings.shownumbers = truefalse('#shownumbers');
	    pdsettings.model = getOption("#isochron-models");
	    pdsettings.minx = check($('#isochron-minx').val(),'auto');
	    pdsettings.maxx = check($('#isochron-maxx').val(),'auto');
	    pdsettings.miny = check($('#isochron-miny').val(),'auto');
	    pdsettings.maxy = check($('#isochron-maxy').val(),'auto');
	    pdsettings.ellipsefill = $('#ellipsefill').val();
	    pdsettings.ellipsestroke = $('#ellipsestroke').val();
	    pdsettings.clabel = $('#clabel').val();
	    pdsettings.alpha = getNumber('#alpha');
	    pdsettings.sigdig = getInt('#sigdig');
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    break;
	case 'radial':
	    pdsettings.shownumbers = truefalse('#shownumbers');
	    pdsettings.transformation = getOption("#transformation");
	    pdsettings.numpeaks = getOption("#mixtures");
	    pdsettings.mint = check($('#mint').val(),'auto');
	    pdsettings.z0 = check($('#z0').val(),'auto');
	    pdsettings.maxt = check($('#maxt').val(),'auto');
	    pdsettings.alpha = getNumber('#alpha');
	    pdsettings.sigdig = getInt('#sigdig');
	    pdsettings.pch = $('#pch').val();
	    pdsettings.bg = $('#bg').val();
	    pdsettings.clabel = $('#clabel').val();
	    pdsettings["cex"] = getNumber('#pcex');
	    pdsettings.exterr = truefalse('#exterr');
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    i2i(geochronometer);
	    break;
	case 'average':
	    pdsettings.exterr = truefalse('#exterr');
	    pdsettings["outliers"] = truefalse('#outliers');
	    pdsettings["randomeffects"] = truefalse('#randomeffects');
	    pdsettings["ranked"] = truefalse('#ranked');
	    pdsettings.alpha = getNumber('#alpha');
	    pdsettings.sigdig = getInt('#sigdig');
	    pdsettings.mint = check($('#mint').val(),'auto');
	    pdsettings.maxt = check($('#maxt').val(),'auto');
	    pdsettings.rectcol = $('#rectcol').val();
	    pdsettings.outliercol = $('#outliercol').val();
	    pdsettings.clabel = $('#clabel').val();
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    i2i(geochronometer);
	    break;
	case 'spectrum':
	    pdsettings.exterr = truefalse('#exterr');
	    pdsettings.plateau = truefalse('#plateau');
	    pdsettings.randomeffects = truefalse('#randomeffects');
	    pdsettings.alpha = getNumber('#alpha');
	    pdsettings.sigdig = getInt('#sigdig');
	    pdsettings.plateaucol = $('#plateaucol').val();
	    pdsettings.nonplateaucol = $('#nonplateaucol').val();
	    pdsettings.clabel = $('#clabel').val();
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    i2i(geochronometer);
	    break;
	case 'KDE':
	    pdsettings["showhist"] = truefalse('#showhist');
	    pdsettings["adaptive"] = truefalse('#adaptive');
	    pdsettings["samebandwidth"] = truefalse('#samebandwidth');
	    pdsettings["normalise"] = truefalse('#normalise');
	    pdsettings["log"] = truefalse('#log');
	    pdsettings["minx"] = check($('#minx').val(),'auto');
	    pdsettings["maxx"] = check($('#maxx').val(),'auto');
	    pdsettings["bandwidth"] = check($('#bandwidth').val(),'auto');
	    pdsettings["binwidth"] = check($('#binwidth').val(),'auto');
	    pdsettings["rugdetritals"] = truefalse('#rugdetritals');
	    pdsettings["rug"] = truefalse('#rug');
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    i2i(geochronometer);
	    break;
	case 'CAD':
	    pdsettings["pch"] = $('#pch').val();
	    pdsettings["colmap"] = $('#colmap').val();
	    pdsettings["verticals"] = truefalse('#verticals');
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    i2i(geochronometer);
	    break;
	case 'set-zeta':
	    IsoplotR.data.fissiontracks.age[0] =
		getNumber('#standAgeVal');
	    IsoplotR.data.fissiontracks.age[1] =
		getNumber('#standAgeErr');
	    pdsettings.exterr = truefalse('#exterr');
	    pdsettings.sigdig = getInt('#sigdig');
	    break;
	case 'MDS':
	    pdsettings["classical"] = truefalse('#classical');
	    pdsettings["shepard"] = truefalse('#shepard');
	    pdsettings["nnlines"] = truefalse('#nnlines');
	    pdsettings["pch"] = $('#pch').val();
	    pdsettings["pos"] = getInt('#pos');
	    pdsettings["col"] = $('#col').val();
	    pdsettings["bg"] = $('#bg').val();
	    pdsettings["cex"] = getNumber('#pcex');
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    break;
	case 'ages':
	    if (geochronometer == 'U-Pb'){
		pdsettings.showdisc = getOption('#showdisc');
		pdsettings.discoption = getOption('#discoption');
	    }
	    if (geochronometer != 'U-Th-He'){
		pdsettings.exterr = truefalse('#age-exterr');
	    }
	    pdsettings.sigdig = getInt('#sigdig');
	    i2i(geochronometer);
	    if (projerr(geochronometer)){
		gcsettings.projerr = truefalse("#projerr");
	    }
	    break;
	case 'helioplot':
	    pdsettings.logratio = truefalse('#logratio');
	    pdsettings.shownumbers = truefalse('#shownumbers');
	    pdsettings.showcentralcomp = truefalse('#showcentralcomp');
	    pdsettings["alpha"] = getNumber('#alpha');
	    pdsettings["sigdig"] = getInt('#sigdig');
	    pdsettings["minx"] = check($('#minx').val(),'auto');
	    pdsettings["maxx"] = check($('#maxx').val(),'auto');
	    pdsettings["miny"] = check($('#miny').val(),'auto');
	    pdsettings["maxy"] = check($('#maxy').val(),'auto');
	    pdsettings["fact"] = $('#fact').val();
	    pdsettings.ellipsefill = $('#ellipsefill').val();
	    pdsettings.ellipsestroke = $('#ellipsestroke').val();
	    pdsettings.model = getOption("#helioplot-models");
	    pdsettings.clabel = $('#clabel').val();
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    break;
	case 'evolution':
	    pdsettings.transform = truefalse('#transform-evolution');
	    pdsettings.isochron = truefalse('#isochron-evolution');
	    pdsettings.shownumbers = truefalse('#shownumbers');
	    pdsettings.exterr = truefalse('#exterr');
	    pdsettings.min08 = check($('#min08').val(),'auto');
	    pdsettings.max08 = check($('#max08').val(),'auto');
	    pdsettings.min48 = check($('#min48').val(),'auto');
	    pdsettings.max48 = check($('#max48').val(),'auto');
	    pdsettings.mint = check($('#mint').val(),'auto');
	    pdsettings.maxt = check($('#maxt').val(),'auto');
	    pdsettings.alpha = getNumber('#alpha');
	    pdsettings.sigdig = getInt('#sigdig');
	    pdsettings.ellipsefill = $('#ellipsefill').val();
	    pdsettings.ellipsestroke = $('#ellipsestroke').val();
	    pdsettings.model = getOption("#evolution-isochron-models");
	    pdsettings.clabel = $('#clabel').val();
	    IsoplotR.settings.par.cex = getNumber('#cex');
	    i2i(geochronometer);
	    break;
	default:
	}
    }

    function inverse(geochronometer){
	var gcsettings = IsoplotR.settings[geochronometer];
	if ($.inArray(geochronometer,['Pb-Pb','Ar-Ar','Th-Pb','K-Ca',
				      'Rb-Sr','Sm-Nd','Lu-Hf','Re-Os'])>-1){
	    gcsettings.inverse = truefalse('#inverse');
	}
    }
    
    function i2i(geochronometer){
	var gcsettings = IsoplotR.settings[geochronometer];
	switch (geochronometer){
	case 'Ar-Ar':
	    gcsettings.i2i = truefalse("#i2iArAr");
	    break;
	case 'Th-Pb':
	    gcsettings.i2i = truefalse("#i2iThPb");
	    break;
	case 'K-Ca':
	    gcsettings.i2i = truefalse("#i2iKCa");
	    break;
	case 'Th-U':
	    gcsettings.i2i = truefalse("#i2iThU");
	    break;
	case 'Rb-Sr':
	    gcsettings.i2i = truefalse("#i2iRbSr");
	    break;
	case 'Sm-Nd':
	    gcsettings.i2i = truefalse("#i2iSmNd");
	    break;
	case 'Re-Os':
	    gcsettings.i2i = truefalse("#i2iReOs");
	    break;
	case 'Lu-Hf':
	    gcsettings.i2i = truefalse("#i2iLuHf");
	    break;
	case 'Pb-Pb':
	    gcsettings.commonPb = getOption("#common-Pb-option");
	    break;
	}
    }

    function projerr(gc){
	return(gc=='Pb-Pb' | gc=='Ar-Ar' | gc=='K-Ca' |
	       gc=='Th-Pb' | gc=='Rb-Sr' | gc=='Sm-Nd' |
	       gc=='Re-Os' | gc=='Lu-Hf');
    }
    
    function changePlotDevice(){
	var gc = IsoplotR.settings.geochronometer;
	var opd = IsoplotR.settings.plotdevice; // old plot device
	var npd = $('option:selected', $("#plotdevice")).attr('value');
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
	    errconvert();
	} else {
	    populate(IsoplotR,false); 
	}
	if (gc == 'fissiontracks' & npd == 'set-zeta'){
	    $(".show4zeta").show();
	} else {
	    $(".show4zeta").hide();
	}
	if (npd=='radial'){
	    $.transformation();
	}
	showOrHide();
    }

    function changeLanguage(lang) {
	let language = lang;
	IsoplotR.settings.language = language;
	localStorage.setItem("language", language);
	showOrHide();
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
	    setSelectedMenus(['concordia','isochron','radial',
			      'average','KDE','CAD','ages']);
	    break;
	case 'Ar-Ar':
	    setSelectedMenus(['isochron','radial','spectrum',
			      'average','KDE','CAD','ages']);
	    $("#Jdiv").show();
	    $(".helioplot").hide()
	    break;
	case 'Th-Pb':
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
	errconvert();
	$("#plotdevice").selectmenu("refresh");
    }

    function setSelectedMenus(options){
	var html = '';
	if ($.inArray('concordia',options)>-1)
	    html += '<option id="concordia" value="concordia">concordia</option>';
	if ($.inArray('helioplot',options)>-1)
	    html += '<option id="helioplot" value="helioplot">helioplot</option>';
	if ($.inArray('evolution',options)>-1)
	    html += '<option id="evolution" value="evolution">evolution</option>';
	if ($.inArray('isochron',options)>-1)
	    html += '<option id="isochron" value="isochron">isochron</option>';
	if ($.inArray('radial',options)>-1)
	    html += '<option id="radial" value="radial">radial plot</option>';
	if ($.inArray('regression',options)>-1)
	    html += '<option id="regression" value="regression">regression</option>';
	if ($.inArray('spectrum',options)>-1)
	    html += '<option id="spectrum" value="spectrum">age spectrum</option>';
	if ($.inArray('average',options)>-1)
	    html += '<option id="average" value="average">weighted mean</option>';
	if ($.inArray('KDE',options)>-1)
	    html += '<option id="KDE" value="KDE">KDE</option>';
	if ($.inArray('CAD',options)>-1)
	    html += '<option id="CAD" value="CAD">CAD</option>';
	if ($.inArray('set-zeta',options)>-1)
	    html += '<option id="set-zeta" value="set-zeta">get &zeta;</option>';
	if ($.inArray('MDS',options)>-1)
	    html += '<option id="MDS" value="MDS">MDS</option>';
	if ($.inArray('ages',options)>-1)
	    html += '<option id="ages" value="ages">ages</option>';
	$('#plotdevice').html(html);
	$(options[0]).prop('selected',true);
	IsoplotR.settings.plotdevice = 
	    $('option:selected', $("#plotdevice")).attr('value');
    }

    // populate the handsontable with stored data
    function populate(prefs,refreshdata){
	var geochronometer = prefs.settings.geochronometer;
	var plotdevice = prefs.settings.plotdevice;
	var data = prefs.data[geochronometer];
	if (refreshdata | $.isEmptyObject(data)){
	    switch (geochronometer){
	    case "U-Pb":
	    case "Pb-Pb":
	    case "Th-Pb":
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
		prefs.data[geochronometer] =
		    example(geochronometer,plotdevice,format);
		break;
	    default:
		prefs.data[geochronometer] =
		    example(geochronometer,plotdevice);
	    }
	}
	json2handson();
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
    }

    function multiplytwo(x,num,vec,divide){
	var out = x[1];
	var ndig = getSignificantDigits(x[1]);
	if (Number(x[1])){
	    out = num*x[1];
	    if (vec && divide){ out /= x[0]; }
	    else if (vec){ out *= x[0]; }
	    out = setSignificantDigits(out,ndig);
	}
	return out;
    }

    function multiply(num,vec,divide){
	var gc = IsoplotR.settings.geochronometer;
	var pd = IsoplotR.settings.plotdevice;
	var data = IsoplotR.data[gc].data;
	var headers = $("#INPUT").handsontable("getColHeader");
	var format = (gc=='U-Th-He') ? 0 : IsoplotR.settings[gc].format;
	var cols = getErrCols(gc,pd,format);
	var pair = [0,0];
	var errname = null;
	var muname = null;
	for (var i=0; i<cols.length; i++){
	    errname = headers[cols[i]];
	    muname = headers[cols[i]-1];
	    for (var j=0; j<data[errname].length; j++){
		pair[0] = data[muname][j];
		pair[1] = data[errname][j];
		IsoplotR.data[gc].data[errname][j] =
		    multiplytwo(pair,num,vec,divide);
	    }
	}
	if (gc=='Ar-Ar'){
	    var J = IsoplotR.data[gc].J;
	    IsoplotR.data[gc].J[1] =
		multiplytwo(J,num,vec,divide);
	} else if (gc=='fissiontracks'){
	    var age = IsoplotR.data[gc].age;
	    IsoplotR.data[gc].age[1] =
		multiplytwo(age,num,vec,divide);
	    if (format<3){
		var zeta = IsoplotR.data[gc].zeta;
		IsoplotR.data[gc].zeta[1] =
		    multiplytwo(zeta,num,vec,divide);
	    }
	    if (format==1){
		var rhoD = IsoplotR.data[gc].rhoD;
		IsoplotR.data[gc].rhoD[1] =
		    multiplytwo(rhoD,num,vec,divide);
	    }
	}
    }

    function getErrCols(gc,pd,format){
	var UPb12 = (gc=='U-Pb' && ($.inArray(format,[1,2])>-1));
	var UPb345 = (gc=='U-Pb' && ($.inArray(format,[3,4,5])>-1));
	var UPb6 = (gc=='U-Pb' && format==6);
	var UPb78 = (gc=='U-Pb' && ($.inArray(format,[7,8])>-1));
	var PbPb12 = (gc=='Pb-Pb' && ($.inArray(format,[1,2])>-1));
	var PbPb3 = (gc=='Pb-Pb' && format==3);
	var ArAr12 = (gc=='Ar-Ar' && ($.inArray(format,[1,2])>-1));
	var ArAr3 = (gc=='Ar-Ar' && format==3);
	var ThPb12 = (gc=='Th-Pb' && format<3);
	var ThPb3 = (gc=='Th-Pb' && format==3);
	var KCa12 = (gc=='K-Ca' && format<3);
	var KCa3 = (gc=='K-Ca' && format==3);
	var RbSr12 = (gc=='Rb-Sr' && format<3);
	var RbSr3 = (gc=='Rb-Sr' && format==3);
	var SmNd12 = (gc=='Sm-Nd' && format<3);
	var SmNd3 = (gc=='Sm-Nd' && format==3);
	var ReOs12 = (gc=='Re-Os' && format<3);
	var ReOs3 = (gc=='Re-Os' && format==3);
	var LuHf12 = (gc=='Lu-Hf' && format<3);
	var LuHf3 = (gc=='Lu-Hf' && format==3);
	var UThHe = (gc=='U-Th-He');
	var FT23 = (gc=='fissiontracks' && format>1);
	var ThU12 = (gc=='Th-U' && format<3);
	var ThU34 = (gc=='Th-U' && format>2);
	var radial = (gc=='other' && pd=='radial');
	var regression = (gc=='other' && pd=='regression');
	var spectrum = (gc=='other' && pd=='spectrum');
	var average = (gc=='other' && pd=='average');
	if (UPb12 || PbPb12 || ArAr12 || ThPb12 ||
	    KCa12 || RbSr12 || SmNd12 || ReOs12 ||
	    LuHf12 || ThU34 || regression){
	    cols = [1,3];
	} else if (UPb345 || PbPb3 || ArAr3 || ThPb3 ||
		   KCa3 || RbSr3 || SmNd3 || ReOs3 ||
		   LuHf3 || UThHe || ThU12){
	    cols = [1,3,5];
	} else if (UPb78){
	    cols = [1,3,5,7];
	} else if (UPb6){
	    cols = [1,3,5,7,9,11];
	} else if (FT23){
	    cols = [3,5,7,9,11];
	} else if (radial || average){
	    cols = [1];
	} else if (spectrum){
	    cols = [2];
	} else {
	    cols = [];
	}
	return(cols);
    }
    
    function errconvert(){
	var gc = IsoplotR.settings.geochronometer;
	var from = IsoplotR.data[gc].ierr;
	var to = IsoplotR.settings.ierr;
	if (to == from){
	    // do nothing
	} else {
	    if (from==1 && to==2){
		multiply(2,false,false);
	    } else if (from==1 && to==3){
		multiply(100,true,true);
	    } else if (from==1 && to==4){
		multiply(200,true,true);
	    } else if (from==2 && to==1){
		multiply(0.5,false,false);
	    } else if (from==2 && to==3){
		multiply(50,true,true);
	    } else if (from==2 && to==4){
		multiply(100,true,true);
	    } else if (from==3 && to==1){
		multiply(0.01,true,false);
	    } else if (from==3 && to==2){
		multiply(0.02,true,false);
	    } else if (from==3 && to==4){
		multiply(2,false,false);
	    } else if (from==4 && to==1){
		multiply(0.005,true,false);
	    } else if (from==4 && to==2){
		multiply(0.01,true,false);
	    } else if (from==4 && to==3){
		multiply(0.5,false,false);
	    }
	    IsoplotR.data[gc].ierr = to;
	    json2handson();
	    showOrHide();
	}
    }

    function welcome(){
	$("#myplot").load('welcome.html',function(){
	    showOrHide();
	    $("#version").load('version.txt');
	});
    }

    function loadLanguage(language, callback) {
	const dir = './locales/' + language + '/';
	$.getJSON(dir + 'dictionary_id.json', function(tags) {
	    return $.getJSON(dir + 'dictionary_class.json', function(classes) {
		return $.getJSON(dir + 'contextual_help.json', function(helps) {
		    callback(tags, classes, helps);
		});
	    });
	}).fail(function() {
	    console.warn("Failed to load language '" + language + "'");
	    callback({}, {}, {});
	});
    }

    function withFallbackLanguage(lang, callback) {
	if (!contextual_help_fallback) {
	    loadLanguage(lang, function(tags, classes, helps) {
		dictionary_id_fallback = tags;
		dictionary_class_fallback = classes;
		contextual_help_fallback = helps;
		callback();
	    });
	} else {
	    callback();
	}
    }

    function withLanguage(language, translate_function) {
	if (language && language === loaded_language) {
	    return translate_function();
	}
	const fallbackLanguage = 'en';
	withFallbackLanguage(fallbackLanguage, function() {
	    if (language === fallbackLanguage) {
		dictionary_id = dictionary_id_fallback;
		dictionary_class = dictionary_class_fallback;
		contextual_help = contextual_help_fallback;
		loaded_language = fallbackLanguage;
		translate_function();
	    } else {
		loadLanguage(language, function(tags, classes, helps) {
		    dictionary_id = tags;
		    dictionary_class = classes;
		    contextual_help = helps;
		    loaded_language = language;
		    translate_function();
		});
	    }
	});
    }

    function getFallbackText(key, fallback_messages, filename) {
        let link = IsoplotR.languages["translation_link"]
            .replace("${FILENAME}", filename)
            .replace("${LANGUAGE}", IsoplotR.settings.language)
            .replace("${ID}", key);
        let button = dictionary_id["translate_button"]
            .replace("${LINK}", link);
        return fallback_messages[key] + button;
    }

    function getItem(key, obj, fallback, filename) {
	return key in obj? obj[key] : getFallbackText(key, fallback, filename);
    }

    function getItemDictionaryClass(key) {
	return getItem(key, dictionary_class, dictionary_class_fallback,
		       "dictionary_class");
    }

    function getItemContextualHelp(key) {
	return getItem(key, contextual_help, contextual_help_fallback,
		       "contextual_help");
    }

    function translateDictionaryId(element) {
	const key = element.id;
	if (key in dictionary_id) {
	    element.innerHTML = dictionary_id[key];
	    return;
	}
	if (element.tagName.toUpperCase() !== 'OPTION') {
	    element.innerHTML = getFallbackText(key, dictionary_id_fallback, "dictionary_id");
	    return;
	}
	// cannot put a link into option
	element.innerHTML = dictionary_id_fallback[key];
    }

    function translate() {
	const language = IsoplotR.settings.language;
	withLanguage(language, function() {
	    $(".translate").each(function(i){
		translateDictionaryId(this);
	    });
	    $("translate").each(function(i){
		this.innerHTML = getItemDictionaryClass(this.className);
	    });
	    // sadly, we cannot put a "translate" link into a jQuery dialog
	    // so we cannot use getItemContextualHelp
	    const helpTitle = 'help' in contextual_help?
		  contextual_help['help'] : contextual_help_fallback['help'];
	    $("#helpmenu").dialog('option', 'title', helpTitle);
	});
    }
    
    $.switchErr = function(){
	IsoplotR.settings.ierr = getInt("#ierr");
	errconvert();
    }
    
    $.register = function(){
	recordSettings();
	showOrHide();
    }

    $.tutorial = function(){
	$("#myplot").load( "tutorial.html" , function() {
	    showOrHide();
	});
    }

    $.chooseUPbFormat = function(){
	var oldformat = IsoplotR.settings["U-Pb"].format;
	var newformat = getInt('#UPb-formats');
	var upgrade = (oldformat<4 & newformat>3);
	var downgrade = (oldformat>3 & newformat<4);
	var pd = IsoplotR.settings.plotdevice;
	if (pd=='concordia'){
	    IsoplotR.settings.concordia.type = getOption('#concordia-type');
	    if (newformat<7 & IsoplotR.settings.concordia.type==3){
		IsoplotR.settings.concordia.type = 2;
		$('#concordia-type option[value=2]').prop('selected', 'selected');
	    }
	}
	$.chooseFormat('#UPb-formats',"U-Pb");
	showSettings(pd);
	if (IsoplotR.settings["U-Pb"].ThU[1]==3 &
	    IsoplotR.settings["U-Pb"].format<7){
	    IsoplotR.settings["U-Pb"].ThU[1] = 0;
	}
    }

    $.transformation = function(){
	var set = IsoplotR.settings;
	if (set.geochronometer=='fissiontracks' &&
	    set.fissiontracks.format==1){
	    if(set.radial.transformation=='sqrt'){
		set.radial.transformation = 'arcsin';
		$('#transformation option[value="arcsin"]').prop('selected', 'selected');
	    }
	} else {
	    if (set.radial.transformation=='arcsin'){
		set.radial.transformation = 'log';
		$('#transformation option[value="log"]').prop('selected', 'selected');
	    }
	}
    }
    
    $.chooseFormat = function(ID,chronometer){
	IsoplotR.settings[chronometer].format = getInt(ID);
	if (chronometer=='fissiontracks'){
	    $.transformation();
	}
	IsoplotR = populate(IsoplotR,true);
	errconvert();
	showOrHide();
    }

    $.chooseDiscFilter = function(){
	var opt = getOption("#discoption");
	var set = IsoplotR.settings['U-Pb'];
	set.discoption = opt;
	$('#mindisc').val(set.mindisc[opt-1]);
	$('#maxdisc').val(set.maxdisc[opt-1]);
    }    
    
    $.chooseMineral = function(){
	var cst = IsoplotR.constants;
	var mineral = getOption("#mineral-option");
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
	IsoplotR.settings.fissiontracks.mineral = mineral;
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
    $("#language").selectmenu({
	change: function( event, ui ) { changeLanguage(ui.item.value); }
    });
    
    $("#helpmenu").dialog({ autoOpen: false, width: 500 });
    
    $('tit').click(function(){
	welcome();
    });

    $('body').on('click', 'help', function(){
	var text = getItemContextualHelp(this.id);
	$("#helpmenu").html(text);
	$("#helpmenu").dialog('open');
	showOrHide();
    });

    $("#OPEN").on('change', function(e){
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e){
	    var newIsoplotR = JSON.parse(this.result);
	    IsoplotR = patchJSON(newIsoplotR,IsoplotR);
	    var set = IsoplotR.settings;
	    $("#" + set.geochronometer ).prop("selected",true);
	    $("#geochronometer").selectmenu("refresh");
	    selectGeochronometer()
	    json2handson();
	    translate();
	}
	reader.readAsText(file);
    });

    $("#SAVE").click(function( event ) {
	var fname = prompt("Please enter a file name", "IsoplotR.json");
	if (fname != null){
	    handson2json();
	    $('#fname').attr("href","data:text/plain," +
			     JSON.stringify(IsoplotR));
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
	$.getJSON(cfile, function(constants){
	    IsoplotR.constants = constants;
	    var sfile = './js/settings.json';
	    $.getJSON(sfile, function(settings){
		var chronometer = IsoplotR.settings.geochronometer;
		var plotdevice = IsoplotR.settings.plotdevice;
		var format = IsoplotR.settings[chronometer].format;
		IsoplotR.settings[plotdevice] = settings[plotdevice];
		IsoplotR.settings[chronometer] = settings[chronometer];
		IsoplotR.settings[chronometer].format = format; // restore
		IsoplotR.settings.par = settings.par;
		IsoplotR = populate(IsoplotR,false);
	    });
	});
    });

    $("#CLEAR").click(function(){
	$("#INPUT").handsontable({
	    data: [[]]
	});
	$("#OUTPUT").handsontable({
	    data: [[]]
	});
    });
    
	function displayError(message, err) {
		console.error(message, err);
		var par = document.createElement("p");
		par.setAttribute("class", "ploterror"); 
		par.textContent = err;
		var myplot = document.getElementById("myplot");
		myplot.textContent = '';
		myplot.appendChild(par);
}

    $("#PLOT").click(function(){
	update();
	$("#OUTPUT").hide();
	$("#myplot").html("<div id='loader' class='blink_me'>Processing...</div>");
	var plot = function() {
		rrpc.call("plot", {
			data: IsoplotR.data4server,
			width: myplot.offsetWidth,
			height: myplot.offsetHeight,
			Rcommand: getRcommand(IsoplotR)
		}, function(result, err) {
			if (err) {
				displayError("Plot failed.", err);
				return;
			}
			var img = document.createElement("img");
			img.setAttribute("src", result.src[0]);
			img.setAttribute("width", result.width[0]);
			img.setAttribute("height", result.height[0]);
			var myplot = document.getElementById("myplot");
			myplot.textContent = '';
			myplot.appendChild(img);
		});
	};
	plot();
	document.getElementsByTagName("BODY")[0].onresize = function() {
		if (timeout.variable) {
			window.clearTimeout(timeout.variable);
		}
		timeout.variable = window.setTimeout(plot, 400);
	};
    });

	$("#RUN").click(function(){
	update();
	$("#myplot").empty();
	$("#OUTPUT").handsontable('clear');
	$("#OUTPUT").handsontable('deselectCell');
	$("#OUTPUT").handsontable('setDataAtCell',0,0,'Processing...');
	$("#OUTPUT").show();
	rrpc.call("run", {
		data: IsoplotR.data4server,
		Rcommand: getRcommand(IsoplotR)
	}, function(result, err) {
		if (err) {
			displayError('Run failed.', err);
			return;
		}
		$('#OUTPUT').handsontable('populateFromArray', 0, 0,
			result.data);
		const hot = $('#OUTPUT').data('handsontable');
		hot.updateSettings({
			colHeaders: result.headers
		});
	});
    });

	document.getElementById("PDF").onclick = function() {
	update();
	rrpc.call("pdf", {
		data: IsoplotR.data4server,
		Rcommand: getRcommand(IsoplotR)
	}, function(result, err) {
		if (err) {
			displayError('Get PDF failed.', err);
			return;
		}
		const downloader = document.getElementById("downloader");
		downloader.setAttribute("download", result.filename[0]);
		downloader.setAttribute("href", result.data[0]);
		downloader.click();
	});
	}

	document.getElementById("CSV").onclick = function() {
		update();
		rrpc.call("csv", {
			data: IsoplotR.data4server,
			Rcommand: getRcommand(IsoplotR)
		}, function(result, err) {
			if (err) {
				displayError('Get CSV failed.', err);
				return;
			}
			const downloader = document.getElementById("downloader");
			downloader.setAttribute("download", result.filename[0]);
			downloader.setAttribute("href", result.data[0]);
			downloader.click();
		});
		}
	
	$("#home").click(function(){
	localStorage.setItem("language",IsoplotR.settings.language);
	$(location).attr('href','home/index.html');
    });

    var IsoplotR;
    var contextual_help = {};
    var dictionary_id = {};
	var dictionary_class = {};
	var contextual_help_fallback;
	var dictionary_id_fallback;
	var dictionary_class_fallback;
	var loaded_language = null;
	const timeout = {};
    initialise();
});
