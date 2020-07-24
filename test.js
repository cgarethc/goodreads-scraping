const fs = require("fs");
const $ = require("cheerio");

async function parseList() {
  const html = fs.readFileSync("examples/costa.htm").toString();

  const bookElements = $('[itemtype="http://schema.org/Book"]', html);

  for (let [key, book] of Object.entries(bookElements)) {
    if (book.type === "tag") {
      const titleSpan = $("a.bookTitle > span", book)["0"];
      const title = titleSpan.children[0].data;
      const url = `https://goodreads.com/${
        $("a.bookTitle", book)["0"].attribs["href"]
        }`;
      const author = $('span[itemprop="author"] > div > a > span', book)["0"]
        .children[0].data;
      console.log(title, url, author);
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
      const url = `https://goodreads.com/${
        $("a.bookTitle", book)["0"].attribs["href"]
        }`;
      const author = $('span[itemprop="author"] > div > a > span', book)["0"]
        .children[0].data;
      const awardType = $("td > i", book)["0"].children[0].data;
      console.log(title, url, author, awardType);
    }
  }
}
async function parseList() {
  const html = fs.readFileSync("examples/costa.htm").toString();

  const bookElements = $('[itemtype="http://schema.org/Book"]', html);

  for (let [key, book] of Object.entries(bookElements)) {
    if (book.type === "tag") {
      const titleSpan = $("a.bookTitle > span", book)["0"];
      const title = titleSpan.children[0].data;
      const url = `https://goodreads.com/${
        $("a.bookTitle", book)["0"].attribs["href"]
        }`;
      const author = $('span[itemprop="author"] > div > a > span', book)["0"]
        .children[0].data;
      console.log(title, url, author);
    }
  }
}

async function parseLibrary() {
  const html = fs.readFileSync("examples/aucklandsearch.htm").toString();

  const titleElements = $("div.dpBibTitle", html);

  let searchResults = [];

  for (let counter = 0; counter < titleElements.length; counter++) {
  
    const bookElement = titleElements[String(counter)];    
    const title = $('span.title > a', bookElement)['0'].children[0].data.trim().replace(' [electronic resource]', '');
    const url = `https://discover.aucklandlibraries.govt.nz/${$('span.title > a', bookElement)['0'].attribs['href']}`;
    const author = $('div.dpBibAuthor > a', bookElement)['0'].children[0].data.trim();
    const resourceType = $('div > span.itemMediaDescription', bookElement)['0'].children[0].data;

    searchResults.push({
      title,
      author,
      type: resourceType,
      url
    });
  }

  console.log(JSON.stringify(searchResults));
}

(async () => {
  parseLibrary();
})();
