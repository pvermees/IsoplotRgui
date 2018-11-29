function check(x,val){
    var num = Number(x);
    if (isNaN(num)){
	return(val);
    } else {
	return(num);
    }
}

function truefalse(id){
    var out = $(id).prop('checked') ? 'TRUE' : 'FALSE';
    return(out);
}

function falsetrue(id){
    var out = $(id).prop('checked') ? 'FALSE' : 'TRUE';
    return(out);
}

function getOption(id){
    var val = $('option:selected', $(id)).attr('value');
    var out = isNaN(val) ? val : parseInt(val);
    return(out);
}

function getNumber(id){
    return(Number($(id).val()));
}

function getInt(id){
    return(parseInt($(id).val()));
}

function getSignificantDigits(x){
    n = Math.abs(String(x).replace(".", "")); //remove decimal and make positive
    if (n == 0) return 0;
    return Math.floor(Math.log(n) / Math.log(10)) + 1; //get number of digits
}

function setSignificantDigits(x,n) {
    return Number.parseFloat(x).toPrecision(n);
}
