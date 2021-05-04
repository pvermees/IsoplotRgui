$(function(){
    let loaded_language;
    let home_id;
    let home_id_fallback;
    let settings;
    let languages;

    // load fallback language and settings if required
    function withFallbackLanguage(callback) {
        if (home_id_fallback) {
            callback();
        }
        $.getJSON('../js/settings.json', function (s) {
            settings = s;
            $.getJSON('../locales/en/home_id.json', function(data) {
                home_id_fallback = data;
                $.getJSON('../js/languages.json', function(langs) {
                    languages = langs;
                    callback();
                }).fail(function() {
                    console.error("Failed to load language information");
                });
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
        let link = languages["translation_link"]
            .replace("${FILENAME}", "home_id")
            .replace("${LANGUAGE}", language)
            .replace("${ID}", id);
        let button = messages["translate_button"]
            .replace("${LINK}", link);
        return button + home_id_fallback[id];
    }

    function isWithinLink(element) {
        while (element) {
            if (element.tagName.toUpperCase() === "A") {
                return true;
            }
            element = element.parentElement;
        }
        return false;
    }

    function translate(){
        let language = localStorage.getItem("language");
        withLanguage(language, function (data) {
            $(".translate").each(function(i) {
                if (this.id in data) {
                    this.innerHTML = data[this.id];
                } else if (isWithinLink(this)) {
                    this.innerHTML = home_id_fallback[this.id];
                } else {
                    this.innerHTML = getFallbackText(this.id, language, data);
                }
            });
        });
    }

    // let the tests call the translate function
    window.translateHomePage = translate;

    function highlightLanguageElement(code) {
        const languagesElement = document.getElementById("languages");
        const children = languagesElement.children;
        const id = "lang_" + code;
        for (let i = 0; i !== children.length; ++i) {
            const child = children[i];
            child.style.textDecoration = child.id === id? "underline" : "none";
        }
    }

    withFallbackLanguage(function() {
        const languagesElement = document.getElementById("languages");
        for (const i in languages.languages_supported) {
            const info = languages.languages_supported[i];
            const element = document.createElement("span");
            element.className = "clickable";
            const id = "lang_" + info.code;
            element.id = id;
            element.innerHTML = info.short_name;
            const code = info.code;
            element.onclick = function() {
                localStorage.setItem("language", code);
                highlightLanguageElement(code);
                translate();
            }
            if (i !== 0) {
                const separator = document.createTextNode("\u00A0");
                languagesElement.appendChild(separator);
            }
            languagesElement.appendChild(element);
        }
        highlightLanguageElement(localStorage.getItem("language"));
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
