const $ = require("cheerio").default;
const request = require("superagent");

exports.search = async (author, title) => {

    let searchResults = [];
    const url = `https://catalogue.wcl.govt.nz/search`;
    const requestBody = {
        "searchTerm": `{\"isAnd\":true,\"searchTokens\":[{\"searchString\":\"${author}\",\"type\":\"Contains\",\"field\":\"Author\"},{\"searchString\":\"${title}\",\"type\":\"Contains\",\"field\":\"Title\"}]}`,
        "startIndex": 0, "hitsPerPage": 12, "facetFilters": [], "sortCriteria": "Relevancy", "targetAudience": "", "addToHistory": false, "dbCodes": []
    };

    let response;
    try {
        response = await request
            .post(url)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .set(
                "User-Agent",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
            )
            .disableTLSCerts()
            .send(requestBody);
    } catch (err) {
        console.error("Request to", url, "failed", err.message);
        return [];
    }

    const responseData = response.body;
    for (let resource of responseData.resources) {
        if (resource.downloadable) {
            const title = resource.shortTitle;
            const url = resource.link;
            const author = resource.shortAuthor;
            const resourceType = resource.format;
            searchResults.push({
                title,
                author,
                type: resourceType,
                url
            });
        }
    }

    return searchResults;
};
