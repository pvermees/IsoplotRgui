"use strict";

const { spawn } = require('child_process');
const { Builder, By, Key, until } = require('selenium-webdriver');
const { describe, before, after, it } = require('mocha');
const clipboardy = require("clipboardy");
const assert = require("assert");
const net = require('net');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs/promises');

const Chrome = require('selenium-webdriver/chrome');
const Firefox = require('selenium-webdriver/firefox');

function getBrowser() {
    const br = /--browser=(.*)/;
    for (let i = 3; i < process.argv.length; ++i) {
        const m = process.argv[i].match(br);
        if (m) {
            return m[1];
        }
    }
    return 'firefox';
}

function spawnR() {
    const args = Array.prototype.slice.apply(arguments);
    return spawn('Rscript', args, { stdio: [ 'ignore', 'inherit', 'inherit' ] });
}

function kill(process) {
    return new Promise(resolve => {
        process.on('exit', resolve);
        process.kill('SIGHUP');
    });
}

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function retry(attempts, ms, untilFn) {
    while (!await untilFn()) {
        if (--attempts === 0) {
            return false;
        }
        await wait(ms);
    }
    return true;
}

function checkPort(port) {
    return new Promise(resolve => {
        const c = new net.Socket();
        c.on('connect', () => resolve(true));
        c.on('error', () => resolve(false));
        c.connect(port, 'localhost');
    });
}

async function portIsOpen(port) {
    return await retry(10, 300, checkPort.bind(null, port));
}

async function startSelenium(tmpdir) {
    let firefoxOptions = new Firefox.Options();
    let firefoxService = new Firefox.ServiceBuilder();
    let chromeOptions = new Chrome.Options();
    if (typeof(tmpdir) === 'string') {
        // Prevent Firefox from opening up a download dialog when a CSV file is requested
        firefoxOptions.
            setPreference('browser.download.folderList', 2).  // do not use default download directory
            setPreference('browser.download.manager.showWhenStarting', false).  // do not show download progress
            setPreference('browser.download.dir', tmpdir).
            setPreference('browser.helperApps.neverAsk.saveToDisk', 'text/*').
            setPreference('browser.download.alwaysOpenPanel', false);
        firefoxService.addArguments('--profile-root', tmpdir);
        chromeOptions.setUserPreferences({
            'profile.default_content_settings.popups': 0,
            'download.prompt_for_download': 'false',
            'download.default_directory': tmpdir,
        });
    }
    const driver = new Builder().forBrowser(getBrowser()).
        setFirefoxOptions(firefoxOptions).
        setFirefoxService(firefoxService).
        setChromeOptions(chromeOptions).
        build();
    await driver.manage().setTimeouts({ implicit: 1000 });
    return driver;
}

async function assertCellValue(driver, row, column, value) {
    await driver.wait(async () => {
        const elt = await driver.findElement(
            cellInTable('OUTPUT', row + 1, column + 1)
        );
        const actual = elt.getText();
        return areNearlyEqual(Number(actual), value);
    });
}

async function makeTempDir() {
    const tmpdir = path.join(os.homedir(), 'tmp_selenium');
    await fs.rm(tmpdir, {
        force: true,
        recursive: true
    });
    await fs.mkdir(tmpdir);
    return tmpdir;
}

