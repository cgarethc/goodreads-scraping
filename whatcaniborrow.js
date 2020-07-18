const cli = require("commander");

const library = require("./scrapelibrary").search;
const goodreads = require("./scrapelist").scrape;

(async () => {
  cli
    .version("0.0.1")
    .arguments("node index.js")
    .option("-l, --list <goodreads list URL>", "List URL")
    .usage("node index.js -l list URL")
    .parse(process.argv);
  const titles = goodreads(cli.list);
  (await titles).forEach(async (title) => {
    console.log('Looking for', title.bookTitle);
    const results = await library(title.bookAuthor, title.bookTitle);
    results.forEach(result => {
        console.log(result);
    });
  });
})();
