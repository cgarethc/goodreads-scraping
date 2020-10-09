// Consolidate the search results and by rolling up duplicates into multiple results

exports.consolidate = async (results, awardType, goodreadsURL, coverURL) => {
  console.log('consolidating', results);
  const consolidatedResults = [];
  for (let result of results) {
    const existingResult = consolidatedResults.find((toCheck) => {
      const toCheckAuthor = toCheck.author ? toCheck.author.toUpperCase() : '';
      const resultAuthor = result.author ? result.author.toUpperCase() : '';
      
      return toCheck.title.toUpperCase() === result.title.toUpperCase()
        && toCheckAuthor === resultAuthor;
    });
    if (existingResult) {
      console.log('Existing result', existingResult);
      existingResult.editions.push({ type: result.type, url: result.url });
    }
    else {
      console.log('New result');
      const consolidatedResult = { title: result.title, author: result.author, libraryURL: result.url, awardType, goodreadsURL, coverURL };
      consolidatedResult.editions = [{ type: result.type, url: result.url }];
      consolidatedResults.push(consolidatedResult);
    }
  }
  console.log('consolidated', JSON.stringify(consolidatedResults));
  return consolidatedResults;
}