const cli = require("commander");

const library = require("./lib/scrapelibrary").search;
const goodreadsList = require("./lib/scrapelist").scrape;
const goodreadsAward = require("./lib/scrapeaward").scrape;

(async () => {
  cli
    .version("0.0.1")
    .arguments("node index.js")
    .option("-l, --list <goodreads list URL>", "List URL")
    .option("-a, --award <goodreads award URL>", "Award URL")
    .option("-f, --filter <filter for goodreads award type>", "Award filter")
    .option("-p, --pages <maximum number of pages to scrape>", "Max pages")
    .usage("node index.js [-l listurl]|[-a awardurl]")
    .parse(process.argv);
  let titles;
  if (cli.list) {
    titles = await goodreadsList(cli.list, cli.pages);
  } else if (cli.award) {
    titles = await goodreadsAward(cli.award, cli.filter, cli.pages);
  } else {
    console.error(cli.helpInformation());
    process.exit(2);
  }

  console.log("Searching for", titles.length, "titles at the library");
  (await titles).forEach(async (title) => {
    const results = await library(title.bookAuthor, title.bookTitle);    
    results.forEach((result) => {
      const formattedResult = `${result.type} ${title.awardType?title.awardType:''} "${result.title}" by ${result.author}\n${title.bookURL}\n${result.url}`;
      console.log(formattedResult, '\n');
    });
  });
})();
