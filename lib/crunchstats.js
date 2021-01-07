'use strict';

const _ = require('lodash');

function addGrouping(map, metadataFieldName, groupName) {
  _.forOwn(map, function (genreBooks, genreName) {

    const grouped = _.groupBy(genreBooks.books, metadataFieldName);    
    _.forOwn(grouped, function (books, key) {
      map[genreName][groupName][key] =
      {
        books: books,
        count: books.length
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
            byPubYear: {}
          };
        }
      }
    }
  }

  addGrouping(genreMap, 'datePub', 'byPubYear');

  return genreMap;

};