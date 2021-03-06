import {gql} from 'apollo-boost';
//import {HttpLink} from 'apollo-link-http';
//import {WebSocketLink} from 'apollo-link-ws';
import {object} from 'prop-types';
import React, {useEffect, useState} from 'react';
import {useQuery, useMutation, useSubscription} from '@apollo/react-hooks';
//import {Client, addGraphQLSubscriptions} from 'subscriptions-transport-ws';

import './App.css';

/*
const wsClient = new Client('ws://localhost:8080');
const networkInterface = createNetworkInterface({
  uri: '/graphql',
  opts: {
    credentials: 'same-origin'
  }
});
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);
*/
// const wsLink = new WebSocketLink({
//   uri: `ws://localhost:5000/`,
//   options: {
//     reconnect: true
//   }
// });

const GET_USERS = gql`
  {
    allUsers {
      id
      username
      lastName
      firstName
    }
  }
`;

//TODO: Why do you have to define this in the client?
//TODO: Is it just to define what you want back?
const CREATE_USER = gql`
  mutation CreateUser(
    $username: String!
    $firstName: String!
    $lastName: String!
  ) {
    createUser(
      username: $username
      firstName: $firstName
      lastName: $lastName
    ) {
      id
      username
      firstName
      lastName
    }
  }
`;

//TODO: Why do you have to define this in the client?
//TODO: Is it just to define what you want back?
const DELETE_USER = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(id: $userId)
  }
`;

const SUBSCRIBE_NEW_USERS = gql`
  subscription onUserAdded($user: User!) {
    userAdded(user: $user) {
      id
      username
      firstName
      lastName
    }
  }
`;

function useInputRow(label) {
  const [value, setValue] = useState('');
  const component = (
    <div className="row">
      <label>{label}</label>
      <input onChange={e => setValue(e.target.value)} required value={value} />
    </div>
  );
  return [value, setValue, component];
}

function App({client}) {
  const [username, setUsername, usernameRow] = useInputRow('Username');
  const [firstName, setFirstName, firstNameRow] = useInputRow('First Name');
  const [lastName, setLastName, lastNameRow] = useInputRow('Last Name');

  useEffect(() => {
    doFetch();
  }, []);

  const [createUser] = useMutation(CREATE_USER, {
    onCompleted(data) {
      setUsername('');
      setFirstName('');
      setLastName('');
      refetchUsers();
    },
    onError: handleError
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted(data) {
      const deleted = data.deleteUser;
      if (deleted) refetchUsers();
    },
    onError: handleError
  });

  const {subscriptionData, loadingSubscription} = useSubscription(
    SUBSCRIBE_NEW_USERS
  );
  if (!loadingSubscription) {
    console.log('subscription returned subscriptionData =', subscriptionData);
  }

  const {loading: loadingUsers, error, data, refetch: refetchUsers} = useQuery(
    GET_USERS
  );
  if (loadingUsers) return <div>... loading ...</div>;
  if (error) return <div>Error: {error}</div>;

  async function doFetch() {
    const query = '{allUsers {id username lastName firstName}}';
    const result = await sendGQL(query);
    console.log('App.js doFetch: result =', result);
  }

  async function sendGQL(query) {
    const url = 'http://localhost:1919/graphql';
    const body = {query};
    const headers = {
      'Content-Type': 'application/json'
    };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const result = await res.json();
      return result.data;
    } catch (e) {
      handleError(e);
    }
  }

  function handleError(error) {
    alert(error);
  }

  async function onAddUser(event) {
    event.preventDefault();
    const user = {username, firstName, lastName};
    createUser({variables: user});
  }

  async function onDeleteUser(id) {
    deleteUser({variables: {userId: id}});
  }

  const users = data.allUsers || [];

  return (
    <div className="App">
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td onClick={() => onDeleteUser(user.id)}>&#x1f5d1;</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={onAddUser}>
        {usernameRow}
        {firstNameRow}
        {lastNameRow}
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

App.props = {
  client: object.isRequired
};

export default App;
