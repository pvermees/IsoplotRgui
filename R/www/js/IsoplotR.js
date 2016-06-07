$(function(){

    function initialise(){
	var out = {
	    constants: null,
	    settings: null,
	    selection: [],
	    optionschanged: false
	}
	var cfile = './js/constants.json';
	var sfile = './js/settings.json';
	$.getJSON(cfile, function(data){
	    out.constants = data;
	});
	$.getJSON(sfile, function(data){
	    out.settings = data;
	    selectGeochronometer(data.geochronometer);
	    out = populate(out,true);
	    $("#INPUT").handsontable({ // add change handler asynchronously
		afterChange: function(changes,source){
		    getSelection(0,0,0,0); // placed here because we don't want to
		    handson2json();        // call the change handler until after
		}                          // IsoplotR has been initialised
	    });
	});
	return out;
    };

    var IsoplotR = initialise();

    $("#INPUT").handsontable({
	data : [[]],
	minCols: 100,
	minRows: 1000,
	rowHeaders: true,
	colHeaders: true,
	contextMenu: true,
	observeChanges: true,
	afterSelectionEnd: function (r,c,r2,c2){
	    getSelection(r,c,r2,c2);
	}
    });

    function dnc(){
	switch (IsoplotR.settings.geochronometer){
	case 'U-Pb': 
	    return 6;
	case 'detritals':
	    var firstrow = $("#INPUT").handsontable('getData')[0];
	    var nc = firstrow.length;
	    for (var i=(nc-1); i>0; i--){
		if (firstrow[i]!=null) return i+1;
	    }
	}
	return 0;
    }

    function json2handson(settings){
	var json = settings.data[settings.geochronometer];
	var row, header;
	var handson = {
	    data: [],
	    headers: []
	};
	$.each(json, function(k, v) {
	    handson.headers.push(k);
	});
	var m = handson.headers.length; // number of columns
	var n = (m>0) ? json[handson.headers[0]].length : 0; // number of rows
	for (var i=0; i<handson.headers.length; i++){ // maximum number of rows
	    if (json[handson.headers[i]].length > n) {
		n = json[handson.headers[i]].length;
	}   }
	for (var i=0; i<n; i++){
	    row = [];
	    for (var j=0; j<m; j++){
		row.push(json[handson.headers[j]][i]);
	    }
	    handson.data.push(row);
	}
	handson.data.push([]); // add empty row in case json is empty
	$("#INPUT").handsontable({
	    data: handson.data,
	    colHeaders: handson.headers
	});
    }

    // overwrites the data in the IsoplotR preferences based on the handsontable
    function handson2json(){
	var out = $.extend(true, {}, IsoplotR); // clone
	var geochronometer = out.settings.geochronometer;
	var mydata = out.settings.data[geochronometer];
	var i = 0;
	$.each(mydata, function(k, v) {
	    mydata[k] = $("#INPUT").handsontable('getDataAtCol',i++);
	});
	out.selection = [];
	out.optionschanged = false;
	IsoplotR = out;
    }

    function getSelection(r,c,r2,c2){
	var nr = 1+Math.abs(r2-r);
	var nc = 1+Math.abs(c2-c);
	var dat = [];
	var DNC = dnc();
	var cond1 = (nc < DNC);
	var cond2 = IsoplotR.settings.geochronometer=='detritals';
	var cond3 = (cond1 & !cond2);
	var cond4 = (cond2 & nr==1);
	if (cond3|cond4) {
		nc = DNC;
		nr = $("#INPUT").handsontable('countRows');
		r = 0;
		c = 0;
		r2 = nr-1;
		c2 = nc-1;
	}
	dat = $("#INPUT").handsontable('getData',r,c,r2,c2);
	if (cond2){
	    for (var i=0; i<dat.length; i++){
		for (var j=0; j<dat[i].length; j++){
		    if (dat[i][j]==null){
			dat[i][j] = 'NA';
	}   }	}   }
	IsoplotR.selection = [nr,nc,dat];
    }

    function showSettings(option){
	var set = IsoplotR.settings[option];
	var cst = IsoplotR.constants;
	switch (option){
	case 'U-Pb':
	    $('#U238U235').val(cst['I.R'].U238U235[0]);
	    $('#errU238U235').val(cst['I.R'].U238U235[1]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaU235').val(cst.lambda.U235[0]);
	    $('#errLambdaU235').val(cst.lambda.U235[1]);
	    break;
	case 'detritals':
	    $('#headers-on').prop('checked',set.format==1);
	    break;
	case 'concordia':
	    $('#tera-wasserburg').prop('checked',set.wetherill!='TRUE');
	    $('#conc-age-option option[value='+set.showage+']').
		prop('selected', 'selected');
	    $('#mint').val(set.mint);
	    $('#maxt').val(set.maxt);
	    $('#alpha').val(set.alpha);
	    $('#dcu').prop('checked',set.dcu=='TRUE');
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
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
	    pdsettings.dcu = 
		$('#dcu').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.shownumbers =
		$('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
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
	default:
	}
	switch (geochronometer){
	case 'U-Pb':
	    gcsettings["I.R"].U238U235[0] = $("#U238U235").val();
	    gcsettings["I.R"].U238U235[1] = $("#errU238U235").val();
	    break;
	case 'detritals':
	    IsoplotR.settings[geochronometer].format = 
		$("#headers-on").prop('checked') ? 1 : 2;
	    break;
	default:
	}
    }

    function setSelectedMenus(options){
	$("#Ar-Ar").prop('disabled',true);
	$("#Rb-Sr").prop('disabled',true);
	$("#Sm-Nd").prop('disabled',true);
	$("#Re-Os").prop('disabled',true);
	$("#U-Th-He").prop('disabled',true);
	$("#fission").prop('disabled',true);
	$("#cosmogenics").prop('disabled',true);
	$("#detritals").prop('disabled',false);
	$("#other").prop('disabled',true);
	$("#concordia").prop('disabled',options[0]);
	$("#isochron").prop('disabled',options[1]);
	$("#spectrum").prop('disabled',options[2]);
	$("#KDE").prop('disabled',options[3]);
	$("#radial").prop('disabled',options[4]);
	$("#ternary").prop('disabled',options[5]);
	$("#banana").prop('disabled',options[6]);
	$("#MDS").prop('disabled',options[7]);
	for (var i=0; i<7; i++){ // change to first available option
	    if (!options[i]) {
		$('#plotdevice').prop('selectedIndex',i);
		IsoplotR.settings.plotdevice = $("#plotdevice").val();
		break;
	    }
	}
    }

    $("select").selectmenu({ width : 'auto' });
    $("#geochronometer").selectmenu({
	change: function( event, ui ) {
	    IsoplotR.settings.geochronometer = $(this).val();
	    selectGeochronometer();
	}
    });
    $("#plotdevice").selectmenu({
	change: function( event, ui ) {
	    IsoplotR.settings.plotdevice = $(this).val();
	}
    });

    $(".button").button()

    $(":file").filestyle({
	input: false,
	badge: false
    });

    function selectGeochronometer(){
	var geochronometer = IsoplotR.settings.geochronometer;
	var plotdevice = IsoplotR.settings.plotdevice;
	switch (geochronometer){
	case 'U-Pb':
	    setSelectedMenus([false,true,true,true,true,true,true,true]);
	    break;
	case 'Ar-Ar':
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	    break;
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	    break;
	case 'U-Th-He':
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	    break;
	case 'fission':
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	    break;
	case 'cosmogenics':
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	    break;
	case 'detritals':
	    setSelectedMenus([true,true,true,false,true,true,true,true]);
	    break;
	case 'other-X-Y':
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	    break;
	default:
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	}
	IsoplotR = populate(IsoplotR,false);
	$("#plotdevice").selectmenu("refresh");
    }

    // populate the handsontable with stored data
    function populate(prefs,forcedefaults){
	var geochronometer = prefs.settings.geochronometer;
	var plotdevice = prefs.settings.plotdevice;
	var data = prefs.settings.data[geochronometer];
	if (forcedefaults | $.isEmptyObject(data)){
	    prefs.settings.data[geochronometer] = example(geochronometer,plotdevice);
	}
	json2handson(prefs.settings);
	return prefs;
    }

    $("#OPEN").on('change', function(e){
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e){
	    IsoplotR = JSON.parse(this.result);
	    json2handson(IsoplotR.settings);
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
	var fname = ""
	$("#myplot").load("../options/index.html",function(){
	    fname = "../options/" + plotdevice + ".html"
	    $("#plotdevice-options").load(fname,function(){
		showSettings(plotdevice);
	    });
	    fname = "../options/" + geochronometer + ".html";
	    $("#geochronometer-options").load(fname,function(){
		showSettings(geochronometer);
	    });
	    IsoplotR.optionschanged = true;
	});
    });

    $("#HELP").click(function(){
	var geochronometer = IsoplotR.settings.geochronometer;
	var fname = "../help/" + geochronometer + ".html";
	$("#myplot").load(fname);
    });

    $("#DEFAULTS").click(function(){
	IsoplotR = populate(IsoplotR,true);
    });

    $("#CLEAR").click(function(){
	$("#INPUT").handsontable({
	    data: [[]]
	});	
    });

    $("#PLOT").click(function() {
	$("#myplot").load("loader.html");
	if (IsoplotR.optionschanged){
	    recordSettings();
	    IsoplotR.optionschanged = false;
	}
	if (IsoplotR.selection.length == 0) getSelection(0,0,0,0);
	Shiny.onInputChange("selection",IsoplotR.selection);
	Shiny.onInputChange("Rcommand",getRcommand(IsoplotR));
    });

});
