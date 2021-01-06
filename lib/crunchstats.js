'use strict';

const _ = require('lodash');

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
            byPubYear: new Map()
          };
        }
      }
    }
  }

  // do grouping by pub year
  // for (let [genreName, genreBooks] of genreMap.entries()) {
  _.forOwn(genreMap, function (genreBooks, genreName) {

    const groupedByPubYear = _.groupBy(genreBooks.books, 'datePub');
    _.forOwn(groupedByPubYear, function (books, pubYear) {
      genreMap[genreName].byPubYear[parseInt(pubYear)] =
      {
        books: books,
        count: books.length
      };
    });

  });

  return genreMap;

};