const cli = require("commander");

const fs = require("fs");
const $ = require("cheerio");
const request = require("superagent");

exports.scrape = async (url) => {
  const titles = [];
  let pageCounter = 1;
  let morePages = true;
  while (morePages) {
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
        const bookURL = `https://goodreads.com/${
          $("a.bookTitle", book)["0"].attribs["href"]
        }`;
        const bookAuthor = $('span[itemprop="author"] > div > a > span', book)[
          "0"
        ].children[0].data;
        titles.push({
          bookTitle,
          bookAuthor,
          bookURL,
        });
      }
    }

    const nextPage = $("#all_votes > div.pagination > a.next_page", html);
    if (nextPage["0"]) {
      pageCounter++;
      process.stdout.write(".");
    } else {
      morePages = false;
    }
  }

  return titles;
};
