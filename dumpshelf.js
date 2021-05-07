const cli = require("commander");
const fs = require("fs");

const goodreadsShelf = require("./lib/scrapeshelf").scrape;
const goodreadsBook = require("./lib/scrapebook").scrape;

(async () => {
  cli
    .version("0.0.1")
    .arguments("node whatcaniborrow.js")
    .requiredOption("-u, --user <goodreads user ID>", "User ID")
    .option("-p, --pages <maximum number of pages to scrape>", "Max pages")
    .option("-f, --file <output file>", "File to write to")
    .option("-l, --limit <maximum number of books to scrape>", "Max books")
    .usage("node index.js [-u user]")
    .parse(process.argv);
  
  const books = await goodreadsShelf(`https://www.goodreads.com/review/list/${cli.user}`, 'read', cli.pages && parseInt(cli.pages));

  console.log('Scraping', books.length, 'books');

  const results = [];
  let counter = 0;
  for (let book of books) {
    process.stdout.write(".");
    const metadata = await goodreadsBook(book.bookURL);
    results.push({
      book,
      metadata
    });
    counter++;
    if (cli.limit && counter >= parseInt(cli.limit)) {
      break;
    }
  }

  if (cli.file) {
    fs.writeFileSync(cli.file, JSON.stringify({books: results}), 'utf8');
  }

  console.log('done');
})();