"use strict";

const { spawn } = require('child_process');
const { Builder, By, Key, until } = require('selenium-webdriver');
const Mocha = require('mocha');
const clipboardy = require("clipboardy");

const mocha = new Mocha();

mocha.addFile('test/selenium.js');
mocha.run(function(failures) {process.exitCode = failures? 1 : 0});

describe('IsoplotRgui', function testConcordia() {
    let rProcess;
    let driver;

    before(function() {
        rProcess = spawn('R', ['CMD', 'BATCH', 'test/start-gui.R', 'test/test.Rbatch']);
        driver = new Builder().forBrowser('firefox').build();
    });

    after(function() {
        rProcess.kill('SIGHUP');
    })

    it('Concordia', async function testConcordia() {
        this.timeout(10000);
        await driver.get('http://localhost:50054');
        await driver.wait(driver => tryToClearGrid(driver), 3000);
        const u235toU238 = 137.818;
        const testData = [
            ['25.2', '0.03', '0.0513', '0.0001'],
            ['25.4', '0.02', '0.0512', '0.0002'],
            ['27.1', '0.01', '0.05135', '0.00005']
        ];
        await inputTestData(driver, testData);
    });
});

// Clicks 'Clear' button then reports if the grid (or at least the home cell)
// did get cleared.
async function tryToClearGrid(driver) {
    clickButton(driver, 'clear');
    const homeCell = driver.findElement(cellInTable(1, 1));
    return await homeCell.getText() === '';
}

async function inputTestData(driver, testData) {
    await goToCell(driver, 1, 1);
    const box = await driver.switchTo().activeElement();
    // write the first line in by typing it
    await box.sendKeys(testData[0][0], Key.TAB, testData[0][1], Key.TAB, testData[0][2], Key.TAB, testData[0][3], Key.RETURN);
    // write the other lines in by pasting them
    clipboardy.writeSync(testData.slice(1).map(ds => ds.join('\t')).join('\n'));
    await goToCell(driver, 2, 1);
    const box2 = await driver.switchTo().activeElement();
    await box2.sendKeys(Key.CONTROL + 'v');
}

async function clickButton(driver, id) {
    await driver.findElement(By.id(id)).click();
}

async function goToCell(driver, row, column) {
    let cell = await driver.wait(until.elementLocated(cellInTable(row, column)));
    cell.click();
}

function cellInTable(row, column) {
    return By.css('table tbody tr:nth-of-type(' + row + ') td:nth-of-type(' + column + ')');
}
