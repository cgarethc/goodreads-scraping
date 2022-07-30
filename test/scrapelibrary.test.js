const cleanAuthor = require('../lib/scrapelibrary').cleanAuthor;

test('clean author', () => {
  expect(cleanAuthor('Doe, John')).toBe('Doe, John');
  expect(cleanAuthor('Luiselli, Valeria, 1983-')).toBe('Luiselli, Valeria');
  expect(cleanAuthor('Luiselli, Valeria, 1983- author, narrator.')).toBe('Luiselli, Valeria');
  expect(cleanAuthor('Hamid, Mohsin, 1971-')).toBe('Hamid, Mohsin');
  expect(cleanAuthor('Doerr, Anthony, 1973- author.')).toBe('Doerr, Anthony');
  
});