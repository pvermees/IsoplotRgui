$(function(){
    
    if (localStorage.getItem("language") === null){
    	localStorage.setItem("language","en");
    }
    if (localStorage.getItem("language") === "en"){
    	$("#EN").css("text-decoration","underline")
    } else {
	    $("#CN").css("text-decoration","underline")
    }
        
    function translate(){
        var language = localStorage.getItem("language");
        $.getJSON('../locales/' + language + '/home_id.json', function(data) {
            $(".translate").each(function(i) {
                var text = data[this.id];
                this.innerHTML = text;
            });
        });
    }

    $("#EN").click(function(){
        localStorage.setItem("language","en");
        $(this).css("text-decoration","underline")
        $("#CN").css("text-decoration","none")
        translate();
    });
    $("#CN").click(function(){
        localStorage.setItem("language","zh-CN");
        $("#EN").css("text-decoration","none")
        $(this).css("text-decoration","underline")
        translate();
    });
    
    $("#tabs").tabs({
        selected: 0,
    });
    $('#tab-0').load('intro.html',function(){translate();});
    $('#tab-1').load('map.html',function(){translate();});
    $('#tab-2').load('offline.html',function(){translate();});
    $('#tab-3').load('commandline.html',function(){translate();});
    $('#tab-4').load('news.html',function(){translate();});
    $('#tab-5').load('contribute.html',function(){translate();});
});
