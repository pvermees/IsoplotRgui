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
    return(parseInt(val));
}

function getNumber(id){
    return(Number($(id).val()));
}

function getInt(id){
    return(parseInt($(id).val()));
}
