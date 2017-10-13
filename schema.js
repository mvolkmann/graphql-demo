const {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} = require('graphql');

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].title[0]
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.book[0].isbn[0]
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve: (xml, args, context) => {
        const authorElements = xml.GoodreadsResponse.book[0].authors[0].author;
        const ids = authorElements.map(elem => elem.id[0]);
        return context.authorLoader.loadMany(ids);
      }
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: '...',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => {
        console.log('schema.js author name: xml =', xml);
        return xml.GoodreadsResponse.author[0].name[0];
      }
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: (xml, args, context) => {
        console.log('author XML =', xml);
        const ids = xml.GoodreadsResponse.author[0].books[0].book.map(
          elem => elem.id[0]._
        );
        return context.bookLoader.loadMany(ids);
      }
    }
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',
    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: {type: GraphQLInt}
        },
        resolve: (root, args, context) => {
          console.log('schema.js resolve: entered');
          return context.authorLoader.load(args.id);
        }
      }
    })
  })
});
