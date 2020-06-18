// Writes out files in locales directory from the files in the www/js
// directory. Should never have to do this.
var fs = require('fs');
var translation = require('./translation_config');

let renames = {};
for (const lang in translation.languageRenames) {
    renames[translation.languageRenames[lang]] = lang;
}

const appBase = 'inst/shiny-examples/myapp/';
const localesDir = appBase + 'www/locales/';

function degather(dc) {
    let out = {en:{}, cn:{}};
    for (let k in dc) {
        const transs = dc[k];
        for (let lang in transs) {
            out[lang][k] = transs[lang];
        }
    }
    return out;
}

function writeLocale(filename, byLang) {
    for (let lang in byLang) {
        const out = JSON.stringify(byLang[lang]);
        if (lang in renames) {
            lang = renames[lang];
        }
        const dir = localesDir + lang;
        const lastSlash = filename.lastIndexOf('/');
        const allDir = 0 <= lastSlash?
                dir + '/' + filename.substring(0, lastSlash)
                : dir;
        if (!fs.existsSync(allDir)) {
            fs.mkdirSync(allDir, { recursive: true });
        }
        fs.writeFileSync(dir + '/' + filename, out);
    }
}

function degatherFile(filename) {
    const text = fs.readFileSync(appBase + 'www/' + filename, 'utf8');
    const dict = JSON.parse(text);
    const byLanguage = degather(dict);
    const fn = filename.substring(filename.lastIndexOf('/') + 1);
    writeLocale(fn, byLanguage);
}

translation.filenames.forEach(function(filename) {
    degatherFile(filename);
});
