import ApolloClient, {gql} from 'apollo-boost';
//import {useSubscription} from '@apollo/react-hooks';
//import {HttpLink} from 'apollo-link-http';
//import {WebSocketLink} from 'apollo-link-ws';
import React, {useEffect, useState} from 'react';
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
const client = new ApolloClient({
  uri: 'http://localhost:1919/graphql',
  // link: new HttpLink({
  //   uri: 'http://localhost:1919/graphql'
  // }),
  connectToDevTools: true
});

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

function App() {
  const [users, setUsers] = useState([]);
  const [username, setUsername, usernameRow] = useInputRow('Username');
  const [firstName, setFirstName, firstNameRow] = useInputRow('First Name');
  const [lastName, setLastName, lastNameRow] = useInputRow('Last Name');

  // const {
  //   data: {newUser},
  //   loading
  // } = useSubscription(SUBSCRIBE_NEW_USERS);

  useEffect(() => {
    loadData();
  }, []);

  function handleError(error) {
    alert(error);
  }

  async function loadData() {
    const res = await client.query({query: GET_USERS});
    setUsers(res.data.allUsers);
  }

  async function addUser(event) {
    event.preventDefault();

    try {
      const user = {username, firstName, lastName};
      const res = await client.mutate({
        mutation: CREATE_USER,
        variables: user
      });
      const {id} = res.data.createUser;
      user.id = id;
      setUsers(users.concat(user));
      setUsername('');
      setFirstName('');
      setLastName('');
    } catch (e) {
      handleError(e);
    }
  }

  async function deleteUser(id) {
    try {
      const res = await client.mutate({
        mutation: DELETE_USER,
        variables: {
          userId: id
        }
      });
      const deleted = res.data.deleteUser;
      if (!deleted) console.log('This user was already deleted.');
      setUsers(users.filter(user => user.id !== id));
    } catch (e) {
      handleError(e);
    }
  }

  return (
    <div className="App">
      <h1>Users</h1>
      {/* <div>loading = {loading}</div>
      <div>newUser = {newUser}</div> */}
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
              <td onClick={() => deleteUser(user.id)}>&#x1f5d1;</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={addUser}>
        {usernameRow}
        {firstNameRow}
        {lastNameRow}
        <button type="submit">Add User</button>
      </form>
    </div>
  );
}

export default App;
