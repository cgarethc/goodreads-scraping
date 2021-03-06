'use strict';

const admin = require('firebase-admin');
const cli = require("commander");
const auckland = require("./lib/scrapelibrary").search;
const wellington = require("./lib/scrapewellylibrary").search;
const goodreadsList = require("./lib/scrapelist").scrape;
const goodreadsAward = require("./lib/scrapeaward").scrape;
const consolidate = require('./lib/consolidatelibrary').consolidate;

const serviceAccount = require('./what-can-i-borrow-firebase-adminsdk-8nxq2-60dfb93da5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://what-can-i-borrow.firebaseio.com"
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const scrape = async (searchFunction, dbList, titles, dbConsolidatedList) => {
  const allResults = [];
  let consolidatedResults = [];

  console.log("Searching for", titles.length, "titles at the library");
  let titleCounter = 1;
  for (let title of titles) {
    console.log(`Title ${titleCounter++} "${title.bookTitle}" by ${title.bookAuthor}`);
    const results = await searchFunction(title.bookAuthor, title.bookTitle);
    results.forEach((result) => {
      const formattedResult = `${result.type} ${title.awardType ? title.awardType : ''} "${result.title}" by ${result.author}\n${title.bookURL}\n${result.url}`;
      console.log(formattedResult, '\n');
      const resultDoc = {
        itemType: result.type, awardType: title.awardType, title: result.title, author: result.author,
        goodreadsURL: title.bookURL, libraryURL: result.url, coverURL: title.bookCover, editions: result.editions
      }
      allResults.push(resultDoc);
    });

    consolidatedResults = consolidatedResults.concat(await consolidate(results, title.awardType, title.bookURL, title.bookCover));

  }

  console.log('Finished searching, adding to database');


  let docRef = db.collection(dbList).doc(cli.id);
  await docRef.set({ id: cli.id, name: cli.name, type: cli.type, books: allResults });

  if (dbConsolidatedList) {
    docRef = db.collection(dbConsolidatedList).doc(cli.id);
    await docRef.set({ id: cli.id, name: cli.name, type: cli.type, books: consolidatedResults });
  }

  return allResults;
}

(async () => {
  cli
    .version("0.0.1")
    .arguments("node index.js")
    .option("-l, --list <goodreads list URL>", "List URL")
    .option("-a, --award <goodreads award URL>", "Award URL")
    .option("-f, --filter <filter for goodreads award type>", "Award filter")
    .option("-p, --pages <maximum number of pages to scrape>", "Max pages")
    .option("-c, --place <Wellington|Auckland>", "Library (defaults to both)")
    .requiredOption("-i, --id <id for the list>", "ID")
    .requiredOption("-n, --name <friendly name for the list>", "Name")
    .requiredOption("-t, --type <friendly name for the type of list>", "Type")
    .usage("node index.js [-l listurl]|[-a awardurl] -i <id for list> -n <name for list> -t <type>")
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


  if (!cli.place || cli.place === 'Wellington') {
    console.log('Searching Wellington')
    scrape(wellington, 'welly', titles, 'wellington');
  }
  if (!cli.place || cli.place === 'Auckland') {
    console.log('Searching Auckland');
    scrape(auckland, 'lists', titles, 'auckland');
  }

})();
