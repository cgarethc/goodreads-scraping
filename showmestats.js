const cli = require("commander");

const goodreadsShelf = require("./lib/scrapeshelf").scrape;
const goodreadsBook = require("./lib/scrapebook").scrape;


(async () => {
  cli
    .version("0.0.1")
    .arguments("node whatcaniborrow.js")
    .requiredOption("-u, --user <goodreads user URL>", "User URL")
    .option("-p, --pages <maximum number of pages to scrape>", "Max pages")
    .usage("node index.js [-u userurl]")
    .parse(process.argv);
  const books = await goodreadsShelf(cli.user, 'read', cli.pages && parseInt(cli.pages));
  
  console.log('Scraping', books.length, 'books');

  const results = [];
  for (let book of books) {
    process.stdout.write(".");
    const metadata = await goodreadsBook(book.bookURL);
    results.push({
      book,
      metadata
    });
  }

  console.log('\n', JSON.stringify(results));
})();