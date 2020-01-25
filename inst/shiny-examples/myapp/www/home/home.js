$(function(){

    var language = localStorage.getItem("language");
    if (language === null){ language = "en"; }
    
    var mytimer

    $.getJSON('home_id.json', function(data){
	home_id = data;
    });
    
    function countdown(){
        var counter = 10;
        var mytimer = setInterval(function(){
            counter--;
            if (counter<0) {
                window.location = "http://pieter-vermeesch.es.ucl.ac.uk/shiny/IsoplotR/";
            } else {
                document.getElementById("count").innerHTML = counter;
            }
        },1000);
        return(mytimer);
    }

    function translate(){
	$(".translate").each(function(i){
	    var text = home_id[this.id][language];
	    this.innerHTML = text;
	});
    }
    
    $("#tabs").tabs({
        selected: 0,
        beforeActivate:
	function(event, ui){
	    if (ui.newPanel.is("#tab-1")){
		$('#tab-1').load("map.html",function(){
    		    mytimer = countdown();
		    translate();
		});
	    } else {
	  	clearInterval(mytimer);
	    }
	}
    });
    $('#tab-0').load('intro.html',function(){translate();});
    $('#tab-2').load('offline.html',function(){translate();});
    $('#tab-3').load('commandline.html',function(){translate();});
    $('#tab-4').load('news.html',function(){translate();});
    $('#tab-5').load('contribute.html',function(){translate();});
    $('#tab-6').load('language.html',function(){translate();});

});
