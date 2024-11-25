import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import http from 'http';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';

// Importando o schema e os resolvers
import typeDefs from './schemas';
import resolvers from './resolvers';

const pubsub = new PubSub();

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Configuração do WebSocketServer
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Conectar graphql-ws ao servidor WebSocket
  useServer(
    { schema: makeExecutableSchema({ typeDefs, resolvers }) },
    wsServer
  );

  // Configuração do Apollo Server
  const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              wsServer.close();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen(4000, () => {
    console.log(
      `🚀 Server ready at http://localhost:4000${server.graphqlPath}`
    );
    console.log(`🚀 Subscriptions ready at ws://localhost:4000/graphql`);
  });
}

startServer();
