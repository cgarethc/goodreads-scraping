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
  const titles = await goodreads(cli.list);
  console.log('Searching for', titles.length, 'titles at the library');
  (await titles).forEach(async (title) => {
    const results = await library(title.bookAuthor, title.bookTitle);    
    results.forEach(result => {
        console.log(result.title, result.author, result.type);
    });
  });
})();
