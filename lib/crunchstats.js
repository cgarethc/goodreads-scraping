'use strict';

const _ = require('lodash');

function addGrouping(map, metadataFieldName, groupName, keyFunction) {
  _.forOwn(map, function (books, name) {

    const grouped = _.groupBy(books.books, metadataFieldName);
    _.forOwn(grouped, function (books, key) {
      let convertedKey = key;
      if (keyFunction) {
        convertedKey = keyFunction(key);
      }
      map[name][groupName][convertedKey] =
      {
        count: books.length,
        urls: books.map(book => book.bookURL)
      };      
    });

  });
}

exports.crunchGenre = async (bookdata) => {

  const genreMap = {};

  for (let book of bookdata) {
    const metadata = book.metadata;
    const genres = metadata.filter(data => data.key === 'Genres');
    if (genres && genres.length) {
      for (let genre of genres[0].values) {
        if (genreMap[genre]) {
          const currentEntry = genreMap[genre];
          currentEntry.count++;
          currentEntry.books.push(
            book.book
          );
        }
        else {
          genreMap[genre] = {
            count: 1,
            books: [book.book],
            byPubYear: {},
            byReadYear: {}
          };
        }
      }
    }
  }

  addGrouping(genreMap, 'datePub', 'byPubYear');
  addGrouping(genreMap, 'yearRead', 'byReadYear');

  _.forOwn(genreMap, (genre) => {
    delete genre.books
  });


  return genreMap;

};

/**
 * Get the list of all years books are read in
 * @param {*} bookdata 
 */
exports.allYearsRead = async (bookdata) => {
  return _(bookdata).map('book.yearRead').filter(year => year).uniq().sort().value();
};

/**
 * 
 * @param {*} bookdata 
 * @param {*} property a property from the main metadata section on the book, e.g. 'yearRead'
 */
exports.countByBookProperty = async(bookdata, property) => {
  return _(bookdata).filter(book => book.book[property]).countBy(`book.${property}`).value();
}

