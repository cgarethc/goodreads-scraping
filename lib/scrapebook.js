const $ = require("cheerio").default;
const request = require("superagent");
const { DateTime } = require('luxon');

exports.scrape = async (url) => {

  try {
    const response = await request
      .get(url)
      .set("Content-Type", "text/html")
      .on('error', (error) => {
        console.log('WARN error on request for book', url, error);
      });
    const html = response.text;

    const bookData = [];


    // Book metadata panel
    // the layout is messed up and the parent elements are inconsistent - the only way to find the
    // key/value pairs is to find the keys (the "infoBoxRowTitle") and the value relative to them
    let dataElements = $('div.infoBoxRowTitle', html);

    for (let counter = 0; counter < dataElements.length; counter++) {

      const dataItemKeyElement = dataElements[counter];

      const dataKey = dataItemKeyElement.children[0].data;
      const dataItemValueElement = dataItemKeyElement.next.next;
      if (!dataItemValueElement.children[0]) {
        console.log('WARN Missing data value', url, dataKey);
      }
      else {
        const dataValue = dataItemValueElement.children[0].data;
        if (dataValue && dataValue.trim()) {
          const trimmed = dataValue.trim();
          bookData.push({ key: dataKey, value: trimmed });
        }
        else if (dataKey.trim()) {
          const dataValueElements = $('a', dataItemValueElement);
          const multipleValues = [];
          for (let multipleValueCounter = 0; multipleValueCounter < dataValueElements.length; multipleValueCounter++) {
            const valueItem = dataValueElements[multipleValueCounter];
            if (Array.isArray(valueItem.children) && valueItem.children.length > 0 && valueItem.children[0].data) {
              const firstText = valueItem.children[0].data.trim();
              if (firstText !== '…more' && firstText !== '…less' && firstText !== '...more' && firstText !== '...less') {
                multipleValues.push(firstText);
              }

            }
          }
          bookData.push({ key: dataKey, values: multipleValues });
        }
      }

    }

    // Genre panel
    // The de-duplicating is because there is a weak subgenre concept, so something can be shelved as both
    // "Historical > Historical Fiction" and "Historical". The "Historical" genre then appears twice.
    dataElements = $('div.left > a.bookPageGenreLink', html);
    const genreSet = new Set();
    for (let counter = 0; counter < dataElements.length; counter++) {
      genreSet.add(dataElements[counter].children[0].data);
    }
    bookData.push({ key: 'Genres', values: [...genreSet] });

    return bookData;
  }
  catch (error) {
    console.error('Failed to scrape a book', url);
    return null;
  }

}