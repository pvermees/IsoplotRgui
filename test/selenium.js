"use strict";

const { spawn } = require('child_process');
const { Builder, By, Key, until } = require('selenium-webdriver');
const { describe, before, beforeEach, after, it } = require('mocha');
const clipboardy = require("clipboardy");
const assert = require("assert");
const { PNG } = require("pngjs");
const floor = Math.floor;
const http = require("http");

function findArg(a) {
  for (let i = 1; i < process.argv.length; ++i) {
    const ar = process.argv[i];
    const equals = ar.search("=");
    if (equals < 0) {
      if (ar === a) {
        ++i;
        return process.argv[i];
      }
    } else {
      if (ar.slice(0, equals) === a) {
        return ar.slice(equals + 1);
      }
    }
  }
  return null;
}

const browserArg = findArg('--browser');
const browser = browserArg ? browserArg : 'chrome';

function successfulGet(address, retries, done) {
  http.get(address, res => {
    done();
  }).on('error', (err) => {
    if (0 < retries) {
      setTimeout(() => {
        successfulGet(address, retries - 1, done);
      }, 1000);
    } else {
      console.error('failed to get', address);
      done();
    }
  });
}

describe('IsoplotRgui', function () {
  let rProcess;
  let driver;

  before(function (done) {
    rProcess = spawn('Rscript', ['build/start-gui.R', '50054']);
    successfulGet('http://localhost:50054', 5, () => {
      new Builder().forBrowser(browser).build().then(d => {
        driver = d;
        done();
      });
    });
  });

  after(function (done) {
    driver.quit().then(() => {
      rProcess.kill('SIGINT');
      done();
    });
  });

  describe('table implementation', function () {

    beforeEach(async function () {
      await driver.get('http://localhost:50054');
    });

    it('undoes mistakes', async function () {
      this.timeout(12000);
      await testUndoInTable(driver);
    });

    it('resists script injection attempts', async function () {
      this.timeout(4000);
      await goToCell(driver, 'INPUT', 1, 1);
      const input = await driver.switchTo().activeElement();
      const text = "<script>alert('bad!')</script>";
      await input.sendKeys(text, Key.TAB);
      const box = await driver.findElement(cellInTable('INPUT', 1, 1));
      await driver.wait(until.elementTextContains(box, text));
    });

    it('is readable from the calculation engine', async function () {
      this.timeout(8000);
      await driver.wait(until.elementLocated(cellInTable('INPUT', 1, 1)));
      await driver.wait(() => tryToClearGrid(driver));
      const u235toU238 = 137.818;
      const testData = [
        ['25.2', '0.03', '0.0513', '0.0001'],
        ['25.4', '0.02', '0.0512', '0.0002', '', '', '', 'hello'],
        ['27.1', '0.01', '0.05135', '0.00005']
      ];
      await inputTestData(driver, testData);
      const input = await driver.switchTo().activeElement();
      await input.sendKeys(Key.ARROW_UP);
      await choosePlotDevice(driver, 'ages');
      await clickButton(driver, 'run');
      const expectedResults = [
        [251.1, 0.51, 250.86, 0.29, 253.3, 4.48, 250.88, 0.29],
        [248.92, 0.88, 248.93, 0.19, 248.81, 8.99, 248.93, 0.19],
        [235.59, 0.22, 233.591, 0.085, 255.54, 2.24, 233.619, 0.085]
      ];
      await chainWithIndex(expectedResults, async function (row, rowNumber) {
        await chainWithIndex(row, async function (value, columnNumber) {
          const actual = await doUntil(async function () {
            const text = await getOutputCellText(driver, rowNumber + 1, columnNumber + 1);
            return Number(text);
          }, x => !isNaN(x), 8, 500);
          assertNearlyEqual(Number(actual), value);
        });
      });
    });
  });

  describe('language support', function () {
    const onlineEN = 'Online';
    const introEN = 'free and open-source';
    const onlineZH = '在线使用';
    const introZH = '是一个免费的开源软件';
    const inputErrorHelpEN = 'Choose one of the following four options:';
    const propagateEN = 'Propagate external uncertainties?';
    const ratiosEN = 'ratios.';
    const helpEN = 'Help';
    this.timeout(25000);

    beforeEach(async function () {
      await driver.get('http://localhost:50054');
    });

    it('displays the correct language', async function () {
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

    it('displays English where no translation is available', async function () {
      await driver.executeScript('window.localStorage.setItem("language", "xxtest");');
      await driver.get('http://localhost:50054');
      await waitForFunctionToBeInstalled(driver, 'translatePage');
      await driver.executeScript('window.translatePage();');

      // test dictionary_id.json
      await assertTextContains(driver, 'help', 'XXhelp');
      await clickButton(driver, 'help');
      await assertTextContains(driver, 'UPb_86', ratiosEN);
      // test dictionary_class.json
      await clickButton(driver, 'options');
      await assertTextContains(driver, 'help_exterr_UPb', propagateEN);
      await assertTextContains(driver, 'help_UPb_formats', 'XXinput format:');
      // test contextual_help.json
      await clickButton(driver, 'help_ierr');
      await assertTextContains(driver, 'helpmenu', inputErrorHelpEN);
      await driver.findElement(By.css('button[title="Close"]')).click();
      await clickButton(driver, 'help_mint_concordia');
      await assertTextContains(driver, 'helpmenu', 'XXminimum age limit.');
      // test home_id.json
      await clickButton(driver, 'home');
      await waitForFunctionToBeInstalled(driver, 'translateHomePage');
      await driver.executeScript('window.translateHomePage();');
      await assertTextContains(driver, 'online_tab', 'XXonline');
      await assertTextContains(driver, 'intro', introEN);
    });
  });

  describe('the plotter', function () {

    beforeEach(async function () {
      await driver.get('http://localhost:50054');
    });

    it('can plot a concordia graph', async function () {
      this.timeout(25000);
      // 38/06, err, 07/06, err
      const testData = [
        [25.2, 0.03, 0.0513, 0.0001, '', '', ''],
        [25.4, 0.02, 0.0512, 0.0002, '', '', '', 'a comment'],
        [27.1, 0.01, 0.05135, 0.00005, '', '', ''],
        [26.1, 0.025, 0.0512, 0.0002, '', '', 'x']
      ];
      await driver.wait(() => tryToClearGrid(driver));
      await inputTestData(driver, testData);
      // remove selection
      await driver.switchTo().activeElement().sendKeys(Key.ARROW_RIGHT);
      await choosePlotDevice(driver, 'concordia');
      await performClick(driver, 'options');
      const options = {
        U238U235: 137.818,
        errU238U235: 0.0225,
        minx: 0.260,
        maxx: 0.282,
        miny: 0.0368,
        maxy: 0.0400,
        ellipsefill: "'green'",
        ellipsestroke: "'green'"
      };
      await performType(driver, options);
      await performClick(driver, 'plot');
      const img = await driver.wait(until.elementLocated(By.css('#myplot img')));
      const imgSrc = await img.getAttribute('src');
      const imgB64 = imgSrc.split(',')[1];
      testData.forEach((data) => {
        const failures = assertConcordiaBlob(imgB64, options, data, 1500);
        // some failures are caused by other marks on the graph; labels or
        // other blobs, for example.
        assert(failures.length <= 20, 'Too many failures: ' + failures.join(', '));
      });
    });
  });
});

function assertConcordiaBlob(imgB64, options, testData, sampleCount) {
  const imgB64i = imgB64.replace(/%0A/gi, '');
  const png = PNG.sync.read(Buffer.from(imgB64i, 'base64'));
  const axes = getAxes(png);
  const ranges = getRanges(options);
  const [u38pb06, u38pb06err, pb07pb06, pb07pb06err,
    dummy0, dummy1, omit] = testData;
  const innerColour = ['x', 'X'].includes(omit) ? 'W' : 'G';
  const { U238U235 } = options;
  const u38pb06rev = varianceOfRelativeError(u38pb06, u38pb06err);
  const pb07pb06rev = varianceOfRelativeError(pb07pb06, pb07pb06err);
  // y is Pb206 / U238
  const y = 1 / u38pb06;
  // x is Pb207 / U235
  const x = pb07pb06 * U238U235 / u38pb06;
  const yErr = y * Math.sqrt(u38pb06rev);
  const xErrBy3806 = x * Math.sqrt(u38pb06rev);
  const xErrBy0706 = x * Math.sqrt(pb07pb06rev);
  // the zone of ambiguity seems to be 5 <= h2 <= 8. I don't know why.
  const minimumDistanceSquared = 5;
  const maximumDistanceSquared = 8;
  let failures = [];
  for (let i = 0; i != sampleCount; ++i) {
    // So, let's choose a random dot
    // tv = amount of pb07pb06 error we have
    const tv = Math.random() * 6 - 3;
    // tw = amount of u38pb06 error we have
    const tw = Math.random() * 6 - 3;
    const h2 = tv * tv + tw * tw;
    const gx = x + tv * xErrBy0706 + tw * xErrBy3806;
    const gy = y + tw * yErr;
    // we think if h2 < 1 the transformed dot wll be green
    const pixel = toPixel(axes, ranges, gx, gy);
    const col = colour(png, pixel);
    const expectedCol = h2 < minimumDistanceSquared ? innerColour : 'W';
    if (expectedCol !== col
      && (h2 < minimumDistanceSquared
        || maximumDistanceSquared < h2)) {
      failures.push('Expected colour ' + expectedCol
        + ' but got ' + col + ' at distance^2 ' + h2);
    }
  }
  return failures;
}

function varianceOfRelativeError(value, standardDeviation) {
  const r = standardDeviation / value;
  return r * r;
}

function colour(png, pixel) {
  const index = (pixel.x + png.width * pixel.y) * 4;
  const r = png.data[index];
  const g = png.data[index + 1];
  const b = png.data[index + 2];
  const bright = Math.max(r, g, b, 20);
  const threshold = bright * 0.6;
  const colour =
    (r < threshold ? 0 : 1) +
    (g < threshold ? 0 : 2) +
    (b < threshold ? 0 : 4);
  return "KRGYBMCW"[colour];
}

function isLinePixel(png, index) {
  const d = png.data;
  const brightness = d[index] + d[index + 1] + d[index + 2];
  return brightness < 350;
}

function isOnHorizontalLine(png, index) {
  const pixelsToCheck = floor(png.width / 10);
  index -= floor(pixelsToCheck / 2) * 4;
  let lastIndex = index + pixelsToCheck * 4;
  for (; index < lastIndex; index += 4) {
    if (!isLinePixel(png, index)) {
      return false;
    }
  }
  return true;
}

function findBottomLine(png) {
  const width = png.width;
  const row = width * 4;
  const endIndex = row * png.height;
  let index = endIndex - floor(width / 2) * 4
  // search the bottom third of the image
  const giveUp = index - row * floor(png.height / 3);
  for (; giveUp <= index; index -= row) {
    if (isLinePixel(png, index) && isOnHorizontalLine(png, index)) {
      return floor(index / row);
    }
  }
  return null;
}

function isOnVerticalLine(png, index) {
  const pixelsToCheck = floor(png.height / 10);
  const row = 4 * png.width;
  index -= floor(pixelsToCheck / 2) * row;
  let lastIndex = index + pixelsToCheck * row;
  for (; index < lastIndex; index += row) {
    if (!isLinePixel(png, index)) {
      return false;
    }
  }
  return true;
}

function findLeftLine(png) {
  const width = png.width;
  const row = width * 4;
  let startIndex = floor(png.height / 2) * row;
  // search the left third of the image
  const giveUp = startIndex + floor(width / 3) * 4;
  for (let index = startIndex; index < giveUp; index += 4) {
    if (isLinePixel(png, index) && isOnVerticalLine(png, index)) {
      return floor((index - startIndex) / 4);
    }
  }
  return null;
}

function lineEndIndex(png, index, dIndex) {
  let result = index;
  let gap = 0;
  while (gap < 4) {
    if (isLinePixel(png, index)) {
      result = index;
      gap = 0;
    } else {
      ++gap;
    }
    index += dIndex;
  }
  return result;
}

function getAxes(png) {
  const originX = findLeftLine(png);
  const originY = findBottomLine(png);
  const row = png.width * 4;
  const originRowStart = originY * row;
  const originIndex = originRowStart + originX * 4;
  const topIndex = lineEndIndex(png, originIndex, -row);
  const rightIndex = lineEndIndex(png, originIndex, 4);
  return {
    bottom: originY,
    left: originX,
    height: originY - floor(topIndex / row),
    width: floor((rightIndex - originRowStart) / 4) - originX
  };
}

function getRanges(options) {
  const centreX = (options.maxx + options.minx) / 2;
  // R expands its ranges by on each side 4%, it seems
  const halfRangeX = (options.maxx - options.minx) * 0.54;
  const centreY = (options.maxy + options.miny) / 2;
  const halfRangeY = (options.maxy - options.miny) * 0.54;
  return {
    minx: centreX - halfRangeX,
    sizex: 2 * halfRangeX,
    miny: centreY - halfRangeY,
    sizey: 2 * halfRangeY
  };
}

function toPixel(axes, range, x, y) {
  return {
    x: floor(0.5 + axes.left + axes.width * (x - range.minx) / range.sizex),
    y: floor(0.5 + axes.bottom - axes.height * (y - range.miny) / range.sizey)
  };
}

async function waitForFunctionToBeInstalled(driver, functionName) {
  await driver.wait(async function () {
    return await driver.executeScript('return !!window.' + functionName);
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
  await clickButton(driver, 'options');
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
  await driver.wait(until.elementTextContains(element, text));
}

async function chainWithIndex(arr, callback, first = 0, end = arr.length) {
  if (first < end) {
    await callback(arr[first], first)
    await chainWithIndex(arr, callback, first + 1, end);
  }
}

function assertNearlyEqual(a, b) {
  const db = Math.abs(b * 1e-6) + 1e-12;
  assert(b - db < a && a < b + db, a + ' is not nearly ' + b);
}

async function choosePlotDevice(driver, choiceText) {
  await performClick(driver, 'plotdevice-button');
  const menu = await driver.findElement(By.id('plotdevice-menu'));
  const choice = await menu.findElement(By.xpath("//li/div[contains(text(),'" + choiceText + "')]"));
  await driver.wait(until.elementIsVisible(choice));
  await performClick(driver, choice);
}

async function chooseLanguage(driver, languageText) {
  await performClick(driver, 'language-button');
  const arbitraryLanguageChoice = await driver.wait(until.elementLocated(By.css('#language-menu li')));
  await driver.wait(until.elementIsVisible(arbitraryLanguageChoice));
  const choice = await findMenuItem(driver, languageText);
  await performClick(driver, choice);
}

// to be used when normal clicks mysteriously don't work
async function performClick(driver, element) {
  if (typeof (element) === 'string') {
    element = await driver.wait(until.elementLocated(By.id(element)));
  }
  await driver.actions()
    .move({ origin: element })
    .press()
    .release()
    .perform();
  return element;
}

// super robust typing into input box
async function performType(driver, idToKeys) {
  for (const k in idToKeys) {
    const input = await performClick(driver, k);
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

async function getOutputCellText(driver, row, column) {
  const cell = await driver.findElement(cellInTable('OUTPUT', row, column));
  return await cell.getText();
}

async function doUntil(doFn, isGoodFn, retries = 5, delay = 500) {
  for (; 0 <= retries; --retries) {
    const x = await doFn();
    if (isGoodFn(x)) {
      return x;
    }
    await new Promise(function (resolve) {
      setTimeout(resolve, delay);
    });
  }
}

async function testUndoInTable(driver) {
  await goToCell(driver, 'INPUT', 1, 1);
  let input = await driver.switchTo().activeElement();
  await input.sendKeys('13.2', Key.TAB);
  const box = await driver.findElement(cellInTable('INPUT', 1, 1));
  await driver.wait(until.elementTextContains(box, '13.2'));
  await goToCell(driver, 'INPUT', 1, 1);
  input = await driver.switchTo().activeElement();
  await input.sendKeys(Key.CONTROL, 'a');
  await input.sendKeys('7.54', Key.TAB);
  await driver.wait(until.elementTextContains(box, '7.54'));
  input = await driver.switchTo().activeElement();
  await input.sendKeys(Key.CONTROL, 'z');
  await driver.wait(until.elementTextContains(box, '13.2'));
  input = await driver.switchTo().activeElement();
  await input.sendKeys(Key.CONTROL, Key.SHIFT, 'z');
  await driver.wait(until.elementTextContains(box, '7.54'));
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

async function clickButton(driver, id) {
  const button = await driver.wait(until.elementLocated(By.id(id)));
  await button.click();
}

async function goToCell(driver, tableId, row, column) {
  await driver.wait(async function () {
    try {
      const cell = await driver.findElement(cellInTable(tableId, row, column));
      await cell.click();
      const inputs = await cell.findElements(By.css("input"));
      return inputs.length !== 0;
    } catch (e) {
      return false;
    }
  });
}

function cellInTable(tableId, row, column) {
  return By.css('#' + tableId + ' table tbody tr:nth-of-type(' + row + ') td:nth-of-type(' + column + ')');
}
