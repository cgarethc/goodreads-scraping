/*
  Examples: 
  node generatestats.js -u 4622353 -d -m stats

*/

const cli = require("commander");
const fs = require('fs');
const admin = require('firebase-admin');
const _ = require('lodash');

const goodreadsShelf = require("./lib/scrapeshelf").scrape;
const goodreadsBook = require("./lib/scrapebook").scrape;
const goodreadsProfile = require("./lib/scrapeprofile").scrape;
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
    .requiredOption("-m, --mode [books|stats|both]", "Mode")
    .usage("node index.js [-u userurl]")
    .parse(process.argv);

  let docRef;

  // profile
  const profile = await goodreadsProfile(`https://www.goodreads.com/user/show/${cli.user}`);
  if (cli.database) {
    const profileRef = db.collection('userstats').doc('profiles');
    let profileData = {};
    const doc = await profileRef.get();
    if (doc.exists) {
      profileData = doc.data();
    } 
    profile.id = cli.user;
    profileData[profile.id] = profile;
    await profileRef.set(profileData);
  }


  let allBooks = [];

  if (cli.mode === 'books' || cli.mode === 'both') {

    const books = await goodreadsShelf(`https://www.goodreads.com/review/list/${cli.user}`, 'read', cli.pages && parseInt(cli.pages));

    console.log('Scraping', books.length, 'books');


    let counter = 0;
    for (let book of books) {
      process.stdout.write(counter % 10 == 0 ? 'x' : '.');
      const metadata = await goodreadsBook(book.bookURL);

      if (metadata) {

        const genres = _.find(metadata, { key: 'Genres' });
        if (genres) {
          const nonFiction = genres.values.find(genreName => 'Nonfiction' === genreName);
          const fiction = genres.values.find(genreName => 'Fiction' === genreName);
          if (nonFiction) {
            book.category = 'Nonfiction';
            if (fiction) {
              console.log('WARN Shelved as fiction and non-fiction', book.bookURL);
            }
          }
          else {
            if (fiction) {
              book.category = 'Fiction';
            }
            else {
              console.log('WARN Not shelved as fiction or non-fiction', book.bookURL);
              book.category = 'Unknown'
            }
          }

        }
        else {
          console.log('WARN No genres for', book.bookURL);
        }


        allBooks.push({
          book,
          metadata
        });
      }
      else {
        console.log('WARN no metatdata, not adding', book.bookURL);
      }
      counter++;
      if (cli.limit && counter >= parseInt(cli.limit)) {
        break;
      }
    }

    // console.log(JSON.stringify(allBooks));

    if (cli.database) {
      let docRef = db.collection('userstats').doc(`${cli.user}-books`);
      await docRef.set(
        { books: allBooks }
      );
    }
  }
  else {
    let docRef = db.collection('userstats').doc(`${cli.user}-books`);
    const result = await docRef.get();
    allBooks = result.data().books;
    console.log(allBooks.length, 'books');
  }

  if (cli.mode === 'both' || cli.mode === 'stats') {
    console.log('Running stats');

    const genre = await crunchstats.crunchGenre(allBooks);
    const setting = await crunchstats.crunchSetting(allBooks, true);
    const yearRead = await crunchstats.countByBookProperty(allBooks, 'yearRead');
    const yearPublished = await crunchstats.countByBookProperty(allBooks, 'datePub');
    const category = await crunchstats.countByCategoryAndYear(allBooks);
    const author = await crunchstats.countByAuthorAndYear(allBooks);

    const userStats = {
      id: cli.user,
      summary: { yearRead, yearPublished, category, author },
      genre,
      setting
    }

    if (cli.file) {
      fs.writeFileSync(cli.file, JSON.stringify(userStats), 'utf8');
    }

    if (cli.database) {
      docRef = db.collection('userstats').doc(`${cli.user}-genre`);
      await docRef.set(genre);
      docRef = db.collection('userstats').doc(`${cli.user}-setting`);
      await docRef.set(setting);
      docRef = db.collection('userstats').doc(`${cli.user}-yearRead`);
      await docRef.set(yearRead);
      docRef = db.collection('userstats').doc(`${cli.user}-yearPublished`);
      await docRef.set(yearPublished);
      docRef = db.collection('userstats').doc(`${cli.user}-category`);
      await docRef.set(category);
      docRef = db.collection('userstats').doc(`${cli.user}-author`);
      await docRef.set(author);
    }
  }

  console.log('Done');
})();