'use strict';

const $ = require("cheerio");
const request = require("superagent");

exports.scrape = async (goodreadsURL) => {
  const response = await request
    .get(goodreadsURL)
    .set("Content-Type", "text/html");
  const html = response.text;

  const coverElements = $('#coverImage', html);
  return coverElements['0'].attribs['src'];
}