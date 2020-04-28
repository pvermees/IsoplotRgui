"use strict";

const { spawn } = require('child_process');
const { Builder, By, Key, until } = require('selenium-webdriver');
const Mocha = require('mocha');

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
        let cell = await driver.wait(until.elementLocated(By.css('table tbody tr:first-of-type td:first-of-type')));
        await cell.click();
        const box = await driver.switchTo().activeElement();
        await box.sendKeys('34.5', Key.TAB, '0.03', Key.RETURN);
        await driver.findElement(By.id('plot')).click();
    });
});
