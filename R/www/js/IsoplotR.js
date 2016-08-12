$(function(){

    function initialise(){
	$('#OUTPUT').hide();
	$('#RUN').hide();
	$('#CSV').hide();
	var loader = new Image(); // preload image
	loader.src = "../images/loader.gif";
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
	    selectGeochronometer(data.geochronometer);
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

    $(".button").button()

    $("#INPUT").handsontable({
	data : [[]],
	minRows: 100,
	minCols: 26,
	rowHeaders: true,
	colHeaders: true,
	contextMenu: true,
	observeChanges: true,
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
	observeChanges: false
    });

    function dnc(){
	switch (IsoplotR.settings.geochronometer){
	case 'U-Pb':
	    return 6;
	case 'Ar-Ar':
	    switch(IsoplotR.settings.plotdevice){
		case 'spectrum':
		return 7;
		default:
		return 6;
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
	    $("#J").val(json.J[0]);
	    $("#Jerr").val(json.J[1]);
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
	switch (geochronometer){
	    case "Ar-Ar":
	    mydata.J[0] = $("#J").val();
	    mydata.J[1] = $("#Jerr").val();
	    break;
	    default:
	}
	$.each(mydata.data, function(k, v) {
	    mydata.data[k] = $("#INPUT").handsontable('getDataAtCol',i++);
	});
	out.settings.data[geochronometer] = mydata;
	out.optionschanged = false;
	IsoplotR = out;
    }

    function getData(r,c,r2,c2){
	var nr = 1+Math.abs(r2-r);
	var nc = 1+Math.abs(c2-c);
	var dat = [];
	var DNC = dnc();
	var cond1 = (nc < DNC);
	var cond2 = IsoplotR.settings.geochronometer=='U-Th-He' & nc==6;
	var cond3 = IsoplotR.settings.geochronometer=='detritals';
	var cond4 = (cond1 & !cond2 & !cond3);
	var cond5 = (nr==1);
	var cond6 = (cond2 & cond5);
	var cond7 = IsoplotR.settings.geochronometer=='other';
	var cond8 = (cond7 & cond5);
	if (cond4|cond6|cond8) {
		nc = DNC;
		nr = $("#INPUT").handsontable('countRows');
		r = 0;
		c = 0;
		r2 = nr-1;
		c2 = nc-1;
	}
	dat = $("#INPUT").handsontable('getData',r,c,r2,c2);
	if (cond3){
	    for (var i=0; i<dat.length; i++){
		for (var j=0; j<dat[i].length; j++){
		    if (dat[i][j]==null){
			dat[i][j] = '';
	}   }	}   }
	if (IsoplotR.settings.geochronometer=='Ar-Ar'){
	    var J = $('#J').val();
	    var sJ = $('#Jerr').val();
	    IsoplotR.data = [nr,nc,J,sJ,dat];
	} else {
	    IsoplotR.data = [nr,nc,dat];
	}
    }

    function showSettings(option){
	var set = IsoplotR.settings[option];
	var cst = IsoplotR.constants;
	switch (option){
	case 'U-Pb':
	    $('.hide4UPb').hide();
	    $('#U238U235').val(cst.iratio.U238U235[0]);
	    $('#errU238U235').val(cst.iratio.U238U235[1]);
	    $('#LambdaU238').val(cst.lambda.U238[0]);
	    $('#errLambdaU238').val(cst.lambda.U238[1]);
	    $('#LambdaU235').val(cst.lambda.U235[0]);
	    $('#errLambdaU235').val(cst.lambda.U235[1]);
	    break;
	case 'Ar-Ar':
	    $('.hide4ArAr').hide();
	    $('#Ar40Ar36').val(cst.iratio.Ar40Ar36[0]),
	    $('#errAr40Ar36').val(cst.iratio.Ar40Ar36[1]),
	    $('#LambdaK40').val(cst.lambda.K40[0]),
	    $('#errLambdaK40').val(cst.lambda.K40[1])
	    break;
	case 'U-Th-He':
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
	case 'detritals':
	    $('.hide4detritals').hide();
	    $('#headers-on').prop('checked',set.format==1);
	    break;
	case 'other':
	    $('.hide4other').hide();
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
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'isochron':
	    $('#inverse').prop('checked',set.inverse=='TRUE'),
	    $('#isochron-dcu').prop('checked',set.dcu=='TRUE')
	case 'regression':
	    $('#shownumbers').prop('checked',set.shownumbers=='TRUE')
	    $('#dcu').prop('checked',set.dcu=='TRUE');
	    $('#isochron-minx').val(set.minx),
	    $('#isochron-maxx').val(set.maxx),
	    $('#isochron-miny').val(set.miny),
	    $('#isochron-maxy').val(set.maxy),
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    break;
	case 'average':
	    $('#dcu').prop('checked',set.dcu=='TRUE');
	    $('#outliers').prop('checked',set.outliers=='TRUE');
	    $('#alpha').val(set.alpha);
	    $('#sigdig').val(set.sigdig);
	    $('#cutoff76').val(set.cutoff76);
	    $('#mindisc').val(set.mindisc);
	    $('#maxdisc').val(set.maxdisc);
	    break;
	case 'spectrum':
	    $('#dcu').prop('checked',set.dcu=='TRUE');
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
	case 'ages':
	    if (geochronometer != 'U-Th-He') {
		$('#age-dcu').prop('checked',set.dcu=='TRUE');
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
	    pdsettings.sigdig = $('#sigdig').val();
	    break;
	case 'isochron':
	    pdsettings.inverse = $('#inverse').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.dcu = $('#isochron-dcu').prop('checked') ? 'TRUE' : 'FALSE';
	case 'regression':
	    pdsettings.shownumbers = $('#shownumbers').prop('checked') ? 'TRUE' : 'FALSE';
	    pdsettings.minx = $('#isochron-minx').val();
	    pdsettings.maxx = $('#isochron-maxx').val();
	    pdsettings.miny = $('#isochron-miny').val();
	    pdsettings.maxy = $('#isochron-maxy').val();
	    pdsettings.alpha = $('#alpha').val();
	    pdsettings.sigdig = $('#sigdig').val();
	    break;
	case 'average':
	    if (geochronometer != "other"){
		pdsettings.dcu =
		    $('#dcu').prop('checked') ? 'TRUE' : 'FALSE';
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
		pdsettings.dcu =
		    $('#dcu').prop('checked') ? 'TRUE' : 'FALSE';
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
		pdsettings.dcu = $('#age-dcu').prop('checked') ? 'TRUE' : 'FALSE';
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
	default:
	}
	switch (geochronometer){
	case 'U-Pb':
	    gcsettings.iratio.U238U235[0] = $("#U238U235").val();
	    gcsettings.iratio.U238U235[1] = $("#errU238U235").val();
	    gcsettings.lambda.U238[0] = $("#LambdaU238").val();
	    gcsettings.lambda.U238[1] = $("#errLambdaU238").val();
	    gcsettings.lambda.U235[0] = $("#LambdaU235").val();
	    gcsettings.lambda.U235[1] = $("#errLambdaU235").val();
	    break;
	case 'Ar-Ar':
	    gcsettings.iratio.Ar40Ar36[0] = $("#Ar40Ar36").val();
	    gcsettings.iratio.Ar40Ar36[1] = $("#errAr40Ar36").val();
	    gcsettings.lambda.K40[0] = $("#LambdaK40").val();
	    gcsettings.lambda.K40[1] = $("#errLambdaK40").val();
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
	default:
	}
    }

    function setSelectedMenus(options){
	$("#Ar-Ar").prop('disabled',false);
	$("#Rb-Sr").prop('disabled',true);
	$("#Sm-Nd").prop('disabled',true);
	$("#Re-Os").prop('disabled',true);
	$("#fission").prop('disabled',true);
	$("#cosmogenics").prop('disabled',true);
	$("#concordia").prop('disabled',options[0]);
	$("#isochron").prop('disabled',options[1]);
	$("#regression").prop('disabled',options[2]);
	$("#spectrum").prop('disabled',options[3]);
	$("#average").prop('disabled',options[4]);
	$("#KDE").prop('disabled',options[5]);
	$("#CAD").prop('disabled',options[6]);
	$("#radial").prop('disabled',options[7]);
	$("#helioplot").prop('disabled',options[8]);
	$("#banana").prop('disabled',options[9]);
	$("#MDS").prop('disabled',options[10]);
	$("#ages").prop('disabled',options[11]);
	for (var i=0; i<11; i++){ // change to first available option
	    if (!options[i]) {
		$('#plotdevice').prop('selectedIndex',i);
		IsoplotR.settings.plotdevice = 
		    $('option:selected', $("#plotdevice")).attr('id');
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
	change: function( event, ui ) { changePlotDevice(); },
	focus: function( event, ui ) { changePlotDevice(); }
    });

    function changePlotDevice(){
	IsoplotR.settings.plotdevice = 
	    $('option:selected', $("#plotdevice")).attr('id');
	$('#myscript').empty();
        if (IsoplotR.settings.plotdevice == 'ages'){
	    $('#PLOT').hide();
	    $('#PDF').hide();
	    $('#RUN').show();
	    $('#CSV').show();
        } else {
	    $('#PLOT').show();
	    $('#PDF').show();
	    $('#RUN').hide();
	    $('#CSV').hide();
        }
	IsoplotR.optionschanged = false;
	populate(IsoplotR,true);
    }

    function selectGeochronometer(){
	var geochronometer = IsoplotR.settings.geochronometer;
	var plotdevice = IsoplotR.settings.plotdevice;
	$("#JZeta").hide();
	switch (geochronometer){
	case 'U-Pb':
	    setSelectedMenus([false,true,true,true,false,false,false,true,true,true,true,false]);
	    break;
	case 'Ar-Ar':
	    setSelectedMenus([true,false,true,false,false,false,false,true,true,true,true,false]);
	    $("#JZeta").html('J: <input type="text" id="J"> &plusmn;' + 
			     '<input type="text" id="Jerr"> (1&sigma;)');
	    $("#JZeta").show();
	    break;
	case 'Rb-Sr':
	case 'Sm-Nd':
	case 'Re-Os':
	    setSelectedMenus([true,true,true,true,true,true,true,true,true,true,true,true]);
	    break;
	case 'U-Th-He':
	    setSelectedMenus([true,true,true,true,true,false,false,true,false,true,true,false]);
	    break;
	case 'fission':
	    setSelectedMenus([true,true,true,true,true,true,true,true,true,true,true,true]);
	    break;
	case 'cosmogenics':
	    setSelectedMenus([true,true,true,true,true,true,true,true,true,true,true,true]);
	    break;
	case 'detritals':
	    setSelectedMenus([true,true,true,true,true,false,false,true,true,true,false,true]);
	    break;
	case 'other':
	    setSelectedMenus([true,true,false,false,false,false,false,true,true,true,true,true]);
	    break;
	default:
	    setSelectedMenus([true,true,true,true,true,true,true,true,true,true,true,true]);
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

    function run(){
	if (IsoplotR.optionschanged){
	    recordSettings();
	    IsoplotR.optionschanged = false;
	}
	if (IsoplotR.data.length==0) getData(0,0,0,0);
	Shiny.onInputChange("data",IsoplotR.data);
	Shiny.onInputChange("Rcommand",getRcommand(IsoplotR));
    }

    $("#helpmenu").dialog({ autoOpen: false });

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
	var fname = "";
	$("#OUTPUT").hide();
	$("#myplot").show();
	$("#myplot").load("../options/index.html",function(){
	    fname = "../options/" + plotdevice + ".html";
	    $("#plotdevice-options").load(fname,function(){
		showSettings(plotdevice);
		fname = "../options/" + geochronometer + ".html";
		$("#geochronometer-options").load(fname,function(){
		    showSettings(geochronometer);
		    IsoplotR.optionschanged = true;
		});
	    });
	});
    });

    $("#DEFAULTS").click(function(){
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
	$("#myplot").load("loader.html");
	$("#OUTPUT").hide();
	$("#myscript").empty();
	run();
    });

    $("#RUN").click(function(){
	$("#myplot").load("loader.html");
	$("#OUTPUT").handsontable('clear');
	$("#OUTPUT").show();
	$("#myscript").empty();
	run();
	$("#myplot").empty();
    });

    var IsoplotR = initialise();

});
