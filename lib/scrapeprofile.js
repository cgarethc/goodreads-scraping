'use strict';

const $ = require("cheerio").default;
const request = require("superagent");

exports.scrape = async (url) => {

  const response = await request
    .get(url)
    .set("Content-Type", "text/html");
  const html = response.text;

  const bookElements = $('a.userPagePhoto', html);
  return {name: bookElements['0'].attribs['title']};


}