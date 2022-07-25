function check(x,val){
    var num = Number(x);
    if (isNaN(num)){
	return(val);
    } else {
	return(num);
    }
}

function truefalse(id){
    return $(id).prop('checked');
}

function getOption(id){
    var val = $('option:selected', $(id)).prop('value');
    var out = isNaN(val) ? val : parseInt(val);
    return(out);
}

function getRadio(name){
    return $('input[name="' + name + '"]:checked').val();
}

function setRadio(name, val) {
    $('input[name="' + name + '"][value="' + val +'"]').prop('checked', true);
}


function getNumber(id, def){
    var x = Number($(id).val());
    return isNaN(x) && typeof(def) !== 'undefined'? def : x;
}

function getInt(id){
    return(parseInt($(id).val()));
}

function getSignificantDigits(x){
    var n = Math.abs(String(x).replace(".", "")); //remove decimal and make positive
    if (n == 0) return 0;
    var out = Math.floor(Math.log(n) / Math.log(10)) + 1;
    return Math.max(2,out);
}

function setSignificantDigits(x,n){
    return Number.parseFloat(x).toPrecision(n);
}

function patchJSON(n,o){
    if ($.type(o) !== 'object'){
        return n;
    }
    for (var k in o){
	 if (k in n){
	     o[k] = (k === 'data') ? n[k] : patchJSON(n[k],o[k]);
	 }
    }
    return o;
}
