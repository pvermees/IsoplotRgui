// Finds problematic IDs within locale files.
// The in-app links to Weblate use Weblate's search
// functionality to go to the correct translation.
// Unfortunately this gets the wrong one if the
// correct ID is also a prefix of another ID that
// appears earlier in the same file.

const fs = require('fs');
const path = require('path');
const process = require('process');

const localeDir = 'inst/www/locales';
const initialRegexp = new RegExp('^[ \t\r\n]*{[ \t\r\n]*"');
const keySplit = new RegExp(
    '"[ \\t\\r\\n]*:[ \\t\\r\\n]*' + // ": after key
    '"(?:[^"\\\\]|\\\\.)*"' + // the value itself (which we are discarding)
    '[ \\t\\r\\n]*,[ \\t\\r\\n]*"'); // , " after value
const finalRegexp = new RegExp(
    '"[ \\t\\r\\n]*:[ \\t\\r\\n]*' + // ": after key
    '"([^"\\\\]|\\\\.)*"' + // the value itself (which we are discarding)
    '[ \\t\\r\\n]*}[ \\t\\r\\n]*$'); // }

function getAllJsFiles(files, dir) {
    fs.readdirSync(dir, options={withFileTypes:true}).forEach((entry) => {
        const pth = path.join(dir, entry.name);
        if (entry.isFile()) {
            if (entry.name.endsWith(".json")) {
                files.push(pth);
            }
        } else if (entry.isDirectory()) {
            getAllJsFiles(files, pth);
        }
    });
}

const files = [];
getAllJsFiles(files, localeDir);

files.forEach((file) => {
    let contents = fs.readFileSync(file, options={encoding:'utf8'});
    contents = contents.replace(initialRegexp, '');
    contents = contents.replace(finalRegexp, '');
    const keys = contents.split(keySplit);
    let header = "=== In file "+ file + ": ===\n";
    keys.forEach((key,i) => {
        let count = 0;
        for (let j = 0; j != i; ++j) {
            if (keys[j].startsWith(key)) {
                ++count;
                if (count < 5) {
                    process.stdout.write(header
                        + key + " is preceded by " + keys[j] + "\n");
                    header = "";
                } else if (count === 5) {
                    process.stdout.write("amongst others\n");
                }
            }
        }
    });
});
