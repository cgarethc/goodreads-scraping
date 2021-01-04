const scrapebook = require('./lib/scrapebook');

(async () => {
  console.log(
    await scrapebook.scrape('https://goodreads.com//book/show/22875103-the-fishermen')
  );
})();