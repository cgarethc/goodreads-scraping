const $ = require("cheerio").default;
const request = require("superagent");

/**
 * Tidy up the messy author names that are returned by the search.
 * @param {*} author 
 */
exports.cleanAuthor = (author) => {
  let cleanAuthor = author;
  // Auckland also has annoying trailing text on authors, remove that as well:
  cleanAuthor = cleanAuthor.replace(/,\s*author.+$/, ''); // the word 'author'
  cleanAuthor = cleanAuthor.replace(/,\s*[0-9]{4}-?([0-9]{4})?/, ''); // date of birth and death
  cleanAuthor = cleanAuthor.replace(/\.$/, ''); // trailing dot
  cleanAuthor = cleanAuthor.replace(/\s*author.*$/, ''); // trailing "author" and sometimes "narrator" as well
  return cleanAuthor;
}

exports.search = async (author, title) => {

  let searchResults = [];
  const url = `https://old.discover.aucklandlibraries.govt.nz/iii/encore/search/C__St:(${encodeURIComponent(title)}) l:eng a:(${encodeURIComponent(author)}) f:(u | z)__Orightresult__U?lang=eng&suite=def`;
  let response;
  try {
    const agent = request.agent()
    response = await agent
      .get(url)
      .set("Content-Type", "text/html")
      .set("Accept", "text/html")
      .set(
        "User-Agent",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
      );
  } catch (err) {
    console.error("Request to", url, "failed", err.message, err.status);
    return [];
  }

  const titleElements = $("div.dpBibTitle", response.text);


  for (let counter = 0; counter < titleElements.length; counter++) {
    process.stdout.write('.');
    const bookElement = titleElements[String(counter)];

    let title = $('span.title > a', bookElement)['0'].children[0].data;
    // Auckland has some annoying trailing text in some of their titles, remove it:
    title = title.trim().replace(/\ \[.+\].*/, '');
    title = title.replace(/\s+:\s+a novel$/, '');

    const url = `https://old.discover.aucklandlibraries.govt.nz${$('span.title > a', bookElement)['0'].attribs['href']}`;
    const authorElement = $('div.dpBibAuthor > a', bookElement)['0'];
    let author;
    if (authorElement) {
      author = authorElement.children[0].data.trim();
      author = this.cleanAuthor(author);
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

  return searchResults;
};
