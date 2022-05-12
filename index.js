const playwright = require('playwright');
const compareImages = require("resemblejs/compareImages")
const config = require("./config.json");
const fs = require('fs');

const { viewportHeight, viewportWidth, browsers, options } = config;

const img = '7';
//const img1 = 'http://localhost:8080/' + img + '.png'
//const img2 = 'http://localhost:8081/' + img + '.png'
const img1 = 'login342.png';
const img2 = 'login441.png';

async function executeTest(){
    if(browsers.length === 0){
      return;
    }
    let resultInfo = {}
    let datetime = new Date().toISOString().replace(/:/g,".");
    for(b of browsers){
        if(!b in ['chromium', 'webkit', 'firefox']){
            return;
        }
        if (!fs.existsSync(`./results/${img}`)){
            fs.mkdirSync(`./results/${img}`, { recursive: true });
        }
        //Launch the current browser context
        /*const browser = await playwright[b].launch({headless: true, viewport: {width:viewportWidth, height:viewportHeight}});
        const context = await browser.newContext();
        const page = await context.newPage(); 
        await page.goto(config.url);
        await page.screenshot({ path: `./results/${datetime}/before-${b}.png` });
        await page.click('#generate');
        await page.screenshot({ path: `./results/${datetime}/after-${b}.png` });
        await browser.close();*/

        const data = await compareImages(
            fs.readFileSync(`./results/${img}/${img1}`),
            fs.readFileSync(`./results/${img}/${img2}`),
            //`http://localhost:8080/${img}.png`, 
            //`http://localhost:8081/${img}.png`,
            options
        );
        resultInfo[b] = {
            isSameDimensions: data.isSameDimensions,
            dimensionDifference: data.dimensionDifference,
            rawMisMatchPercentage: data.rawMisMatchPercentage,
            misMatchPercentage: data.misMatchPercentage,
            diffBounds: data.diffBounds,
            analysisTime: data.analysisTime
        }
        fs.writeFileSync(`./results/${img}/compare-${img}-${b}.png`, data.getBuffer());

    }

    fs.writeFileSync(`./results/${img}/report.html`, createReport(datetime, resultInfo));
    fs.copyFileSync('./index.css', `./results/${img}/index.css`);

    console.log('------------------------------------------------------------------------------------')
    console.log("Execution finished. Check the report under the results folder")
    return resultInfo;  
  }
(async ()=>console.log(await executeTest()))();

function browser(b, info){
    return `<div class=" browser" id="test0">
    <div class=" btitle">
        <h2>Browser: ${b}</h2>
        <p>Data: ${JSON.stringify(info)}</p>
    </div>
    <div class="imgline">
      <div class="imgcontainer">
        <span class="imgname">Reference</span>
        <img class="img2" src=${img1} id="refImage" label="Reference">
      </div>
      <div class="imgcontainer">
        <span class="imgname">Test</span>
        <img class="img2" src=${img2} id="testImage" label="Test">
      </div>
    </div>
    <div class="imgline">
      <div class="imgcontainer">
        <span class="imgname">Diff</span>
        <img class="imgfull" src="./compare-${img}-${b}.png" id="diffImage" label="Diff">
      </div>
    </div>
  </div>`
}

function createReport(datetime, resInfo){
    return `
    <html>
        <head>
            <title> VRT Report </title>
            <link href="index.css" type="text/css" rel="stylesheet">
        </head>
        <body>
            <h1>Report for 
                 <a href="${config.url}"> ${config.url}</a>
            </h1>
            <p>Executed: ${datetime}</p>
            <div id="visualizer">
                ${config.browsers.map(b=>browser(b, resInfo[b]))}
            </div>
        </body>
    </html>`
}