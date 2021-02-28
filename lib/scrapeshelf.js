'use strict';

const $ = require("cheerio");
const request = require("superagent");
const { DateTime } = require('luxon');
const chrono = require('chrono-node');

const utils = require('./utils');

exports.scrape = async (url, shelf, maxPages) => {

  const titles = [];
  let pageCounter = 1;
  let morePages = true;
  while (morePages) {
    const response = await request
      .get(url)
      .set("Content-Type", "text/html")
      .query({ shelf: shelf, utf8: '✓', per_page: '50', page: pageCounter });
    const html = response.text;

    const bookElements = $('#booksBody > tr', html);

    for (let [key, book] of Object.entries(bookElements)) {
      if (book.type === "tag") {
        const titleSpan = $("td.title > div > a", book)["0"];
        const bookTitle = titleSpan.attribs['title'];
        const bookURL = `https://goodreads.com/${titleSpan.attribs['href']
          }`;
        const bookAuthor = $("td.author > div > a", book)["0"].children[0].data;
        const bookCover = $('img', book)['0'].attribs['src'];

        let dateRead, yearRead, datePub, rating;

        const dateReadSpan = $('span.date_read_value', book)['0'];
        if (dateReadSpan) {
          const dateReadText = dateReadSpan.children[0].data;

          const chronoDate = chrono.parseDate(dateReadText);
          if (chronoDate) {
            dateRead = chronoDate;
            yearRead = chronoDate.getFullYear();
          }
          else {
            console.error('Failed to parse', dateReadText);
          }          
        }

        const datePubDiv = $('td.date_pub > div.value', book)['0'];
        const dateEditionPubDiv = $('td.date_pub_edition > div.value', book)['0'];

        if (datePubDiv) {
          let datePubText = datePubDiv.children[0].data.trim();
          let dateEditionPubText = dateEditionPubDiv.children[0].data.trim();
          
          // sometimes the original publishing date is missing, but the edition date is available
          if(!datePubText && dateEditionPubText){
            datePubText = dateEditionPubText;
          }

          // the format varies quite a bit          
          if (datePubText.length === 4) {
            datePub = parseInt(datePubText)
          }
          else if (datePubText) {
            const chronoDate = chrono.parseDate(datePubText);
            if (chronoDate) {
              datePub = chronoDate.getFullYear();
            }
            else {
              console.error('Failed to parse', datePubText);
            }
          }
        }

        const starsSpan = $('span.staticStars', book)['0'];
        if (starsSpan) {
          const starsText = starsSpan.attribs['title'];
          const ratingMap = {
            'it was amazing': 5,
            'really liked it': 4,
            'liked it': 3,
            'it was ok': 2,
            'did not like it': 1
          };
          rating = ratingMap[starsText];
        }

        titles.push({
          bookTitle: utils.sanitiseTitle(bookTitle),
          bookAuthor,
          bookURL,
          bookCover,
          dateRead,
          yearRead,
          datePub,
          rating
        });

      }
    }

    const nextPage = $('#reviewPagination > a.next_page', html);
    if (nextPage['0'] && (!maxPages || pageCounter < maxPages)) {
      pageCounter++;
      process.stdout.write(pageCounter % 10 == 0 ? 'x' : '.');
    }
    else {
      morePages = false;
    }
  }

  return titles;
};


