const express = require('express');
const graphqlHTTP = require('express-graphql');
const app = express();
const fetch = require('node-fetch');
const schema = require('./schema');
const DataLoader = require('dataloader');
const util = require('util');
const parseXML = util.promisify(require('xml2js').parseString);

const API_KEY = 'zMhn4I9tt4TTE415wmQVYA';
// If you need to write data to the goodreads API,
// secret = 'jtZc3NSi7wl35SflP9xRg61ejF8G2DLntyYsHc1zLQ'
const URL_PREFIX = 'https://www.goodreads.com/';

async function fetchAuthor(id) {
  const url = `${URL_PREFIX}author/show.xml?id=${id}&key=${API_KEY}`;
  const response = await fetch(url);
  const text = await response.text();
  return parseXML(text);
}

async function fetchBook(id) {
  const url = `${URL_PREFIX}book/show/${id}.xml?key=${API_KEY}`;
  const response = await fetch(url);
  const text = await response.text();
  return parseXML(text);
}

app.use(
  '/demo',
  graphqlHTTP(req => {
    const authorLoader = new DataLoader(keys =>
      Promise.all(keys.map(fetchAuthor))
    );

    const bookLoader = new DataLoader(keys => Promise.all(keys.map(fetchBook)));

    return {
      schema,
      context: {authorLoader, bookLoader},
      graphiql: true
    };
  })
);

const port = 4000;
app.listen(port);
console.log(`browse localhost:${port}/demo`);
