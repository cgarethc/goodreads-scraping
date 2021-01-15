'use strict';

const { assert } = require('console');
var fs = require('fs');
var samplebooks = JSON.parse(fs.readFileSync('test/samplebooks.json', 'utf8')).books;

const crunchstats = require('../lib/crunchstats');

test('sanity', () => {
  expect(samplebooks.length).toBe(90);
});

test('genre', async () => {
  const result = await crunchstats.crunchGenre(samplebooks);
  expect(result['Dystopia'].count).toBe(4);

  expect(result['Dystopia'].byPubYear[2019].count).toBe(2);
  expect(result['Dystopia'].byPubYear[2019].urls).toEqual([ "https://goodreads.com//book/show/42975172-the-testaments", "https://goodreads.com//book/show/42086795-machines-like-me"]);
  

  expect(result['Dystopia'].byPubYear[2018].count).toBe(1);
  expect(result['Dystopia'].byPubYear[2018].urls).toEqual(["https://goodreads.com//book/show/36348525-severance"]);

  expect(result['Dystopia'].byPubYear[2011].count).toBe(1);
  expect(result['Dystopia'].byPubYear[2011].urls).toEqual(["https://goodreads.com//book/show/9297774-eve"]);

});

test('years', async () => {
  const result = await crunchstats.allYearsRead(samplebooks);
  expect(result.length).toBe(3);
  expect(result).toEqual([2019,2020,2021]);
});

test('bookproperty', async () => {
  const result = await crunchstats.countByBookProperty(samplebooks, 'yearRead');
  expect(result).toEqual({2019: 21, 2020: 65, 2021: 1});
});