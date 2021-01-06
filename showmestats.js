const cli = require("commander");
const fs = require('fs');
const admin = require('firebase-admin');

const goodreadsShelf = require("./lib/scrapeshelf").scrape;
const goodreadsBook = require("./lib/scrapebook").scrape;
const crunchstats = require('./lib/crunchstats');

const serviceAccount = require('./what-can-i-borrow-firebase-adminsdk-8nxq2-60dfb93da5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://what-can-i-borrow.firebaseio.com"
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });


(async () => {
  cli
    .version("0.0.1")
    .arguments("node whatcaniborrow.js")
    .requiredOption("-u, --user <goodreads user ID>", "User ID")
    .option("-p, --pages <maximum number of pages to scrape>", "Max pages")
    .option("-l, --limit <maximum number of books to scrape>", "Max books")
    .option("-f, --file <output file>", "File to write to")
    .option("-d, --database", "Write to Firebase")
    .usage("node index.js [-u userurl]")
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

  const genre = await crunchstats.crunchGenre(results);
  const userStats = {
    id: cli.user,
    genre
  }

  if (cli.file) {
    fs.writeFileSync(cli.file, JSON.stringify(userStats), 'utf8');
  }

  if (cli.database) {
    let docRef = db.collection('userstats').doc(cli.user);
    await docRef.set(userStats);
  }

  console.log('Done');
})();