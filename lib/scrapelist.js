const $ = require("cheerio").default;
const request = require("superagent");

const utils = require('./utils');

exports.scrape = async (url, maxPages) => {

  const titles = [];
  let pageCounter = 1;
  let morePages = true;
  while (morePages) {
    try {
      const response = await request
        .get(url)
        .set("Content-Type", "text/html")
        .query({ page: pageCounter });
      const html = response.text;

      const bookElements = $('[itemtype="http://schema.org/Book"]', html);

      for (let [key, book] of Object.entries(bookElements)) {
        if (book.type === "tag") {
          const titleSpan = $("a.bookTitle > span", book)["0"];
          const bookTitle = titleSpan.children[0].data;
          const bookURL = `https://goodreads.com${$("a.bookTitle", book)["0"].attribs["href"]
            }`;
          const bookAuthor = $('span[itemprop="author"] > div > a > span', book)[
            "0"
          ].children[0].data;
          const bookCover = $('img.bookCover', book)['0'].attribs['src'];

          titles.push({
            bookTitle: utils.sanitiseTitle(bookTitle),
            bookAuthor,
            bookURL,
            bookCover
          });
        }
      }

      const nextPage = $("#all_votes > div.pagination > a.next_page", html);
      if (nextPage["0"]) {
        pageCounter++;
        process.stdout.write(".");
        if (maxPages && pageCounter > maxPages) {
          morePages = false;
        }
      } else {
        morePages = false;
      }
    } catch (err) {
      console.error('Request failed', err);
    }
  }


  return titles;
};
