const {
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} = require('graphql');

// This traverses a path through the nested objects
// produced from XML by xml2js.
function getFromPath(xml, path, expectArray) {
  const parts = path.split('/');
  const lastIndex = parts.length - 1;
  return parts.reduce((result, p, index) => {
    const value = result[p];
    return !Array.isArray(value) ? value :
      expectArray && index === lastIndex ? value :
      value[0];
  }, xml.GoodreadsResponse);
}

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => getFromPath(xml, 'author/name')
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: (xml, args, context) => {
        const books = getFromPath(xml, 'author/books/book', true);
        // The id of each book is in a property named "_".
        const ids = books.map(book => book.id[0]._);
        return context.bookLoader.loadMany(ids);
      }
    }
  })
});

const BookType = new GraphQLObjectType({
  name: 'Book',
  fields: () => ({
    isbn: {
      type: GraphQLString,
      resolve: xml => getFromPath(xml, 'book/isbn')
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve: (xml, args, context) => {
        const authorElements = getFromPath(xml, 'book/authors/author', true);
        const ids = authorElements.map(elem => elem.id[0]);
        return context.authorLoader.loadMany(ids);
      }
    },
    description: {
      type: GraphQLString,
      resolve: xml => getFromPath(xml, 'book/description')
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => getFromPath(xml, 'book/isbn')
    },
    title: {
      type: GraphQLString,
      resolve: xml => getFromPath(xml, 'book/title')
    },
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: {type: GraphQLInt}
        },
        resolve: (root, args, context) => {
          return context.authorLoader.load(args.id);
        }
      },
      book: {
        type: BookType,
        args: {
          id: {type: GraphQLInt}
        },
        resolve: (root, args, context) => {
          return context.bookLoader.load(args.id);
        }
      }
    })
  })
});
