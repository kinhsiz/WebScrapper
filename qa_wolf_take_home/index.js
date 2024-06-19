const { chromium } = require("playwright");
const fs  = require("fs");
const path = require("path");
const { parse } = require("json2csv");

async function saveHackerNewsArticles() {
  //Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  //Go to Hacker News
 try {
   await page.goto("https://news.ycombinator.com");
 
   //Wait to load page with .athing class
   await page.waitForSelector(".athing");
 
   //Gets and returns top 10 articles
   const articles = await page.$$eval(".athing", function(link) {
     return link.slice(0, 10).map(function(link) {
        const titleName = link.querySelector(".titleline a");
        const urlLink = link.querySelector(".titleline a").getAttribute("href");
        const timeStamp = link.nextElementSibling.querySelector(".age").getAttribute("title");
        
       return {
         title: titleName ? titleName.innerText : "N/A",
         url: urlLink ? urlLink : "N/A",
         postTimestamp: timeStamp ? timeStamp : "N/A"
       };
     });
   }); 
 
   //Display message if articles not found or empty
   if (!articles || articles.length === 0) {
     throw new Error('No articles found');
   }
 
    //Convert articles to csv
    const csv = parse(articles);
 
    //File path for csv file
    const filePath = path.join(__dirname, "top10Articles.csv");
 
    //write cvs to file
    fs.writeFileSync(filePath, csv);

    console.log(`top 10 articles save to ${filePath}`);

 } catch (error) {
    console.error("Error: ", error);

 } finally {
    //close browser
    await browser.close();
 }
}

(async () => {
  await saveHackerNewsArticles();
})();
