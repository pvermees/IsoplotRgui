// Translate Traditional to Simplified Chinese, using Unicode's Unihan database.
// It turns out this is not useful, because our Hong Kongers used Simplified
// Chinese (with one exception). We could modify this to make a traditional
// translation, or we could delete it.
const fs = require('fs');
const http = require('http');
const StreamZip = require('node-stream-zip');

const unihanZip = 'build/unihan.zip';
const unihanTxt = 'build/unihan.txt';
const unihanUrl = 'http://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip';
const hantLocale = 'inst/shiny-examples/myapp/www/locales/zh_Hant/';
const hansLocale = 'inst/shiny-examples/myapp/www/locales/zh_Hans/';

function withUnihanZipDownloaded(callback) {
    const file = fs.createWriteStream(unihanZip);
    const request = http.get(unihanUrl, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(callback);
        });
    }).on('error', function(err) {
        fs.unlink(unihanZip);
        throw new Error("Download of Unihan database failed: " + err.message);
    });
}

function withUnihanTextExtracted(callback) {
    withUnihanZipDownloaded(function() {
        const zip = new StreamZip({
            file: unihanZip,
            storeEntries: true
        });
        zip.on('error', function(err) {
            zip.close();
            throw err;
        });
        zip.on('ready', function() {
            zip.extract('Unihan_Variants.txt', unihanTxt, function(err) {
                zip.close();
                if (err) {
                    throw error;
                } else {
                    callback();
                }
            });
        });
    });
}

function withUnihanText(callback) {
    fs.readFile(unihanTxt, { flag: 'r' }, function(err, data) {
        if (err) {
            if (err.message.startsWith('ENOENT')) {
                withUnihanTextExtracted(function() {
                    fs.readFile(unihanTxt, { flag: 'r' }, function(err, data) {
                        if (err) {
                            throw err;
                        }
                        callback(data);
                    });
                });
            } else {
                console.error("Failed to load " + unihanTxt);
                throw err;
            }
        } else {
            callback(data);
        }
    });
}

function unicode2dec(u) {
    return parseInt(u.substring(2), 16);
}

withUnihanText(function(data) {
    const simplified = {};
    const lines = data.toString().split('\n');
    for (const i in lines) {
        const line = lines[i];
        if (!line.startsWith('#')) {
            const [subject, verb, object] = line.split('\t');
            if (verb === 'kSimplifiedVariant') {
                if (subject.startsWith('U+') && object.startsWith('U+')) {
                    const s = unicode2dec(subject);
                    const r = unicode2dec(object);
                    if (s !== r) {
                        simplified[s] = r;
                    }
                }
            }
        }
    }
    // now translate traditional locale files to simplified locale files
    const dir = fs.readdirSync(hantLocale, { withFileTypes: true });
    for (const i in dir) {
        const dirent = dir[i];
        if (dirent.isFile) {
            const file = fs.readFileSync(hantLocale + dirent.name, 'utf8');
            let out = "";
            for (const j in file) {
                const c = file.charCodeAt(j);
                if (c in simplified) {
                    console.log("In file: " + dirent.name + " converting " + c + " to " + simplified[c]);
                    out += String.fromCharCode(simplified[c]);
                } else {
                    out += file.charAt(j);
                }
            }
            fs.writeFileSync(hansLocale + dirent.name, out);
        }
    }
});
