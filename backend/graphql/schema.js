import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLSchema } from 'graphql';
import User from '../models/User';
import HealthMetric from '../models/HealthMetric';
import Community from '../models/Community';

// User Type
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    healthMetrics: {
      type: new GraphQLList(HealthMetricType),
      resolve(parent, args) {
        return HealthMetric.find({ userId: parent.id });
      }
    },
    communities: {
      type: new GraphQLList(CommunityType),
      resolve(parent, args) {
        return Community.find({ members: parent.id });
      }
    }
  })
});

// Health Metric Type
const HealthMetricType = new GraphQLObjectType({
  name: 'HealthMetric',
  fields: () => ({
    id: { type: GraphQLString },
    userId: { type: GraphQLString },
    metricName: { type: GraphQLString },
    value: { type: GraphQLInt },
    date: { type: GraphQLString }
  })
});

// Community Type
const CommunityType = new GraphQLObjectType({
  name: 'Community',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    members: { type: new GraphQLList(UserType) }
  })
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return User.findById(args.id).catch(err => {
          throw new Error('Error fetching user: ' + err.message);
        });
      }
    },
    healthMetrics: {
      type: new GraphQLList(HealthMetricType),
      args: { userId: { type: GraphQLString } },
      resolve(parent, args) {
        return HealthMetric.find({ userId: args.userId }).catch(err => {
          throw new Error('Error fetching health metrics: ' + err.message);
        });
      }
    },
    community: {
      type: CommunityType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        return Community.findById(args.id).catch(err => {
          throw new Error('Error fetching community: ' + err.message);
        });
      }
    }
  }
});

// Mutations
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString }
      },
      resolve(parent, args) {
        const user = new User({
          name: args.name,
          email: args.email
        });
        return user.save().catch(err => {
          throw new Error('Error adding user: ' + err.message);
        });
      }
    },
    addHealthMetric: {
      type: HealthMetricType,
      args: {
        userId: { type: GraphQLString },
        metricName: { type: GraphQLString },
        value: { type: GraphQLInt },
        date: { type: GraphQLString }
      },
      resolve(parent, args) {
        const healthMetric = new HealthMetric({
          userId: args.userId,
          metricName: args.metricName,
          value: args.value,
          date: args.date
        });
        return healthMetric.save().catch(err => {
          throw new Error('Error adding health metric: ' + err.message);
        });
      }
    },
    addCommunity: {
      type: CommunityType,
      args: {
        name: { type: GraphQLString },
        members: { type: new GraphQLList(GraphQLString) }
      },
      resolve(parent, args) {
        const community = new Community({
          name: args.name,
          members: args.members
        });
        return community.save().catch(err => {
          throw new Error('Error adding community: ' + err.message);
        });
      }
    }
  }
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});