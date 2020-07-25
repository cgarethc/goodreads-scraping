//https://discover.aucklandlibraries.govt.nz/iii/encore/search/C__Sa:(roth) f:(i | u)__Orightresult__U?lang=eng&suite=def

const cli = require("commander");

const fs = require("fs");
const $ = require("cheerio");
const request = require("superagent");

exports.search = async (author, title) => {

  const sanitisedTitle = title.replace('?', '').replace(/[\(\)\#]/g, '');

  let searchResults = [];
  const url = `https://discover.aucklandlibraries.govt.nz/iii/encore/search/C__St:(${sanitisedTitle}) l:eng a:(${author}) f:(u | z)__Orightresult__U?lang=eng&suite=def`;
  let response;
  try {
    response = await request
      .get(url)
      .set("Content-Type", "text/html")
      .set("Accept", "text/html")
      .set(
        "User-Agent",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
      );
  } catch (err) {
    console.error("Request to", url, "failed");
    return [];
  }

  const titleElements = $("div.dpBibTitle", response.text);


  for (let counter = 0; counter < titleElements.length; counter++) {

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

    searchResults.push({
      title,
      author,
      type: resourceType,
      url
    });
  }

  return searchResults;
};
