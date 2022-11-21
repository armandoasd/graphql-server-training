import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import {generatedTypedef as typeDefs} from "./generated/typeDefs";
import {resolvers} from "./GraphqlApi/queries";


const server = new ApolloServer({
    typeDefs,
    resolvers,
});

startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({url})=>{console.log(`🚀  Server ready at: ${url}`);});
