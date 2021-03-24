const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const _ = require('lodash');

/**
 * 
 * @param {*} path path to the CSV file
 * @param {*} filter JS object filter with key for CSV column name and value to filter on
 */
exports.parse = async (path, filter) => {
  const data = fs.readFileSync(path);
  let records = parse(data, {
    columns: true,
    skip_empty_lines: true
  });
  if (filter) {
    records = _.filter(records, filter);
  }
  const titles = records.map((record) => {
    return {
      bookTitle: record.Title,
      bookAuthor: record.Author,
      bookURL: `https://www.goodreads.com/book/show/${record['Book Id']}`,
      datePub: record['Original Publication Year'],
      rating: record['Average Rating']
    };
  })
  console.log(records.length, 'books');
  return titles;

}