'use strict';

var fs = require('fs');
var samplebooks = JSON.parse(fs.readFileSync('test/samplebooks.json', 'utf8')).books;

const crunchstats = require('../lib/crunchstats');

test('sanity', () => {
  expect(samplebooks.length).toBe(120);
});

test('genre', async () => {
  const result = await crunchstats.crunchGenre(samplebooks);
  expect(result['Dystopia'].count).toBe(5);

  expect(result['Dystopia'].byPubYear[2019].count).toBe(2);
  expect(result['Dystopia'].byPubYear[2019].urls).toEqual(["https://goodreads.com//book/show/42975172-the-testaments", "https://goodreads.com//book/show/42086795-machines-like-me"]);


  expect(result['Dystopia'].byPubYear[2018].count).toBe(1);
  expect(result['Dystopia'].byPubYear[2018].urls).toEqual(["https://goodreads.com//book/show/36348525-severance"]);

  expect(result['Dystopia'].byPubYear[2011].count).toBe(1);
  expect(result['Dystopia'].byPubYear[2011].urls).toEqual(["https://goodreads.com//book/show/9297774-eve"]);

  expect(result['Dystopia'].byPubYear[2015].count).toBe(1);
  expect(result['Dystopia'].byPubYear[2015].urls).toEqual(["https://goodreads.com//book/show/25499718-children-of-time"]);

});

test('years', async () => {
  const result = await crunchstats.allYearsRead(samplebooks);
  expect(result.length).toBe(3);
  expect(result).toEqual([2019, 2020, 2021]);
});

test('bookproperty', async () => {
  const result = await crunchstats.countByBookProperty(samplebooks, 'yearRead');
  expect(result).toEqual({ 2019: 48, 2020: 66, 2021: 3 });
});

test('category', async () => {
  const result = await crunchstats.countByCategoryAndYear(samplebooks);
  expect(result).toEqual({ "2019": { "Unknown": 3, "Nonfiction": 9, "Fiction": 36 }, "2020": { "Nonfiction": 16, "Fiction": 47, "Unknown": 3 }, "2021": { "Nonfiction": 1, "Fiction": 2 } })
});