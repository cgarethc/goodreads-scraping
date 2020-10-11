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

## TODO

### Experience

Roll up the duplicates and show a button for each result in the same card

Group lists into sensible sections - e.g. children's awards, literature awards, community lists

Filter for awards list

Support a Goodreads login and:

- show which books are already read
- show which books are by authors that user has already read another book by

Show the availability status at the library (whether actually available or just available to put on hold)

### Management

Replace shell script with a table of list/award parameters and add a reprocessing job that can run serverless somewhere (AWS Lambda+Dynamo or try GCP/Firebase actions).