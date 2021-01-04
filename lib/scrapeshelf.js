const $ = require("cheerio");
const request = require("superagent");
const { DateTime } = require('luxon');

const utils = require('./utils');

exports.scrape = async (url, shelf, maxPages) => {

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
        const bookURL = `https://goodreads.com/${titleSpan.attribs['href']
          }`;
        const bookAuthor = $("td.author > div > a", book)["0"].children[0].data;
        const bookCover = $('img', book)['0'].attribs['src'];

        let dateRead, rating;

        const dateReadSpan = $('span.date_read_value', book)['0'];
        if (dateReadSpan) {
          const dateReadText = dateReadSpan.children[0].data;
          dateRead = DateTime.fromFormat(dateReadText, 'LLL dd, yyyy').toString();
        }

        const starsSpan = $('span.staticStars', book)['0'];
        if (starsSpan) {
          const starsText = starsSpan.attribs['title'];
          const ratingMap = {
            'it was amazing': 5,
            'really liked it': 4,
            'liked it': 3,
            'it was ok': 2,
            'did not like it': 1
          };
          rating = ratingMap[starsText];
        }

        titles.push({
          bookTitle: utils.sanitiseTitle(bookTitle),
          bookAuthor,
          bookURL,
          bookCover,
          dateRead,
          rating
        });

      }
    }

    const nextPage = $("a.next_page", html);
    if (nextPage["0"] && (!maxPages || pageCounter <= maxPages)) {
      pageCounter++;
      process.stdout.write('.');
    }
    else {
      morePages = false;
    }
  }

  return titles;
};


