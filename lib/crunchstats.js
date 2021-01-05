'use strict';

const _ = require('lodash');

exports.crunchGenre = async (bookdata) => {

  const genreMap = new Map();

  for (let book of bookdata) {
    const metadata = book.metadata;
    const genres = metadata.filter(data => data.key === 'Genres');
    if (genres && genres.length) {
      for (let genre of genres[0].values) {
        if (genreMap.has(genre)) {
          const currentEntry = genreMap.get(genre);
          currentEntry.count++;
          currentEntry.books.push(
            book.book
          );
        }
        else {
          genreMap.set(genre, {
            count: 1,
            books: [book.book],
            byPubYear: new Map()
          });
        }
      }
    }
  }

  // do grouping by pub year
  for (let [genreName, genreBooks] of genreMap.entries()) {

    const groupedByPubYear = _.groupBy(genreBooks.books, 'datePub');
    _.forOwn(groupedByPubYear, function (books, pubYear) {
      genreMap.get(genreName).byPubYear.set(
        parseInt(pubYear),
        {
          books: books,
          count: books.length
        }
      );
    });

  }

  return genreMap;

};