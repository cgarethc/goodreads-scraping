'use strict';

const $ = require("cheerio");
const request = require("superagent");

const PLACEHOLDER = 'https://s.gr-assets.com/assets/nophoto/book/50x75-a91bf249278a81aabab721ef782c4a74.png';

exports.scrape = async (goodreadsURL) => {
  try {
    const response = await request
      .get(goodreadsURL)
      .set("Content-Type", "text/html");
    const html = response.text;

    const coverElements = $('#coverImage', html);
    let src = coverElements['0'].attribs['src'];
    // use the 75px version
    if (!src.match(/_/)) { // no underscore, add the 75px version
      src = src.substring(0, src.length - 3) + '_SY75_.jpg';
    }
    else if (src.match(/_.+\.jpg/)) { // some dimension given, replace it
      const split = src.split(/_.+\.jpg/);
      src = split[0] + '_SY75_.jpg';
    }
    return src;
  }
  catch (err) {
    console.error('Error scraping cover', err);
    return PLACEHOLDER;
  }
}