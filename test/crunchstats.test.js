const samplebooks = require('./samplebooks').samplebooks;
const crunchstats = require('../lib/crunchstats');

test('sanity', () => {
  expect(samplebooks.length).toBe(60);
});

test('genre', async () => {
  const result = await crunchstats.crunchGenre(samplebooks);
  expect(result.get('Food').count).toBe(3);
  expect(result.get('Food').books).toEqual(
    [
      {
        "bookAuthor": "Cate, Martin",
        "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1454296157l/27208950._SX50_.jpg",
        "bookTitle": "Smuggler's Cove: Exotic Cocktails, Rum, and the Cult of Tiki",
        "bookURL": "https://goodreads.com//book/show/27208950-smuggler-s-cove",
        "datePub": "2016-06-07T00:00:00.000+12:00",
        "dateRead": "2020-12-15T00:00:00.000+13:00",
        "rating": 5
      },
      {
        "bookAuthor": "Lanchester, John",
        "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1312009160l/169510._SX50_.jpg",
        "bookTitle": "The Debt to Pleasure",
        "bookURL": "https://goodreads.com//book/show/169510.The_Debt_to_Pleasure",
        "datePub": "Invalid DateTime",
        "dateRead": "2020-08-28T00:00:00.000+12:00",
        "rating": 4
      },

      {
        "bookAuthor": "Nosrat, Samin",
        "bookCover": "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1493587329l/35019164._SX50_.jpg",
        "bookTitle": "Salt, Fat, Acid, Heat: Mastering the Elements of Good Cooking",
        "bookURL": "https://goodreads.com//book/show/35019164-salt-fat-acid-heat",
        "datePub": "2017-04-25T00:00:00.000+12:00",
        "dateRead": "2020-06-13T00:00:00.000+12:00",
        "rating": 5
      }
    ]
  );
})