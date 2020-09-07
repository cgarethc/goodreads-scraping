const cli = require("commander");
const $ = require("cheerio");
const request = require("superagent");

const utils = require('./utils');

exports.scrape = async (url, shelf) => {

  const titles = [];
  let pageCounter = 1;
  let morePages = true;
  while (morePages) {
    const response = await request
      .get(url)
      .set("Content-Type", "text/html")
      .query({ shelf: shelf, utf8: '✓', per_page: '50', page: pageCounter });
    const html = response.text;

    const bookElements = $('#booksBody > tr', html);

    for (let [key, book] of Object.entries(bookElements)) {
      if (book.type === "tag") {
        const titleSpan = $("td.title > div > a", book)["0"];
        const bookTitle = titleSpan.attribs['title'];
        const bookURL = `https://goodreads.com/${
          titleSpan.attribs['href']
          }`;
        const bookAuthor = $("td.author > div > a", book)["0"].children[0].data;
        const bookCover = $('img', book)['0'].attribs['src'];

        titles.push({
          bookTitle: utils.sanitiseTitle(bookTitle),
          bookAuthor,
          bookURL,
          bookCover
        });

      }
    }

    const nextPage = $("a.next_page", html);
    if (nextPage["0"]) {
      pageCounter++;
      process.stdout.write('.');
    }
    else {
      morePages = false;
    }
  }

  return titles;
};


