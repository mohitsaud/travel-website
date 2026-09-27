import mongoose from 'mongoose';

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache = global.mongooseCache ?? { connection: null, promise: null };
global.mongooseCache = cache;

export default async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cache.connection) return cache.connection;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
