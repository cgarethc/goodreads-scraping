'use strict';

const auckland = require("./scrapelibrary").search;
const wellington = require("./scrapewellylibrary").search;
const consolidate = require('./consolidatelibrary').consolidate;
const scrapecover = require('./scrapecover').scrape;

exports.process = async (db) => {
  let docRef = db.collection('usertoreads');
  const snapshot = await docRef.get();
  for (let doc of snapshot.docs) { // each user
    const userId = doc.id;
    const books = doc.data().books;
    let consolidatedAucklandResults = [];
    let consolidatedWellingtonResults = [];
    console.log(userId, 'has', books.length, 'books');
    for (let book of books) {
      const aucklandResults = await auckland(book.bookAuthor, book.bookTitle);
      const wellingtonResults = await wellington(book.bookAuthor, book.bookTitle);
      if (aucklandResults.length > 0 || wellingtonResults > 0) {
        const coverURL = await scrapecover(book.bookURL);
        if (aucklandResults.length > 0) {
          consolidatedAucklandResults = consolidatedAucklandResults.concat(await consolidate(aucklandResults, 'To Read', book.bookURL, coverURL));
        }
        if (wellingtonResults.length > 0) {
          consolidatedWellingtonResults = consolidatedWellingtonResults.concat(await consolidate(wellingtonResults, 'To Read', book.bookURL, coverURL));
        }
      }
    }
    let docRef = db.collection('usertoreads').doc(userId);
    await docRef.set({ auckland: consolidatedAucklandResults, wellington: consolidatedWellingtonResults }, { merge: true });
  }
}