describe('IsoplotRgui', function() {
    let rProcess;
    let driver;
    let tmpdir;

    before(async function() {
        const port = 50054;
        this.timeout(8000);
        rProcess = await spawnR('build/start-gui.R', '' + port);
        await portIsOpen(port);
        tmpdir = await makeTempDir();
        driver = await startSelenium(tmpdir);
    });

    after(async function() {
        await kill(rProcess);
        await rProcess.kill('SIGHUP');
        await driver.quit();
        await fs.rm(tmpdir, {
            force: true,
            recursive: true
        });
    })

    beforeEach(async function() {
        await driver.get('http://localhost:50054');
        await installationOf(driver, 'initalisationComplete');
    });

    describe('table implementation', function() {
        it('undoes mistakes', async function() {
            this.timeout(12000);
            await testUndoInTable(driver);
        });

        it('resists script injection attempts', async function() {
            this.timeout(6000);
            await waitUntilCellTextIs(driver, 1, 1, text => 0 < text.length);
            const text = "<script>alert('bad!')</script>";
            await typeInCell(driver, 1, 1, [text, Key.TAB]);
            const loc = cellInTable('INPUT', 1,1);
            const box = await driver.findElement(loc);
            await driver.wait(until.elementTextContains(box, text));
        });

        it('is readable from the calculation engine', async function() {
            this.timeout(20000);
            await driver.wait(until.elementLocated(cellInTable('INPUT', 1, 1)));
            await driver.wait(() => tryToClearGrid(driver));
            const testData = [
                ['25.2', '0.03', '0.0513', '0.0001'],
                ['25.4', '0.02', '0.0512', '0.0002'],
                ['27.1', '0.01', '0.05135', '0.00005']
            ];
            await inputTestData(driver, testData);
            await choosePlotDevice(driver, 'ages');
            await performClick(driver, 'run');
            await tableAppears(driver);
            const expectedResults = [
                [251.1, 1.02, 250.86, 0.59, 253.3, 8.97, 250.88, 0.58],
                [248.92, 1.76, 248.93, 0.38, 248.81, 17.98, 248.93, 0.38],
                [235.591, 0.44, 233.591, 0.17, 255.54, 4.48, 233.619, 0.17]
            ];
            let rowNumber = 0;
            for (const row in expectedResults) {
                let columnNumber = 0;
                for (const value in row) {
                    await assertCellValue(driver, rowNumber, columnNumber, value);
                    ++columnNumber;
                }
                ++rowNumber;
            }
        });
    });

    describe('language support', function() {
        const onlineEN = 'Online';
        const introEN = 'free and open-source';
        const onlineZH = '在线使用';
        const introZH = '是一个免费的开源软件';
        const inputErrorHelpEN = 'Choose one of the following four options:';
        const propagateEN = 'Propagate external uncertainties?';
        const ratiosEN = 'ratios.';
        const helpEN = 'Help';
        this.timeout(25000);
        it('displays the correct language', async function() {
            // test that English is working without choosing it
            await testTranslation(driver, false, helpEN, ratiosEN,
                propagateEN, inputErrorHelpEN, onlineEN, introEN);
            await testTranslation(driver, '中文', '帮助', '测量值。',
                '传递外部误差？',
                '选择以下四个选项之一',
                onlineZH, introZH);
            await testTranslation(driver, 'English', helpEN, ratiosEN,
                propagateEN, inputErrorHelpEN, onlineEN, introEN);
            await clickButton(driver, 'lang_zh_Hans');
            await assertTextContains(driver, 'online_tab', onlineZH);
            await assertTextContains(driver, 'intro', introZH);
            await clickButton(driver, 'lang_en');
            await assertTextContains(driver, 'online_tab', onlineEN);
            await assertTextContains(driver, 'intro', introEN);
        });
        it('displays English where no translation is available', async function() {
            await driver.executeScript('window.localStorage.setItem("language", "xxtest");');
            await driver.get('http://localhost:50054');
            await installationOf(driver, 'translatePage');
            await driver.executeScript('window.translatePage();');

            // test dictionary_id.json
            await assertTextContains(driver, 'help', 'XXhelp');
            await clickButton(driver, 'help');
            await assertTextContains(driver, 'UPb_86', ratiosEN);
            // test dictionary_class.json
            await switchToOptionsPage(driver);
            await assertTextContains(driver, 'help_exterr_UPb', propagateEN);
            await assertTextContains(driver, 'help_UPb_formats', 'XXinput format:');
            // test contextual_help.json
            await clickButton(driver, 'help_ierr');
            await assertTextContains(driver, 'helpmenu', inputErrorHelpEN);
            await closeContextualHelp(driver);
            await clickButton(driver, 'help_mint_concordia');
            await assertTextContains(driver, 'helpmenu', 'XXminimum age limit.');
            await closeContextualHelp(driver);
            // test home_id.json
            await clickButton(driver, 'home');
            await installationOf(driver, 'translateHomePage');
            await driver.executeScript('window.translateHomePage();');
            await assertTextContains(driver, 'online_tab', 'XXonline');
            await assertTextContains(driver, 'intro', introEN);
        });
    });

    describe('the plotter', function() {
        it('can plot a concordia graph', async function() {
            this.timeout(25000);
            // 38/06, err, 07/06, err
            const testData = [
                [25.2, 0.03, 0.0513, 0.0001, '', '', ''],
                [25.4, 0.02, 0.0512, 0.0002, '', '', ''],
                [27.1, 0.01, 0.05135, 0.00005, '', '', ''],
                [26.1, 0.025, 0.0512, 0.0002, '', '', 'x']
            ];
            await driver.wait(until.elementLocated(cellInTable('INPUT', 1, 1)));
            await driver.wait(() => tryToClearGrid(driver));
            await inputTestData(driver, testData);
            // remove selection
            await driver.switchTo().activeElement().sendKeys(Key.ARROW_RIGHT);
            await choosePlotDevice(driver, 'concordia');
            await switchToOptionsPage(driver);
            const options = {
                U238U235: 137.818,
                errU238U235: 0.0225,
                // must be tick values
                minx: 0.260,
                maxx: 0.280,
                miny: 0.0360,
                maxy: 0.0400
            };
            await performType(driver, options);
            await performClick(driver, 'plot');
            const img = await plotDisplayed(driver);
            await driver.wait(until.elementIsVisible(img));
            const imgSrc = await img.getAttribute('src');
            const flatImg = imgSrc.replace(/%0A/g, '');
            const imgB64 = flatImg.split(',')[1];
            const svg = getSvg(imgB64);
            const axes = svg.getAxes();
            testData.forEach((data) => {
                const [u238pb206, xerr, pb207pb206, yerr, dummy0, dummy1, omit] = data;
                const pb207u235 = options.U238U235 * pb207pb206 / u238pb206;
                const pb206u238 = 1 / u238pb206;
                const coords = plotToGraph(axes, options, pb207u235, pb206u238);
                if (omit) {
                    assert(svg.isOmittedPoint(coords.x, coords.y));
                } else {
                    assert(svg.isPoint(coords.x, coords.y));
                }
            });
        });
    });

    describe('progress info', function() {
        it('text works', async function() {
            this.timeout(40000);
            await driver.get('http://localhost:50054');
            await choosePlotDevice(driver, 'isochron');
            await switchToOptionsPage(driver);
            await optionsLoaded(driver);
            await clickCheckbox(driver, 'diseq');
            await select(driver, 'U48-diseq', '2');
            await performType(driver, { 'sU48': '0.1' });
            await performClick(driver, 'plot');
            await assertTextContains(driver, 'loader', 'Obtaining U48i search limits');
            await assertProgressBetween(driver, 0, 20);
            await assertTextContains(driver, 'loader', 'Calculating posterior distribution of the initial activity ratios');
            await assertProgressBetween(driver, 50, 80);
            await assertTextContains(driver, 'loader', 'Calculating posterior distribution of the age');
            await plotDisplayed(driver);
        }); 
    });

    describe('errors', function() {
        it('are displayed', async function() {
            this.timeout(10000);
            await driver.get('http://localhost:50054');
            await switchToOptionsPage(driver);
            await optionsLoaded(driver);
            await performType(driver, { 'cex': 'NaN' });
            await performClick(driver, 'plot');
            await assertErrorTextContains(driver, 'cex');
        });
    });

    describe('smoke test', function() {
        before(async function() {
            await driver.get('http://localhost:50054');
        });
        const graphDevices = {
            "concordia": ["U-Pb"],
            "helioplot": ["U-Th-He"],
            "evolution": ["U-series"],
            "isochron": ["U-Pb", "Pb-Pb", "Th-Pb", "Ar-Ar", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf", "U-Th-He", "U-series"],
            "radial plot": ["U-Pb", "Pb-Pb", "Th-Pb", "Ar-Ar", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf", "U-Th-He", "fission tracks", "U-series", "other"],
            "regression": ["other"],
            "weighted mean": ["U-Pb", "Pb-Pb", "Th-Pb", "Ar-Ar", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf", "U-Th-He", "fission tracks", "U-series", "other"],
            "age spectrum": ["Ar-Ar", "other"],
            "KDE": ["U-Pb", "Pb-Pb", "Th-Pb", "Ar-Ar", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf", "U-Th-He", "fission tracks", "U-series", "detritals", "other"],
            "CAD": ["U-Pb", "Pb-Pb", "Th-Pb", "Ar-Ar", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf", "U-Th-He", "fission tracks", "U-series", "detritals", "other"],
            "MDS": ["detritals"]
        };
        forEachOfArrayValue(graphDevices, function(device, gc) {
            it(gc + ' on ' + device + ' gets a plot', async function() {
                this.timeout(12000);
                await chooseGeochronometer(driver, gc);
                await choosePlotDevice(driver, device);
                await performClick(driver, 'plot');
                await plotDisplayed(driver);
            });
        });
        const tableDevices = {
            "get \u03B6": ["fission tracks"],
            "ages": ["U-Pb", "Pb-Pb", "Th-Pb", "Ar-Ar", "K-Ca", "Rb-Sr", "Sm-Nd", "Re-Os", "Lu-Hf", "U-Th-He", "fission tracks", "U-series"]
        };
        forEachOfArrayValue(tableDevices, function(device, gc) {
            it(gc + ' on ' + device + ' gets a table', async function() {
                this.timeout(4000);
                await chooseGeochronometer(driver, gc);
                await choosePlotDevice(driver, device);
                await clickButton(driver, 'run');
                var el = await driver.wait(
                    until.elementLocated(By.css('#OUTPUT .handsontable'))
                );
                await driver.wait(until.elementIsVisible(el));
                await tableAppears(driver);
            });
        });
    });
});

function forEachOfArrayValue(kToVs, f) {
    for (var k in kToVs) {
        kToVs[k].forEach(function(v) { f(k, v); });
    }
}

function plotToGraph(svg, options, x, y) {
    return {
        x: svg.leftTick + (svg.rightTick - svg.leftTick) * (x - options.minx) / (options.maxx - options.minx),
        y: svg.bottomTick - (svg.bottomTick - svg.topTick) * (y - options.miny) / (options.maxy - options.miny)
    };
}

// isAbove(x, y, x0, y0, x1, y1) returns true if and only if
// a line drawn directly down (increasing y) from y would intersect
// the line from (x0,y0) to (x1,y1), including the point on the left
// but not on the right.
function isAbove(x, y, x0, y0, x1, y1) {
    // (x0,y0) should be the left hand point
    if (x1 <= x0) {
        if (x0 === x1) {
            // special case -- vertical line must never be hit
            return false;
        }
        const xt = x0;
        x0 = x1;
        x1 = xt;
        const yt = y0;
        y0 = y1;
        y1 = yt;
    }
    if (x1 <= x) {
        // missed to the right
        return false;
    }
    if (x < x0) {
        // missed to the left
        return false;
    }
    // find y value of intersection of vertical line through (x,y)
    const py = y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    return y < py;
}

// cs is alternating x and y co-ordinates of the vertices of a polygon.
// Returns true if and only if (x,y) is within that polygon.
function isWithin(x, y, cs) {
    let aboveCount = 0;
    let x0 = cs[cs.length - 2];
    let y0 = cs[cs.length - 1];
    for (let j = 0; j < cs.length; j += 2) {
        const x1 = cs[j];
        const y1 = cs[j + 1];
        if (isAbove(x, y, x0, y0, x1, y1)) {
            ++aboveCount;
        }
        x0 = x1;
        y0 = y1;
    }
    return (aboveCount & 1) == 1;
}

function getSvg(imgB64) {
    const data = Buffer.from(imgB64, 'base64').toString();
    const quads = data.match(/<path\b[^>]+\bd="M *[0-9\.]+ +[0-9\.]+ +L *[0-9\.]+ +[0-9\.]+ +L *[0-9\.]+ +[0-9\.]+ +L *[0-9\.]+ +[0-9\.]+/mg);
    if (!quads) {
        console.error("no rectangular paths in SVG!");
        console.log(data);
        return null;
    }
    let plotArea = 0;
    let plotLeft = null;
    let plotRight = null;
    let plotTop = null;
    let plotBottom = null;
    quads.forEach(quad => {
        const qs = quad.match(/\bd="M *([0-9\.]+) +([0-9\.]+) +L *([0-9\.]+) +([0-9\.]+) +L *([0-9\.]+) +([0-9\.]+) +L *([0-9\.]+) +([0-9\.]+)/m);
        // biggest polygon is probably the plot area
        if (qs) {
            const vs = [];
            for (let i = 1; i !== qs.length; ++i) {
                vs.push(Number(qs[i]));
            }
            const xmin = Math.min(vs[0], vs[2], vs[4], vs[6]);
            const xmax = Math.max(vs[0], vs[2], vs[4], vs[6]);
            const ymin = Math.min(vs[1], vs[3], vs[5], vs[7]);
            const ymax = Math.max(vs[1], vs[3], vs[5], vs[7]);
            const area = (xmax - xmin) * (ymax - ymin);
            if (plotArea < area) {
                plotArea = area;
                plotLeft = xmin;
                plotRight = xmax;
                plotTop = ymin;
                plotBottom = ymax;
            }
        }
    });
    const width = plotRight - plotLeft;
    const height = plotBottom - plotTop;
    const maxTickProportion = 0.04;
    const potentialTicks = data.match(/<path [^>]*\bd="M *[0-9\.]+ +[0-9\.]+ +L *[0-9\.]+ +[0-9\.]+ *"/mg);
    let xTicks = [];
    let yTicks = [];
    potentialTicks.forEach(pt => {
        const gs = pt.match(/\bd="M *([0-9\.]+) +([0-9\.]+) +L *([0-9\.]+) +([0-9\.]+) *"/m);
        let x0 = Number(gs[1]);
        let x1 = Number(gs[3]);
        let y0 = Number(gs[2]);
        let y1 = Number(gs[4]);
        if (gs && x0 === x1 && Math.abs(y1 - y0) < maxTickProportion * height) {
            xTicks.push(x0);
        }
        if (gs && y0 === y1 && Math.abs(x1 - x0) < maxTickProportion * width) {
            yTicks.push(y0);
        }
    });
    xTicks.sort((x,y) => x - y);
    yTicks.sort((x,y) => x - y);
    let potentialPoints = data.match(/<path [^>]*style="([^";]+;)*\bfill: *rgb[^>]*>/mg);
    if (!potentialPoints) {
        potentialPoints = [];
    }
    const coords = [];
    potentialPoints.forEach(pp => {
        const rgb = pp.match(/\bstyle="[^"]*\bfill: *rgb\(([0-9]+)%,([0-9]+)%,([0-9]+)%\)/m);
        if (rgb && Number(rgb[1]) < 20 && 60 < Number(rgb[2]) && Number(rgb[3]) < 20) {
            const d = pp.match(/\bd="([^"]*)"/m);
            if (d) {
                const xytexts = d[1].match(/[0-9.]+/mg);
                const xys = xytexts.map(t => Number(t));
                coords.push(xys);
            }
        }
    });
    let potentialOmitteds = data.match(/<path [^>]*style="([^";]+;)*\bfill: *none[^>]*>/mg);
    if (!potentialOmitteds) {
        potentialOmitteds = [];
    }
    const omitteds = [];
    potentialOmitteds.forEach(po => {
        const rgb = po.match(/\bstyle="[^"]*\bstroke: *rgb\(([0-9.]+)%,([0-9.]+)%,([0-9.]+)%\)/m);
        if (rgb) {
            const r = Number(rgb[1]);
            const g = Number(rgb[2]);
            const b = Number(rgb[3]);
            if (40 < r && r < 85 && 40 < g && g < 85 && 40 < b && b < 85) {
                const d = po.match(/\bd="([^"]*)"/m);
                if (d) {
                    const xytexts = d[1].match(/[0-9.]+/mg);
                    const xys = xytexts.map(t => Number(t));
                    omitteds.push(xys);
                }
            }
        }
    });
    if (xTicks.length ===0 || yTicks.length === 0) {
        console.error('no ticks in SVG');
        return null;
    }
    return {
        getAxes: function() {
            return {
                bottom: plotBottom,
                left: plotLeft,
                height: height,
                width: width,
                leftTick: xTicks[0],
                rightTick: xTicks[xTicks.length - 1],
                topTick: yTicks[0],
                bottomTick: yTicks[yTicks.length - 1]
            }
        },
        isPoint: function(x, y) {
            for (let i = 0; i !== coords.length; ++i) {
                if (isWithin(x, y, coords[i])) {
                    return true;
                }
            }
            return false;
        },
        isOmittedPoint: function(x, y) {
            for (let i = 0; i !== omitteds.length; ++i) {
                if (isWithin(x, y, omitteds[i])) {
                    return true;
                }
            }
            return false;
        }
    };
}

