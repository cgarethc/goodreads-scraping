const cli = require("commander");

const library = require("./scrapelibrary").search;
const goodreadsList = require("./scrapelist").scrape;
const goodreadsAward = require("./scrapeaward").scrape;

(async () => {
  cli
    .version("0.0.1")
    .arguments("node index.js")
    .option("-l, --list <goodreads list URL>", "List URL")
    .option("-a, --award <goodreads award URL>", "Award URL")
    .usage("node index.js [-l listurl]|[-a awardurl]")
    .parse(process.argv);
  let titles;
  if (cli.list) {
    titles = await goodreadsList(cli.list);
  } else if (cli.award) {
    titles = await goodreadsAward(cli.award);
  } else {
    console.error(cli.helpInformation());
    process.exit(2);
  }

  console.log("Searching for", titles.length, "titles at the library");
  (await titles).forEach(async (title) => {
    const results = await library(title.bookAuthor, title.bookTitle);
    results.forEach((result) => {
      console.log(result.title, result.author, result.type);
    });
  });
})();
