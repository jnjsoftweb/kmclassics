import { bookResolvers } from './book';

export const resolvers = {
  Query: {
    ...bookResolvers.Query,
  },
  Mutation: {
    ...bookResolvers.Mutation,
  },
};
