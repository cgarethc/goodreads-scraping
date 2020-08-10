# goodreads-scraping
Scraping tools for goodreads

Lots of examples for populating Firestore in the alltheawards.sh script

## Lists

`node whatcaniborrow.js -l <URL>`

where the URL is a full Goodreads URL for a Listopia list, e.g.

`node whatcaniborrow.js -l "https://www.goodreads.com/list/show/37060.Hugo_Award_for_Best_Novel"`

## Awards

`node whatcaniborrow.js -a <URL>`

where the URL is a full Goodreads URL for an awards list, e.g.

`node whatcaniborrow.js -a https://www.goodreads.com/award/show/128-pen-hemingway-foundation-award`

Awards can be filtered by providing a regular expression with the "-f" parameter

## Populating Firestore

Include an identifier (with allowed Firestore characters for an ID) and a name, e.g.

`node populatefirestore.js -a https://www.goodreads.com/award/show/2129-london-book-festival -i london-book-festival -n "London Book Festival"`
