//https://discover.aucklandlibraries.govt.nz/iii/encore/search/C__Sa:(roth) f:(i | u)__Orightresult__U?lang=eng&suite=def

const cli = require("commander");

const fs = require("fs");
const $ = require("cheerio");
const request = require("superagent");
const { count } = require("console");

exports.search = async (author, title) => {
  let searchResults = [];
  const url = `https://discover.aucklandlibraries.govt.nz/iii/encore/search/C__St:(${title}) a:(${author}) f:(u | z)__Orightresult__U?lang=eng&suite=def`;
  console.log("Using url:", url);
  const response = await request
    .get(url)
    .set("Content-Type", "text/html")
    .set("Accept", "text/html")
    .set(
      "User-Agent",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
    );
  
  const titleElements = $("div.dpBibTitle", response.text);
  
  for (let counter = 0; counter < titleElements.length; counter++) {

    const resourceType = titleElements[String(counter)].children[11].children[3].children[0].data;
    const titleElement = titleElements[String(counter)].children[3];
    const authorElement = titleElements[String(counter)].children[5];    
    searchResults.push({
      title: titleElement.children[1].children[0].data.trim(),
      author: authorElement.children[1].children[0].data.trim().replace('/ ', ''),
      type: resourceType
    });
  }

  return searchResults;
};

(async () => {
  cli
    .version("0.0.1")
    .arguments("node index.js")
    .option("-t, --title <title>", "Book title")
    .option("-a, --author <author>", "Book author")
    .usage("node index.js [-t] [-a] [-f]")
    .parse(process.argv);

  if (!cli.title || !cli.author) {
    console.error("Incorrect usage");
    cli.outputHelp(() => {
      process.exit(2);
    });
  }

  const searchResults = exports.search(cli.author, cli.title, "i|u");
  (await searchResults).forEach((result) => {
    console.log(result);
  });
})();
