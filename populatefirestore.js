'use strict';

const fs = require('fs');
const admin = require('firebase-admin');
const cli = require("commander");
const auckland = require("./lib/scrapelibrary").search;
const wellington = require("./lib/scrapewellylibrary").search;
const goodreadsList = require("./lib/scrapelist").scrape;
const goodreadsAward = require("./lib/scrapeaward").scrape;
const consolidate = require('./lib/consolidatelibrary').consolidate;
const aws = require('aws-sdk');

const serviceAccount = require('./what-can-i-borrow-firebase-adminsdk-8nxq2-60dfb93da5.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://what-can-i-borrow.firebaseio.com"
});
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const scrape = async (searchFunction, listId, listName, listType, dbList, titles, dbConsolidatedList) => {
  const allResults = [];
  let consolidatedResults = [];

  console.log("Searching for", titles.length, "titles at the library", dbList, dbConsolidatedList);
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
  try {

    let docRef = db.collection(dbList).doc(listId);
    await docRef.set({ id: listId, name: listName, type: listType, books: allResults });

    if (dbConsolidatedList) {
      docRef = db.collection(dbConsolidatedList).doc(listId);
      await docRef.set({ id: listId, name: listName, type: listType, books: consolidatedResults });
    }
  } catch (dbError) {
    console.error('Failed to write to database', dbError);
  }

  return allResults;
}

(async () => {
  cli
    .version("0.0.1")
    .arguments("node index.js")
    .option("-f, --inputfile <path to file>", "JSON file containing list, award, filter, id, name, type records")
    .option("-e, --env", "the LISTDEF environment variable contains the name of JSON file to read")
    .option("-l, --list <goodreads list URL>", "List URL")
    .option("-a, --award <goodreads award URL>", "Award URL")
    .option("-f, --filter <filter for goodreads award type>", "Award filter")
    .option("-p, --pages <maximum number of pages to scrape>", "Max pages")
    .option("-c, --place <Wellington|Auckland>", "Library (defaults to both)")
    .option("-i, --id <id for the list>", "ID")
    .option("-n, --name <friendly name for the list>", "Name")
    .option("-t, --type <friendly name for the type of list>", "Type")
    .usage("node index.js [-l listurl]|[-a awardurl] -i <id for list> -n <name for list> -t <type>")
    .parse(process.argv);

  if (cli.inputfile || process.env['LISTDEF']) {
    let filename;
    if (cli.inputfile) {
      filename = cli.inputfile;
    }
    else {
      filename = process.env['LISTDEF'];
    }
    console.log('Using file', filename);

    let listDefinitions;

    try {
      if (filename.startsWith('s3://')) {
        console.log("reading from S3 bucket");
        const s3 = new aws.S3({region: 'us-west-2'});
        var getParams = {
          Bucket: 'wcib-list-definitions',
          Key: filename.substring(5)
        }

        const data = await s3.getObject(getParams).promise();
        listDefinitions = JSON.parse(data.Body.toString('utf-8'));
      }
      else {
        listDefinitions = JSON.parse(fs.readFileSync(filename, 'utf8'));
      }
    }
    catch (err) {
      console.error('Failed to retrieve and parse the list definition', err);
    }

    if (listDefinitions) {
      for (let definition of listDefinitions.lists) {
        let titles;
        console.log('Processing', definition.url, definition.name, definition.id);
        if (definition.url.includes('/list/')) {
          titles = await goodreadsList(definition.url, definition.pages);
        }
        else if (definition.url.includes('/award/')) {
          titles = await goodreadsAward(definition.url, definition.filter, definition.pages);
        }
        else {
          console.error('URL not recognised', definition.url);
        }
        console.log('Searching Wellington')
        scrape(wellington, definition.id, definition.name, definition.type, 'welly', titles, 'wellington');
        console.log('Searching Auckland');
        scrape(auckland, definition.id, definition.name, definition.type, 'lists', titles, 'auckland');
      }
    }
    else{
      throw new Error('No list definitions to process');
    }
  }
  else {
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
      scrape(wellington, cli.id, cli.name, cli.type, 'welly', titles, 'wellington');
    }
    if (!cli.place || cli.place === 'Auckland') {
      console.log('Searching Auckland');
      scrape(auckland, cli.id, cli.name, cli.type, 'lists', titles, 'auckland');
    }
  }


})();
