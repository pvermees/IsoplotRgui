$(function(){

    function initialise(cfile,sfile){
	var out = {
	    selection:  [],
	    constants: null,
	    settings: null,
	    optionschanged: false
	}
	$.getJSON(cfile, function(data){
	    out.constants = data;
	});
	$.getJSON(sfile, function(data){
	    out.settings = data;
	    loadData('U-Pb');
	});
	return out;
    };

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
	return 6;
    }

    function getSelection(r,c,r2,c2){
	var nr = 1+Math.abs(r2-r);
	var nc = 1+Math.abs(c2-c);
	var dat = [];
	if (nc < dnc()) {
	    nr = 1000;
	    nc = dnc();
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
	    $('#mint').val(set.mint);
	    $('#maxt').val(set.maxt);
	    $('#alpha').val(set.alpha);
	    $('#tera-wasserburg').prop('checked',set.wetherill!='TRUE');
	    $('#dcu').prop('checked',set.dcu=='TRUE');
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE');
	    break;
	default:
	}
    }

    function recordSettings(){
	var plotdevice = $("#plotdevice").val();
	var geochronometer = $("#geochronometer").val();
	var pdsettings = IsoplotR.settings[plotdevice];
	var gcsettings = IsoplotR.constants;
	switch (plotdevice){
	case 'concordia':
	    pdsettings.mint =
		isValidAge($('#mint').val()) ? $('#mint').val() : 'auto';
	    pdsettings.maxt =
		isValidAge($('#maxt').val()) ? $('#maxt').val() : 'auto';
	    if ($('#alpha').val() > 0 & $('#alpha').val() < 1) { 
		pdsettings.alpha = $('#alpha').val(); 
	    }
	    pdsettings.wetherill =
		$('#tera-wasserburg').prop('checked') ? 'FALSE' : 'TRUE';
	    pdsettings.dcu = 
		$('#dcu').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.shownumbers =
		$('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    break;
	default:
	}
	switch (geochronometer){
	case 'U-Pb':
	    gcsettings.U238U235.x = $("#U238U235").val();
	    gcsettings.U238U235.e = $("#errU238U235").val();
	    break;
	default:
	}
    }

    // turns the options into a string to feed into R
    function getOptions(plotdevice){
	var out = "";
	var set = IsoplotR.settings[plotdevice];
	switch (plotdevice){
	case 'concordia':
	    var mint = isValidAge(set.mint) ? set.mint : null;
	    var maxt = isValidAge(set.maxt) ? set.maxt : null;
	    if (mint != null | maxt != null){
		out += "limits=c(";
		if (mint == null) { out += "0"; } else { out += mint; }
		if (maxt == null) { out += ",3500)"; } else { out += "," + maxt + ")"; }
	    } else {
		out += "limits=NULL"
	    }
	    out += ", alpha=" + set.alpha;
	    out += ", wetherill=" + set.wetherill;
	    out += ", dcu=" + set.dcu;
	    out += ", show.numbers=" + set.shownumbers;
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
	    selectGeochronometer($(this).prop('id'));
	}
    });

    $(".button").button()

    $(":file").filestyle({
	input: false,
	badge: false
    });

    function selectGeochronometer(geochronometer){
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

    function loadData(option){
	var handson = json2handson(IsoplotR.settings.data[option]);
	$("#INPUT").handsontable({
	    data: handson.data,
	    colHeaders: handson.headers
	});
    }

    function getRcommand(){
	var geochronometer = $("#geochronometer").children(":selected").prop("id");
	var plotdevice = $("#plotdevice").children(":selected").prop("id");
	var out = "dat <- selection2data();";
	out += "U238U235(x=" + IsoplotR.constants.U238U235.x + 
	               ",e=" + IsoplotR.constants.U238U235.e + ");"
	if (geochronometer == 'U-Pb' & plotdevice == 'concordia'){
	    out += "concordia.plot";
	}
	var options = getOptions(plotdevice);
	out += "(dat," + options + ");";
	return out;
    }

    function setDefaults(){
	selectGeochronometer('U-Pb');
	$("#EXAMPLE").click();
    }

    $("#OPEN").on('change', function(e){
	var file = e.target.files[0];
	var reader = new FileReader();
	reader.onload = function(e){
	    IsoplotR.settings = JSON.parse(this.result);
	}
	reader.readAsText(file);
    });

    $("#OPTIONS").click(function(){
	var plotdevice = $("#plotdevice").children(":selected").prop('id');
	var geochronometer = $("#geochronometer").children(":selected").prop('id');
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
	var geochronometer = $("#geochronometer").children(":selected").prop('id');
	var fname = "../help/" + geochronometer + ".html";
	$("#myplot").load(fname);
    });

    $("#EXAMPLE").click(function(){
	loadData($("#geochronometer").children(":selected").prop('id'));
    });

    $("#CLEAR").click(function(){
	loadData("clear");
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

    var IsoplotR = initialise('./js/constants.json','./js/settings.json')

});
