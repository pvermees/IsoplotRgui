function noconversion(geochronometer,plotdevice,format,ierr){
    var out = false;
    if (ierr==1 || geochronometer=='detritals'){
	out = true;
    }
    if (geochronometer=='fissiontracks' && format<2){
	out = true;
    }
    if (geochronometer=='other' && plotdevice=='KDE'){
	out = true;
    }
    if (geochronometer=='other' && plotdevice=='CAD'){
	out = true;
    }
    return(out);
}

function err4json(data,settings){
    var gc = settings.geochronometer;
    var pd = settings.plotdevice;
    var format = settings[gc].format;
    var ierr = settings.ierr;
    var out = data;
    if (noconversion(gc,pd,format,ierr)){
	// do nothing
    } else if (gc=='U-Pb' && format==1 && ierr==2){
	out['s[7/5]'] = multiplyByCol(data['s[7/5]'],0.5);
	out['s[6/8]'] = multiplyByCol(data['s[6/8]'],0.5);
    } else if (gc=='U-Pb' && format==2 && ierr==2){
	out['s[8/6]'] = multiplyByCol(data['s[8/6]'],0.5);
	out['s[7/6]'] = multiplyByCol(data['s[7/6]'],0.5);
    }
    return(out);
}

function err4handson(handson,settings){
    var gc = settings.geochronometer;
    var pd = settings.plotdevice;
    var format = settings[gc].format;
    var ierr = settings.ierr;
    var out = handson;
    if (noconversion(gc,pd,format,ierr)){
	// do nothing
    } else if (gc=='U-Pb' && format==1 && ierr==2){
	out.headers[1] = "2s[7/5]";
	out.headers[3] = "2s[8/6]";
	out.data = multiplyByRow(handson.data,2,1);
	out.data = multiplyByRow(handson.data,2,3);
    } else if (gc=='U-Pb' && format==2 && ierr==2){
	out.headers[1] = "2s[8/6]";
	out.headers[3] = "2s[7/6]";
	out.data = multiplyByRow(handson.data,2,1);
	out.data = multiplyByRow(handson.data,2,3);
    }
    return(out);
}

function multiplyByCol(x,y){
    var out = x;
    var scalar = $.isNumeric(y);
    for (var i=0; i<x.length; i++){
	out[i] = scalar ? x[i]*y : x[i]*y[i];
    }
    return(out);
}
function multiplyByRow(x,y,ci){
    var out = x;
    var scalar = $.isNumeric(y);
    for (var i=0; i<x.length; i++){
	out[i][ci] = scalar ? x[i][ci]*y : x[i][ci]*y[i][ci];
    }
    return(out);
}
