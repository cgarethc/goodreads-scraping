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

/**
 * Add separate entries for parent settings where they are not already in the list. E.g. if a book has
 * "London, England" but not "England", then add England
 * 
 * @param {*} bookdata 
 */
exports.improveSettings = async (bookdata) => {
  for (let book of bookdata) {
    const metadata = book.metadata;
    const values = metadata.filter(data => data.key === 'Setting');
    if (values && values.length) {
      const settingsList = values[0].values;
      for (let value of values[0].values) {
        if (value.includes(',')) {
          const locations = value.split(', ');
          const location = locations[locations.length - 1];
          if (!settingsList.includes(location)) {
            settingsList.push(location);
          }
        }
      }
    }
  }
}

const crunch = async (bookdata, metadataKey) => {

  const map = {};

  for (let book of bookdata) {
    const metadata = book.metadata;
    const values = metadata.filter(data => data.key === metadataKey);
    if (values && values.length) {
      for (let value of values[0].values) {
        if (map[value]) {
          const currentEntry = map[value];
          currentEntry.count++;
          currentEntry.books.push(
            book.book
          );
        }
        else {
          map[value] = {
            count: 1,
            books: [book.book],
            byReadYear: {}
          };
        }
      }
    }
  }

  addGrouping(map, 'yearRead', 'byReadYear');

  _.forOwn(map, (mapKey) => {
    delete mapKey.books
  });


  return map;

};

exports.crunchGenre = async (bookdata) => {
  return crunch(bookdata, 'Genres');
}

exports.crunchSetting = async (bookdata) => {
  return crunch(bookdata, 'Setting');
}

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
exports.countByBookProperty = async (bookdata, property) => {
  return _(bookdata).filter(book => book.book[property]).countBy(`book.${property}`).value();
}

exports.countByCategoryAndYear = async (bookdata) => {
  const result = _(bookdata).filter(book => book.book.yearRead).groupBy('book.yearRead').value();
  const summary = {};
  _.forOwn(result, (books, year) => {
    summary[year] = _.countBy(books, 'book.category');
  });
  return summary;
};

exports.countByAuthorAndYear = async (bookdata) => {
  const result = _(bookdata).filter(book => book.book.bookAuthor).groupBy('book.bookAuthor').value();
  const summary = {};
  _.forOwn(result, (books, author) => {
    summary[author] = _(books).countBy('book.yearRead').value();
    summary[author].total = books.length;
  });
  return summary;
};