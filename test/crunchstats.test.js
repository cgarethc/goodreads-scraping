'use strict';

var fs = require('fs');
var samplebooks = JSON.parse(fs.readFileSync('test/samplebooks.json', 'utf8')).books;

const crunchstats = require('../lib/crunchstats');

test('sanity', () => {
  expect(samplebooks.length).toBe(90);
});

test('genre', async () => {
  const result = await crunchstats.crunchGenre(samplebooks);
  expect(result['Dystopia'].count).toBe(4);
  expect(result['Dystopia'].books).toEqual(
    [{
      "bookTitle": "Severance",
      "bookAuthor": "Ma, Ling",
      "bookURL": "https://goodreads.com//book/show/36348525-severance",
      "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1507060524l/36348525._SY75_.jpg",
      "dateRead": "2020-11-15T23:00:00.000Z",
      "yearRead": 2020,
      "datePub": 2018,
      "rating": 4
    },
    {
      "bookTitle": "Eve",
      "bookAuthor": "Carey, Anna",
      "bookURL": "https://goodreads.com//book/show/9297774-eve",
      "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1389188190l/9297774._SY75_.jpg",
      "dateRead": "2020-10-06T23:00:00.000Z",
      "yearRead": 2020,
      "datePub": 2011,
      "rating": 2
    },
    {
      "bookTitle": "The Testaments",
      "bookAuthor": "Atwood, Margaret",
      "bookURL": "https://goodreads.com//book/show/42975172-the-testaments",
      "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1549292344l/42975172._SY75_.jpg",
      "dateRead": "2019-12-02T23:00:00.000Z",
      "yearRead": 2019,
      "datePub": 2019,
      "rating": 4
    },
    {
      "bookTitle": "Machines Like Me",
      "bookAuthor": "McEwan, Ian",
      "bookURL": "https://goodreads.com//book/show/42086795-machines-like-me",
      "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1552757135l/42086795._SY75_.jpg",
      "dateRead": "2019-08-06T00:00:00.000Z",
      "yearRead": 2019,
      "datePub": 2019,
      "rating": 4
    }]
  );

  expect(result['Dystopia'].byPubYear[2019].count).toBe(2);

  expect(result['Dystopia'].byPubYear[2018].count).toBe(1);

  expect(result['Dystopia'].byPubYear[2011].count).toBe(1);

});