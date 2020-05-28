$(function(){
    let loaded_language;
    let home_id;
    let home_id_fallback;

    if (localStorage.getItem("language") === null){
    	localStorage.setItem("language","en");
    }
    if (localStorage.getItem("language") === "en"){
    	$("#EN").css("text-decoration","underline")
    } else {
	    $("#CN").css("text-decoration","underline")
    }

    function withFallbackLanguage(callback) {
        if (home_id_fallback) {
            callback();
        }
        $.getJSON('../locales/en/home_id.json', function(data) {
            home_id_fallback = data;
            callback();
        }).fail(function() {
            console.error("Failed to load fallback language for home page");
        });
    }

    function withLanguage(language, callback) {
        if (loaded_language === language) {
            callback(home_id);
        }
        withFallbackLanguage(function() {
            if (language === 'en') {
                callback(home_id_fallback);
            }
            $.getJSON('../locales/' + language + '/home_id.json', function(data) {
                home_id = data;
                loaded_language = language;
                callback(data);
            }).fail(function () {
                console.warn("Failed to load language '" + language + "' for home page");
                callback(home_id_fallback);
            });
        });
    }

    function translate(){
        var language = localStorage.getItem("language");
        withLanguage(language, function (data) {
            $(".translate").each(function(i) {
                const text = this.id in data?
                    data[this.id]
                    : home_id_fallback[this.id];
                this.innerHTML = text;
            });
        });
    }

    // let the tests call the translate function
    window.translateHomePage = translate;

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
