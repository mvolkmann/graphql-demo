GraphQL Demo forked from MPJ's Fun Fun Function version

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
