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
	    json2handson(out.settings.data[out.settings.geochronometer]);
	    selectGeochronometer(out.settings.geochronometer);
	    $("#INPUT").handsontable({ // add change handler asynchronously
		afterChange: function(changes,source){
		    getSelection(0,0,0,0);
		}
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
	afterSelectionEnd: function (r,c,r2,c2){
	    getSelection(r,c,r2,c2);
	}
    });

    function dnc(){
	switch (IsoplotR.settings.geochronometer){
	case 'U-Pb': return 6;
	}
	return 0;
    }

    function json2handson(json){
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
    }

    function getSelection(r,c,r2,c2){
	var nr = 1+Math.abs(r2-r);
	var nc = 1+Math.abs(c2-c);
	var dat = [];
	var DNC = dnc();
	if (nc < DNC) {
	    nc = DNC;
	    nr = $("#INPUT").handsontable('countRows');
	    dat = $("#INPUT").handsontable('getData',0,0,nr-1,nc-1);
	} else {
	    dat = $("#INPUT").handsontable('getData',r,c,r2,c2);
	}
	IsoplotR.selection = [nr,nc,dat];
    }

    function isValidAge(foo){
	return ($.isNumeric(foo) & foo>0 & foo<4568);
    }

    function showSettings(option){
	var set = IsoplotR.settings[option];
	var cst = IsoplotR.constants;
	switch (option){
	case 'U-Pb':
	    $('#U238U235').val(cst.U238U235.x);
	    $('#errU238U235').val(cst.U238U235.e);
	    $('#LambdaU238').val(cst.lambda.U238.x);
	    $('#errLambdaU238').val(cst.lambda.U238.e);
	    $('#LambdaU235').val(cst.lambda.U235.x);
	    $('#errLambdaU235').val(cst.lambda.U235.e);
	    break;
	case 'concordia':
	    $('#tera-wasserburg').prop('checked',set.wetherill!='TRUE');
	    $('#conc-age-option option[value='+set.showage+']').prop('selected', 'selected');
	    $('#mint').val(set.mint);
	    $('#maxt').val(set.maxt);
	    $('#alpha').val(set.alpha);
	    $('#dcu').prop('checked',set.dcu=='TRUE');
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
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
	    pdsettings.dcu = 
		$('#dcu').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.shownumbers =
		$('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    break;
	default:
	}
	switch (geochronometer){
	case 'U-Pb':
	    gcsettings["I.R"].U238U235[0] = $("#U238U235").val();
	    gcsettings["I.R"].U238U235[1] = $("#errU238U235").val();
	    break;
	default:
	}
    }

    // turns the options into a string to feed into R
    function getOptions(){
	var out = "";
	var plotdevice = IsoplotR.settings.plotdevice;
	var settings = IsoplotR.settings[plotdevice];
	switch (plotdevice){
	case 'concordia':
	    var mint = isValidAge(settings.mint) ? settings.mint : null;
	    var maxt = isValidAge(settings.maxt) ? settings.maxt : null;
	    if (mint != null | maxt != null){
		out += "limits=c(";
		if (mint == null) { out += "0"; } else { out += mint; }
		if (maxt == null) { out += ",3500)"; } else { out += "," + maxt + ")"; }
	    } else {
		out += "limits=NULL"
	    }
	    out += ",alpha=" + settings.alpha;
	    out += ",wetherill=" + settings.wetherill;
	    out += ",dcu=" + settings.dcu;
	    out += ",show.numbers=" + settings.shownumbers;
	    out += ",show.age=" + settings.showage;
	    break;
	default:
	}
	return out;
    }

    function setSelectedMenus(options){
	$("#concordia").prop('disabled',options[0]);
	$("#isochron").prop('disabled',options[1]);
	$("#spectrum").prop('disabled',options[2]);
	$("#KDE").prop('disabled',options[3]);
	$("#radial").prop('disabled',options[4]);
	$("#ternary").prop('disabled',options[5]);
	$("#banana").prop('disabled',options[6]);
	$("#MDS").prop('disabled',options[7]);
    }

    $("select").selectmenu({ width : 'auto' });
    $("#geochronometer").selectmenu({
	change: function( event, ui ) {
	    selectGeochronometer($(this).val());
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

    function selectGeochronometer(geochronometer){
	IsoplotR.settings.geochronometer = geochronometer;
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
	case 'other':
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	    break;
	default:
	    setSelectedMenus([true,true,true,true,true,true,true,true]);
	}
	$("#plotdevice").selectmenu("refresh");
    }

    function loadData(){
	var geochronometer = IsoplotR.settings.geochronometer;
	json2handson(IsoplotR.settings.data[geochronometer]);
    }

    function getRcommand(){
	var geochronometer = IsoplotR.settings.geochronometer;
	var plotdevice = IsoplotR.settings.plotdevice;
	var out = "dat <- selection2data();";
	out += "I.R('U238U235',x=" + IsoplotR.constants['I.R'].U238U235[0] + 
  	                     ",e=" + IsoplotR.constants['I.R'].U238U235[1] + ");"
	if (geochronometer == 'U-Pb' & plotdevice == 'concordia'){
	    out += "concordia.plot";
	}
	var options = getOptions();
	out += "(dat," + options + ");";
	return out;
    }

    $("#OPEN").on('change', function(e){
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e){
	    IsoplotR = JSON.parse(this.result);
	}
	reader.readAsText(file);
	loadData();
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
	IsoplotR = initialise();
    });

    $("#CLEAR").click(function(){
	$("#INPUT").handsontable({
	    data: [[]]
	});	
    });

    $("#PLOT").click(function() {
	if (IsoplotR.optionschanged){
	    recordSettings();
	    IsoplotR.optionschanged = false;
	}
	if (IsoplotR.selection.length == 0) getSelection(0,0,0,0);
	Shiny.onInputChange("selection",IsoplotR.selection);
	Shiny.onInputChange("Rcommand",getRcommand());
    });

});
