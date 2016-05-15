function json2handson(json){
    var row, header;
    var out = {
	data: [],
	headers: []
    };
    $.each(json, function(k, v) {
	out.headers.push(k);
    });
    var m = out.headers.length; // number of columns
    var n = (m>0) ? json[out.headers[0]].length : 0; // number of rows
    for (var i=0; i<n; i++){
	row = [];
	for (var j=0; j<m; j++){
	    row.push(json[out.headers[j]][i]);
	}
	out.data.push(row);
    }
    out.data.push([]); // add empty row in case json is empty
    return out;
}
