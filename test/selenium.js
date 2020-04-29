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
        this.timeout(8000);
        await driver.get('http://localhost:50054');
        await goToCell(driver, 1, 1);
        const box = await driver.switchTo().activeElement();
        await box.sendKeys('34.5', Key.TAB, '0.03', Key.RETURN);
        clipboardy.writeSync('23.4\t0.02\n33.3\t0.023');
        await goToCell(driver, 2, 1);
        await box.sendKeys(Key.CONTROL + 'v');
        await driver.findElement(By.id('plot')).click();
    });
});

async function goToCell(driver, row, column) {
    let cell = await driver.wait(until.elementLocated(cellInTable(row, column)));
    cell.click();
}

function cellInTable(row, column) {
    return By.css('table tbody tr:nth-of-type(' + row + ') td:nth-of-type(' + column + ')');
}
