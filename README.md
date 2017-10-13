GraphQL Demo forked from MPJ's Fun Fun Function version

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

Setup:
1) Get a developer API key at https://www.goodreads.com/api
2) Change the key in serve.js.

To run:
1) npm start
2) browse localhost:4000/demo
3) enter the following query in the left pane
   query {
     author(id: 21559) {
       name,
       books: {
         isbn,
         title
       }
     }
   }
