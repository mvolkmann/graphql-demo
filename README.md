# GraphQL Demo forked from MPJ's Fun Fun Function version

This demonstrates using GraphQL to access data from the
GoodReads API which describes authors, books, and more.
For details, see https://www.goodreads.com/api.

It uses the GraphiQL web UI to allow entering and executing
GraphQL queries to test the GraphQL endpoint.

This code was copied from
https://github.com/mpj/fff-graphql-goodreads and modified.
"fff" stands for "Fun Fun Function" which is
a series of screencasts on JavaScript by MPJ.
See the screencast at https://www.youtube.com/watch?v=lAJWHHUz8_8.

## Setup

1) Get a developer API key at https://www.goodreads.com/api
2) Change the key in serve.js.

## Running

1) npm start
2) browse localhost:4000/demo
3) enter a query in the left pane

## Example Queries

query {
  author(id: 656983) {
    name
    books {
      isbn
      authors {
        name
      }
      title
      description
    }
  }
}

query {
  book(id: 85009) {
    title
  }
}

## Getting Ids

To get ids for authors and books,
search for them at https://goodreads.com
and note the ids in the URLs.

## Some Author Ids:

Erich Gamma - 48622 (has books with multiple authors)
J.R.R. Tolkien - 656983
Kurt Vonnegut - 2778055
Nassim Nicholas Taleb - 21559
