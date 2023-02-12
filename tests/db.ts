/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod: any;

export async function connect(): Promise<void> {
  mongod = await MongoMemoryServer.create();
  const uri = await mongod.getUri();
  const mongooseOpts = {};
  await mongoose.connect(uri, mongooseOpts);
}

export async function closeDatabase(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

export async function clearDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
}
