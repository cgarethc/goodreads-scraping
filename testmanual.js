const fs = require("fs");
const $ = require("cheerio");
const scrapewelly = require('./lib/scrapewellylibrary.js');
const consolidate = require('./lib/consolidatelibrary').consolidate;

async function parseList() {
  const html = fs.readFileSync("examples/costa.htm").toString();

  const bookElements = $('[itemtype="http://schema.org/Book"]', html);

  for (let [key, book] of Object.entries(bookElements)) {
    if (book.type === "tag") {
      const titleSpan = $("a.bookTitle > span", book)["0"];
      const title = titleSpan.children[0].data;
      const url = `https://goodreads.com/${$("a.bookTitle", book)["0"].attribs["href"]
        }`;
      const author = $('span[itemprop="author"] > div > a > span', book)["0"]
        .children[0].data;
      const bookCover = $('img.bookCover', book)['0'].attribs['src'];
      console.log(title, url, author, bookCover);
    }
  }
}

async function parseAward() {
  const html = fs.readFileSync("examples/whitbreadaward.htm").toString();

  const bookElements = $('[itemtype="http://schema.org/Book"]', html);

  for (let [key, book] of Object.entries(bookElements)) {
    if (book.type === "tag") {
      const titleSpan = $("a.bookTitle > span", book)["0"];
      const title = titleSpan.children[0].data;
      const url = `https://goodreads.com/${$("a.bookTitle", book)["0"].attribs["href"]
        }`;
      const author = $('span[itemprop="author"] > div > a > span', book)["0"]
        .children[0].data;
      const awardType = $("td > i", book)["0"].children[0].data;
      const bookCover = $('img.bookCover', book)['0'].attribs['src'];
      console.log(title, url, author, awardType, bookCover);
    }
  }
}

async function parseShelf() {
  const html = fs.readFileSync("examples/5star.htm").toString();

  const bookElements = $('#booksBody > tr', html);

  for (let [key, book] of Object.entries(bookElements)) {
    if (book.type === "tag") {
      const titleSpan = $("td.title > div > a", book)["0"];
      const title = titleSpan.attribs['title'];
      const url = `https://goodreads.com/${titleSpan.attribs['href']
        }`;
      const author = $("td.author > div > a", book)["0"].children[0].data;
      const bookCover = $('img', book)['0'].attribs['src'];
      console.log(title, url, author, bookCover);
    }
  }
}

async function parseLibrary() {
  const html = fs.readFileSync("examples/aucklandsearch3.htm").toString();
  const searchResults = [];

  const titleElements = $("div.dpBibTitle", html);


  for (let counter = 0; counter < titleElements.length; counter++) {
    process.stdout.write('.');
    const bookElement = titleElements[String(counter)];
    const title = $('span.title > a', bookElement)['0'].children[0].data.trim().replace(' [electronic resource]', '');
    const url = `https://discover.aucklandlibraries.govt.nz${$('span.title > a', bookElement)['0'].attribs['href']}`;
    const authorElement = $('div.dpBibAuthor > a', bookElement)['0'];
    let author;
    if (authorElement) {
      author = authorElement.children[0].data.trim();
    }
    else {
      console.error('\n*** Could not find author for ', title, url, '\n');
    }
    const resourceType = $('div > span.itemMediaDescription', bookElement)['0'].children[0].data;
    const notAvailableElement = $('span.itemsNotAvailable', bookElement)['0'];

    searchResults.push({
      title,
      author,
      type: resourceType,
      url,
      available: !notAvailableElement
    });
  }

  console.log(JSON.stringify(searchResults));
  return searchResults;
}

async function parseWelly() {
  scrapewelly.search('Evaristo, Bernardine', 'Girl, woman, other');
}

(async () => {
  const chrono = require('chrono-node');
  console.log(chrono.parseDate('Dec 15, 2020').getFullYear());
})();
