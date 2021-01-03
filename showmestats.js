const cli = require("commander");

const goodreadsShelf = require("./lib/scrapeshelf").scrape;


(async () => {
  cli
    .version("0.0.1")
    .arguments("node whatcaniborrow.js")
    .requiredOption("-u, --user <goodreads user URL>", "User URL")
    .option("-p, --pages <maximum number of pages to scrape>", "Max pages")
    .usage("node index.js [-u userurl]")
    .parse(process.argv);
  const titles = await goodreadsShelf(cli.user, 'read', cli.pages && parseInt(cli.pages));

  for (let title of titles) {
    console.log(title);
  }
})();