import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();
const USER_ADDED = 'USER_ADDED';

interface User {
  id: number;
  name: string;
  email: string;
}

let dataUsers: User[] = [];

const resolvers = {
  Query: {
    users: () => dataUsers,
  },
  Mutation: {
    createUser: (_, { data }) => {
      const newUser = { ...data, id: dataUsers.length + 1 };
      dataUsers.push(newUser);
      pubsub.publish(USER_ADDED, { userAdded: newUser });
      return newUser;
    },
  },
  Subscription: {
    userAdded: {
      subscribe: () => pubsub.asyncIterableIterator([USER_ADDED]),
    },
  },
};

export default resolvers;
