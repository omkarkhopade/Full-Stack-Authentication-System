import mongoose from "mongoose";

type MongooseCache = {
    connection: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
    mongooseCache?: MongooseCache;
};

const cache = globalWithMongoose.mongooseCache ?? {
    connection: null,
    promise: null,
};

globalWithMongoose.mongooseCache = cache;

export async function connect() {
    if (cache.connection) return cache.connection;

    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is not configured");

    cache.promise ??= mongoose.connect(mongoUri, {
        bufferCommands: false,
    });

    try {
        cache.connection = await cache.promise;
        return cache.connection;
    } catch (error) {
        cache.promise = null;
        throw error;
    }
}
