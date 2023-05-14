const request = require("superagent");
const { scrape } = require("./scrapelist");

/**
 * Tidy up the messy author names that are returned by the search.
 * @param {*} author 
 */
function cleanAuthor(author) {
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
  const url = `https://ap.iiivega.com/api/search-result/search/format-groups`;
  let response;
  try {
    const agent = request.agent();
    const body = {
      "searchText": `${title} by ${author}`,
      "sorting": "relevance", "sortOrder": "asc",
      "searchType": "everything", "pageNum": 0, "pageSize": 10,
      "resourceType": "FormatGroup"
    };
    response = await agent
      .post(url)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .set('api-version', '2')
      .set('content-type', 'application/json')
      .set('iii-customer-domain', 'elgar.ap.iiivega.com')
      .set('sec-ch-ua', '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"')
      .set('sec-ch-ua-mobile', '?0')
      .set('sec-ch-ua-platform', '"macOS"')
      .set('sec-fetch-dest', 'empty')
      .set('sec-fetch-mode', 'cors')
      .set('sec-fetch-site', 'cross-site')
      .send(
        body
      );
    if (response.totalResults === 0) {
      console.log('No results');
      return [];
    }
    else {
      function addBooksOfType(firstRecord, formatName, typeName, result) {
        const formats = firstRecord.materialTabs.filter(format => format.name === formatName);
        if (formats.length > 0) {
          const urls = formats[0].availability.urls;
          const available = formats[0].availability.status.electronicLocator === 'Available';
          for (let url of urls) {
            // only add if the domain is not samples.overdrive.com
            if (url.indexOf('samples.overdrive.com') < 0) {
              result.push({
                title: firstRecord.title,
                author: cleanAuthor(firstRecord.primaryAgent.label),
                type: typeName,
                url,
                available
              });
            }
          }
        }
      }

      const result = [];
      const firstRecord = response.body.data[0];

      if (firstRecord && firstRecord.materialTabs) {
        addBooksOfType(firstRecord, 'eBook', 'eBook', result);
        addBooksOfType(firstRecord, 'eAudiobook', 'eAudiobook', result);
      }
      return result;

    }
  } catch (err) {
    console.error("Request to", url, "failed", err.message, err.status);
    return [];
  }
};
