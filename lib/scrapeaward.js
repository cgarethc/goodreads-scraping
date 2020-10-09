const $ = require("cheerio");
const request = require("superagent");

const utils = require('./utils');

exports.scrape = async (url, filter, maxPages) => {
  
  const titles = [];
  let pageCounter = 1;
  let morePages = true;
  while (morePages) {
    const response = await request.get(url).set("Content-Type", "text/html").query({ page: pageCounter });
    const html = response.text;

    const bookElements = $('[itemtype="http://schema.org/Book"]', html);

    for (let [key, book] of Object.entries(bookElements)) {
      if (book.type === "tag") {
        const titleSpan = $("a.bookTitle > span", book)["0"];
        const bookTitle = titleSpan.children[0].data;
        const bookURL = `https://goodreads.com${
          $("a.bookTitle", book)["0"].attribs["href"]
          }`;
        const bookAuthor = $('span[itemprop="author"] > div > a > span', book)["0"]
          .children[0].data;
        const awardType = $("td > i", book)["0"].children[0].data;
        const bookCover = $('img.bookCover', book)['0'].attribs['src'];

        let addIt = true;

        if (filter) {
          if (!awardType.match(filter)) {
            addIt = false;
          }
        }

        if (addIt) {
          titles.push({
            bookTitle: utils.sanitiseTitle(bookTitle),
            bookAuthor,
            awardType,
            bookURL,
            bookCover
          });
        }
      }
    }

    const nextPage = $("a.next_page", html);
    if (nextPage["0"]) {
      pageCounter++;
      process.stdout.write('.');
      if(maxPages && pageCounter > maxPages){
        morePages = false;
      }
    }
    else {
      morePages = false;
    }
  }

  return titles;
};


