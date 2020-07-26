const admin = require('firebase-admin');
const cli = require("commander");
const library = require("./lib/scrapelibrary").search;
const goodreadsList = require("./lib/scrapelist").scrape;
const goodreadsAward = require("./lib/scrapeaward").scrape;

const serviceAccount = require('./what-can-i-borrow-firebase-adminsdk-8nxq2-60dfb93da5.json');

(async () => {
    cli
        .version("0.0.1")
        .arguments("node index.js")
        .option("-l, --list <goodreads list URL>", "List URL")
        .option("-a, --award <goodreads award URL>", "Award URL")
        .option("-f, --filter <filter for goodreads award type>", "Award filter")
        .requiredOption("-i, --id <id for the list>", "ID")
        .usage("node index.js [-l listurl]|[-a awardurl]")
        .parse(process.argv);
    let titles;

    if (cli.list) {
        titles = await goodreadsList(cli.list);
    } else if (cli.award) {
        titles = await goodreadsAward(cli.award, cli.filter);
    } else {
        console.error(cli.helpInformation());
        process.exit(2);
    }

    const allResults = [];

    console.log("Searching for", titles.length, "titles at the library");
    for (title of titles) {
        const results = await library(title.bookAuthor, title.bookTitle);
        results.forEach((result) => {
            const formattedResult = `${result.type} ${title.awardType ? title.awardType : ''} "${result.title}" by ${result.author}\n${title.bookURL}\n${result.url}`;
            console.log(formattedResult, '\n');
            const resultDoc = {
                itemType: result.type, awardType: title.awardType, title: result.title, author: result.author, goodreadsURL: title.bookURL, libraryURL: result.url
            }
            allResults.push(resultDoc);
        });

    }

    console.log('Finished searching, adding to database');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://what-can-i-borrow.firebaseio.com"
    });
    const db = admin.firestore();
    const docRef = db.collection('lists').doc(cli.id);
    await docRef.set({ id: cli.id, books: allResults });
})();
