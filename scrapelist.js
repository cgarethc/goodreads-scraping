const cli = require("commander");

const fs = require("fs");
const $ = require("cheerio");
const request = require("superagent");

exports.scrape = async (url) => {
  const titles = [];
  let pageCounter = 1;
  let morePages = true;
  while (morePages) {
    const response = await request.get(url).set("Content-Type", "text/html").query({page:pageCounter});
    const html = response.text;

    const titleElements = $(
      "#all_votes > table > tbody > tr > td:nth-child(3) > a > span",
      html
    );
    for (let [key, title] of Object.entries(titleElements)) {
      if (title.children && title.children[0]) {
        const bookTitle = title.children[0].data;
        const bookAuthor = $('a[class="authorName"]', title.parent.parent)["0"]
          .children[0].children[0].data;

        titles.push({
          bookTitle,
          bookAuthor,
        });
      }
    }
    const nextPage = $("#all_votes > div.pagination > a.next_page", html);
    if (nextPage["0"]) {
        pageCounter++;
    }
    else{
        morePages = false;
    }
  }

  return titles;
};


