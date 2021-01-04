const scrapebook = require('./lib/scrapebook');

(async () => {
  console.log(
    await scrapebook.scrape('https://www.goodreads.com/book/show/34066798-a-gentleman-in-moscow')
  );
})();