async function installationOf(driver, name) {
    await driver.wait(async function () {
        return await driver.executeScript('return !!window.' + name);
    });
}

async function plotDisplayed(driver) {
    return await driver.wait(until.elementLocated(
        By.css('#myplot img[src]')
    ));
}

async function optionsLoaded(driver) {
    await driver.wait(async () => {
        const es = await driver.findElements(By.css('input#cex'));
        return 0 < es.length && 'NaN' !== await es[0].getAttribute('value')
    });
}

async function tableAppears(driver) {
    const homeCell = await driver.findElement(cellInTable('OUTPUT', 1, 1));
    await driver.wait(async function() {
        let text = await homeCell.getText();
        return !isNaN(Number(text));
    });
}

async function removeDefaultLanguage(driver) {
    await driver.executeScript('window.localStorage.removeItem("language");');
}

async function testTranslation(driver, language, help, ratios,
        propagate, inputErrorHelp, online, intro) {
    if (!language) {
        await removeDefaultLanguage(driver);
    }
    await driver.get('http://localhost:50054');
    await installationOf(driver, 'translatePage');
    if (language) {
        await chooseLanguage(driver, language);
    } else {
        // for some reason we have to click the header or
        // the Help button won't click under Selenium
        await driver.findElement(By.css('main header')).click();
    }
    // test dictionary_id.json
    await assertTextContains(driver, 'help', help);
    await clickButton(driver, 'help');
    await assertTextContains(driver, 'UPb_86', ratios);
    // test dictionary_class.json
    await switchToOptionsPage(driver);
    await assertTextContains(driver, 'help_exterr_UPb', propagate);
    // test contextual_help.json
    await clickButton(driver, 'help_ierr');
    await assertTextContains(driver, 'helpmenu', inputErrorHelp);
    // test home_id.json
    await clickButton(driver, 'home');
    await assertTextContains(driver, 'online_tab', online);
    await assertTextContains(driver, 'intro', intro);
}

