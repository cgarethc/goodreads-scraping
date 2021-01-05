const samplebooks = require('./samplebooks').samplebooks;
const crunchstats = require('../lib/crunchstats');

test('sanity', () => {
  expect(samplebooks.length).toBe(90);
});

test('genre', async () => {
  const result = await crunchstats.crunchGenre(samplebooks);
  expect(result.get('Dystopia').count).toBe(4);
  expect(result.get('Dystopia').books).toEqual(
    [
      { "bookTitle": "Severance", "bookAuthor": "Ma, Ling", "bookURL": "https://goodreads.com//book/show/36348525-severance", "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1507060524l/36348525._SY75_.jpg", "dateRead": "2020-11-16T00:00:00.000+13:00", "datePub": 2018, "rating": 4 },
      { "bookTitle": "Eve", "bookAuthor": "Carey, Anna", "bookURL": "https://goodreads.com//book/show/9297774-eve", "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1389188190l/9297774._SY75_.jpg", "dateRead": "2020-10-07T00:00:00.000+13:00", "datePub": 2011, "rating": 2 },
      { "bookTitle": "The Testaments", "bookAuthor": "Atwood, Margaret", "bookURL": "https://goodreads.com//book/show/42975172-the-testaments", "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1549292344l/42975172._SY75_.jpg", "dateRead": "2019-12-03T00:00:00.000+13:00", "datePub": 2019, "rating": 4 },
      { "bookTitle": "Machines Like Me", "bookAuthor": "McEwan, Ian", "bookURL": "https://goodreads.com//book/show/42086795-machines-like-me", "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1552757135l/42086795._SY75_.jpg", "dateRead": "2019-08-06T00:00:00.000+12:00", "datePub": 2019, "rating": 4 }]
  );
})