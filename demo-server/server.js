// To try this, run the GraphiQL Electron app and
// send queries to http://localhost:1919/graphql.
//
// Sample queries
/*
{ me { username lastName } }
{ user(id: 1) { lastName firstName } }
{ allUsers { id username lastName firstName } }
{ address(id: 1) { street zip } }
{ user(id: 2) { username lastName address { street zip } } }

mutation {
  createUser(username: "pw", firstName: "PeeWee", lastName: "Herman") {
    id
  }
}

mutation { deleteUser(id: 1) }

mutation {
  updateUser(id: 1, updates: {firstName: "Richard", username: "foobar"}) {
    username
    firstName
  }
}
*/

const {PubSub} = require('apollo-server');
const {ApolloServer, gql} = require('apollo-server-express');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());

const addresses = {
  1: {
    street: '644 Glen Summit',
    city: 'Saint Charles',
    state: 'Missouri',
    zip: 63304
  }
};

const users = {};
let lastUserId = 0;

function addUser(username, firstName, lastName, addressId) {
  const id = ++lastUserId;
  const user = {id, username, firstName, lastName, addressId};
  users[id] = user;
  return user;
}

addUser('mvolkmann', 'Mark', 'Volkmann', 1);
addUser('tvolkmann', 'Tami', 'Volkmann', 1);

const schema = gql`
  type Query {
    """
    Gets the address with a given id.
    This is a multi-line comment.
    """
    address(id: ID!): Address

    " Gets all users. "
    allUsers: [User!]

    " Gets the User representing me. "
    me: User

    " Gets a specific User. "
    user(id: ID!): User
  }

  type Address {
    id: ID!
    street: String!
    city: String!
    " A state in the United States. "
    state: String!
    " 5-digit US zip code. "
    zip: Int!
  }

  input AddressInput {
    street: String
    city: String
    state: String
    zip: Int
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    username: String!
    address: Address
  }

  input UserInput {
    firstName: String
    lastName: String
    username: String
  }

  type Mutation {
    "Creates a new User."
    createUser(username: String!, firstName: String!, lastName: String!): User!

    "Deletes a given user and returns a boolean indicating whether they existed."
    deleteUser(id: ID!): Boolean!

    "Updates a given user and returns the updated user."
    updateUser(id: ID!, updates: UserInput): User
  }

  type Subscription {
    userAdded: User
  }
`;

const USER_ADDED = 'USER_ADDED';

const resolvers = {
  Query: {
    address(parent, {id}) {
      return addresses[id];
    },
    me() {
      return users[1];
    },
    user(parent, {id}) {
      return users[id];
    },
    allUsers() {
      return Object.values(users);
    }
  },
  // This specifies how to get the address of a User.
  User: {
    address: user => {
      return addresses[user.addressId];
    }
  },
  Mutation: {
    createUser(parent, user) {
      pubSub.publish(USER_ADDED, {userAdded: user});
      const {username, firstName, lastName} = user;
      return addUser(username, firstName, lastName);
    },
    deleteUser(parent, {id}) {
      const user = users[id];
      delete users[id];
      return Boolean(user);
    },
    updateUser(parent, {id, updates}) {
      const user = users[id];
      for (const prop of Object.keys(updates)) {
        user[prop] = updates[prop];
      }
      return user;
    }
  },
  Subscription: {
    userAdded: {
      subscribe: () => pubSub.asyncIterator([USER_ADDED])
    }
  }
};

const pubSub = new PubSub();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async ({req, connection}) => {
    return connection ? connection.context : {};
  },
  subscriptions: {
    onConnect() {
      return users;
    }
  }
});

server.applyMiddleware({app, path: '/graphql'});

const port = 1919;
app.listen({port}, () => {
  console.log('GraphQL server listening on port', port);
});
