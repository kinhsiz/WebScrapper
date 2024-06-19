const { chromium } = require("playwright");
const fs  = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const { expect } = require("playwright/test");

jest.setTimeout(3000);

async function saveHackerNewsArticles() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

 try {
   await page.goto("https://news.ycombinator.com");
   await page.waitForSelector(".athing");
 
   const articles = await page.$$eval(".athing", function(link) {
     return link.slice(0, 10).map(function(link) {
        const titleName = link.querySelector(".titleline a");
        const urlLink = link.querySelector(".titleline a").getAttribute("href");
        const timestamp = link.nextElementSibling.querySelector(".age").getAttribute("title");
        
       return {
         title: titleName ? titleName.innerText : "N/A",
         url: urlLink ? urlLink : "N/A",
         postTimestamp: timestamp ? timestamp : "N/A"
       };
     });
   }); 
 
   if (!articles || articles.length === 0) {
     throw new Error('No articles found');
   }
 
    const csv = parse(articles);
    const filePath = path.join(__dirname, "top10Articles.csv");
    fs.writeFileSync(filePath, csv);
    return articles;

 } catch (error) {
    console.error("Error: ", error);
 } finally {
    await browser.close();
 }
}

test("saveHackerNewsArticles() should save the top 10 articles", async function() {
    const articles = await saveHackerNewsArticles();
    expect(articles).toHaveLength(10);
    articles.forEach(article => {
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("url");
        expect(article).toHaveProperty("postTimestamp");
    });  
});

