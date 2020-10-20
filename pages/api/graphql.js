import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro';
require('dotenv').config();
const postgres = require('postgres');
const sql = postgres();

async function getTodos() {
  return await sql`select * from todos`;
}

async function getFilteredTodos(checked) {
  return await sql`select * from todos WHERE checked = ${checked}`;
}

async function getTodo(id) {
  const result = await sql`select * from todos WHERE id = ${id}`;
  return result[0];
}

async function createTodo(title, checked) {
  const result = await sql`INSERT INTO todos (title, checked)
  VALUES (${title}, ${checked}) RETURNING id, title, checked;`;
  return result[0];
}

const typeDefs = gql`
  type User {
    name: String
    username: String
  }
  type Todo {
    id: String
    title: String
    checked: Boolean
  }
  type Query {
    users: [User!]!
    user(username: String): User
    todos(filetered: Boolean): [Todo]
    todo(id: String!): Todo
  }
  type Mutation {
    createTodo(title: String!): Todo
  }
`;

const users = [
  { name: 'Leeroy Jenkins', username: 'leeroy' },
  { name: 'Foo Bar', username: 'foobar' },
];

// const todos = [
//   { id: '1', title: 'buy the bread', checked: true },
//   { id: '2', title: 'buy the tomatoes', checked: false },
// ];

const resolvers = {
  Query: {
    users() {
      return users;
    },
    user(parent, { username }) {
      return users.find((user) => user.username === username);
    },
    todos: (root, args) => {
      if (args.filetered === true) {
        return getFilteredTodos(true);
      } else if (args.filetered === false) {
        return getFilteredTodos(false);
      } else return getTodos();
    },
    todo(root, args, context) {
      return getTodo(args.id);
    },
  },
  Mutation: {
    createTodo: (root, args) => {
      return createTodo(args.title, false);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default new ApolloServer({ schema }).createHandler({
  path: '/api/graphql',
});
