const DataLoader = require('dataloader');
const express = require('express');
const fetch = require('node-fetch');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema');
const util = require('util');
const xml2js = require('xml2js');

const parseXML = util.promisify(xml2js.parseString);

const app = express();

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
