const DataLoader = require('dataloader');
const express = require('express');
const fetch = require('node-fetch');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema');
const util = require('util');
// This parses XML and creates a JavaScript representation.
const xml2js = require('xml2js');

const parseXML = util.promisify(xml2js.parseString);

const app = express();

const API_KEY = 'zMhn4I9tt4TTE415wmQVYA';
// If you need to write data to the goodreads API,
// secret = 'jtZc3NSi7wl35SflP9xRg61ejF8G2DLntyYsHc1zLQ'
const URL_PREFIX = 'https://www.goodreads.com/';

// Note what this prepends and appends to the URL that is passed in.
async function fetchXml(url) {
  const response = await fetch(URL_PREFIX + url + 'key=' + API_KEY);
  const text = await response.text();
  return parseXML(text);
}

const fetchAuthor = id => fetchXml(`author/show.xml?id=${id}&`);
const fetchBook = id => fetchXml(`book/show/${id}.xml?`);

app.use(
  '/author',
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

app.use(
  '/book',
  graphqlHTTP(req => {
    const bookLoader = new DataLoader(keys => Promise.all(keys.map(fetchBook)));

    return {
      schema,
      context: {bookLoader},
      graphiql: true
    };
  })
);

const port = 4000;
app.listen(port);
console.log(`browse localhost:${port}/demo`);
