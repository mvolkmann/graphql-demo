import ApolloClient from 'apollo-boost';
import React from 'react';
import ReactDOM from 'react-dom';
import {ApolloProvider} from '@apollo/react-hooks';
import App from './App';

const client = new ApolloClient({
  uri: 'http://localhost:1919/graphql',
  connectToDevTools: true
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App client={client} />
  </ApolloProvider>,
  document.getElementById('root')
);
