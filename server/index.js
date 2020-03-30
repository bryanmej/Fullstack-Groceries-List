const { GraphQLServer } = require("graphql-yoga");
const mongoose = require("mongoose");

// connect to database
mongoose.connect("mongodb://127.0.0.1:27017/test", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// data models
const Todo = mongoose.model("Todo", {
  text: String,
  complete: Boolean
});

// graphql schema
const typeDefs = `
  type Query {
    todo: [Todo]
  }

  type Todo {
    id: ID!
    text: String!
    complete: Boolean!
  }

  type Mutation {
    createTodo(text: String!): Todo
    updateTodo(id:ID!, complete:Boolean!): Boolean
    removeTodo(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    todo: () => Todo.find()
  },

  Mutation: {
    createTodo: async (_, { text }) => {
      const todo = new Todo({ text, complete: false });
      await todo.save();
      return todo;
    },
    updateTodo: async (_, { id, complete }) => {
      await Todo.findByIdAndUpdate(id, { complete });
      return true;
    },
    removeTodo: async (_, { id }) => {
      await Todo.findOneAndRemove(id);
      return true;
    }
  }
};

// start server when connected to database
const server = new GraphQLServer({ typeDefs, resolvers });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  server.start(() => console.log("Server is running on localhost:4000"));
});
