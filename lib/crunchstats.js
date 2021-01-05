'use strict';

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
            books: [book.book]
          });
        }
      }
    }
  }

  return genreMap;

};