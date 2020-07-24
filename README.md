# goodreads-scraping
Scraping tools for goodreads

## Lists

`node whatcaniborrow.js -l <URL>`

where the URL is a full Goodreads URL for a Listopia list, e.g.

`node whatcaniborrow.js -l "https://www.goodreads.com/list/show/37060.Hugo_Award_for_Best_Novel"`

## Awards

`node whatcaniborrow.js -a <URL>`

where the URL is a full Goodreads URL for an awards list, e.g.

`node whatcaniborrow.js -a https://www.goodreads.com/award/show/128-pen-hemingway-foundation-award`

## TODO

- Filter expression for awards, e.g. e.g. to filter out winners vs nominees and categories (best fiction, vs non-fiction)