async function assertTextContains(driver, id, text) {
    const element = await driver.wait(until.elementLocated(By.id(id)));
    await driver.wait(until.elementIsVisible(element));
    await driver.wait(until.elementTextContains(element, text));
}

async function assertProgressBetween(driver, lower, upper) {
    const regex = /background-image:\s*linear-gradient\(to right,.*green\s+([0-9\.]+)%/;
    const element = await driver.wait(until.elementLocated(By.id('loader')));
    await driver.wait(async () => {
        const style = await element.getAttribute('style');
        const result = style.match(regex);
        return result && lower <= result[1] && result[1] <= upper;
    });
}

async function assertErrorTextContains(driver, text) {
    await assertTextContains(driver, 'error', text);
}

function areNearlyEqual(a, b) {
    const db = Math.abs(b * 1e-6) + 1e-12;
    return (b - db < a && a < b + db, a + ' is not nearly ' + b);
}

async function select(driver, selectId, optionId) {
    var elt = await driver.wait(async () => {
        const s = await driver.findElement(By.id(selectId));
        await s.click();
        return await driver.findElement(By.css(
            '#' + selectId + ' option[value="' + optionId + '"]'
        ));
    });
    await elt.click();
}

async function chooseFromMenu(driver, choiceText, buttonId, menuId) {
    const loc = By.xpath("//li/div[contains(text(),'" + choiceText + "')]");
    const choice = await driver.wait(async () => {
        await performClick(driver, buttonId);
        await driver.findElement(By.id(menuId));
        var es = await driver.findElements(loc);
        if (0 < es.length && await es[0].isDisplayed()) {
            return es[0];
        }
        return null;
    });
    await performClick(driver, choice);
}

async function choosePlotDevice(driver, choiceText) {
    const loc = By.css('#plotdevice-button .ui-selectmenu-text');
    var el = await driver.findElement(loc);
    await driver.wait(until.elementIsVisible(el));
    await chooseFromMenu(driver, choiceText, 'plotdevice-button', 'plotdevice-menu');
    el = await driver.findElement(loc);
    await driver.wait(until.elementTextContains(el, choiceText));
}

async function chooseGeochronometer(driver, choiceText) {
    const loc = By.css('#geochronometer-button .ui-selectmenu-text');
    var el = await driver.wait(until.elementLocated(loc));
    await driver.wait(until.elementIsVisible(el));
    await chooseFromMenu(driver, choiceText, 'geochronometer-button', 'geochronometer-menu');
    el = await driver.wait(until.elementLocated(loc));
    await driver.wait(until.elementTextContains(el, choiceText));
}

async function chooseLanguage(driver, languageText) {
    const aLanguageChoiceLocator = By.css('#language-menu li');
    await driver.wait(async () => {
        await clickButton(driver, 'language-button');
        const es = await driver.findElements(aLanguageChoiceLocator);
        if (es.length == 0) {
            return false;
        }
        return await es[0].isDisplayed();
    });
    const arbitraryLanguageChoice = await driver.wait(
        until.elementLocated(aLanguageChoiceLocator)
    );
    await driver.wait(until.elementIsVisible(arbitraryLanguageChoice));
    const choice = await findMenuItem(driver, languageText);
    await performClick(driver, choice);
}

async function switchToOptionsPage(driver) {
    await driver.wait(async () => {
        await clickButton(driver, 'options');
        const es = await driver.findElements(By.css('help.translate'));
        return 0 < es.length && await es[0].isDisplayed();
    });
}

// To be used when normal clicks mysteriously don't work.
// This is probably a bad idea, perhaps it only works more
// often because it is slower.
async function performClick(driver, element) {
    if (typeof(element) === 'string') {
        element = await driver.wait(until.elementLocated(By.id(element)));
    }
    await driver.actions()
        .move({origin: element})
        .click()
        .perform();
    return element;
}

async function clickCheckbox(driver, id) {
    await driver.wait(async () => {
        const elt = await driver.findElement(By.id(id));
        await elt.click();
        return await elt.isSelected();
    });
}

function scrollIntoView(element) {
    const driver = element.getDriver();
    return driver.executeScript("const e = arguments[0]; e.scrollIntoView(true);", element);
}

// super robust typing into input box
async function performType(driver, idToKeys) {
    for (const k in idToKeys) {
        const element = await driver.wait(until.elementLocated(By.id(k)));
        await scrollIntoView(element);
        const input = await performClick(driver, element);
        await input.clear();
        await input.sendKeys(idToKeys[k]);
    }
}

// Clicks 'Clear' button then reports if the grid (or at least the home cell)
// did get cleared.
async function tryToClearGrid(driver) {
    await clickButton(driver, 'clear');
    const homeCell = await driver.findElement(cellInTable('INPUT', 1, 1));
    const text = await homeCell.getText();
    return text === '';
}

async function testUndoInTable(driver) {
    const box = await driver.findElement(cellInTable('INPUT', 1, 1));
    await driver.wait(until.elementTextContains(box,'25.094'));
    await goToCell(driver, 'INPUT', 1, 1);
    let input = await driver.switchTo().activeElement();
    await input.sendKeys('13.2', Key.TAB);
    await driver.wait(until.elementTextContains(box,'13.2'));
    await goToCell(driver, 'INPUT', 1, 1);
    input = await driver.switchTo().activeElement();
    await input.sendKeys(Key.CONTROL, 'a');
    await input.sendKeys('7.54', Key.TAB);
    await driver.wait(until.elementTextContains(box,'7.54'));
    await input.sendKeys(Key.CONTROL, 'z');
    await driver.wait(until.elementTextContains(box,'13.2'));
    await input.sendKeys(Key.CONTROL, Key.SHIFT, 'z');
    await driver.wait(until.elementTextContains(box,'7.54'));
}

async function inputTestData(driver, testData) {
    await goToCell(driver, 'INPUT', 1, 1);
    const box = await driver.switchTo().activeElement();
    // write the first line in by typing it
    await box.sendKeys(testData[0][0], Key.TAB, testData[0][1], Key.TAB, testData[0][2], Key.TAB, testData[0][3], Key.RETURN);
    // write the other lines in by pasting them
    clipboardy.writeSync(testData.slice(1).map(ds => ds.join('\t')).join('\n'));
    await goToCell(driver, 'INPUT', 2, 1);
    const box2 = await driver.switchTo().activeElement();
    await box2.sendKeys(Key.CONTROL + 'v');
}

async function findMenuItem(driver, text) {
    const uiMenuItemLocator = By.className('ui-menu-item-wrapper');
    await driver.wait(until.elementLocated(uiMenuItemLocator));
    const menuItems = await driver.findElements(uiMenuItemLocator);
    for (const index in menuItems) {
        const item = menuItems[index];
        const itemText = await item.getText();
        if (itemText === text) {
            return item;
        }
    }
    assert(false, "No ui menu item found with text '" + text + "'");
}

async function closeContextualHelp(driver) {
    await driver.findElement(By.css('.ui-icon-closethick')).click();
}

async function clickButton(driver, id) {
    const button = await driver.wait(until.elementLocated(By.id(id)));
    await button.click();
}

async function typeInCell(driver, row, column, keys) {
    await goToCell(driver, 'INPUT', row, column);
    let input = await driver.switchTo().activeElement();
    await input.sendKeys.apply(input, keys);
}

function goToCell(driver, tableId, row, column) {
    return driver.wait(until.elementLocated(cellInTable(tableId, row, column))).click();
}

function cellInTable(tableId, row, column) {
    return By.css(
        '#' + tableId
        + ' table tbody tr:nth-of-type(' + row
        + ') td:nth-of-type(' + column + ')'
    );
}

function waitUntilCellTextIs(driver, row, column, pred) {
    const loc = cellInTable('INPUT', row, column);
    return driver.wait(async () => {
        const es = await driver.findElements(loc);
        if (es.length === 0) {
            return false;
        }
        const t = await es[0].getText();
        return pred(t);
    });
}
