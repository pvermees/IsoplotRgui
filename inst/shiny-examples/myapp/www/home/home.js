$(function(){
    let loaded_language;
    let home_id;
    let home_id_fallback;
    let settings;

    if (localStorage.getItem("language") === null){
    	localStorage.setItem("language","en");
    }
    if (localStorage.getItem("language").startsWith("zh")){
	    $("#CN").css("text-decoration","underline")
    } else {
    	$("#EN").css("text-decoration","underline")
    }

    // load fallback language and settings if required
    function withFallbackLanguage(callback) {
        if (home_id_fallback) {
            callback();
        }
        $.getJSON('../js/settings.json', function (s) {
            settings = s;
            $.getJSON('../locales/en/home_id.json', function(data) {
                home_id_fallback = data;
                callback();
            }).fail(function() {
                console.error("Failed to load fallback language for home page");
            });
        }).fail(function() {
            console.error("Failed to load settings");
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

    function getFallbackText(id, language, messages) {
        let link = settings["translation_link"]
            .replace("${FILENAME}", "home_id")
            .replace("${LANGUAGE}", language)
            .replace("${ID}", id);
        let button = messages["translate_button"]
            .replace("${LINK}", link);
        return button + home_id_fallback[id];
    }

    function translate(){
        let language = localStorage.getItem("language");
        withLanguage(language, function (data) {
            $(".translate").each(function(i) {
                if (this.id in data) {
                    this.innerHTML = data[this.id];
                } else {
                    this.innerHTML = getFallbackText(this.id, language, data);
                }
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
