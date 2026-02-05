import { MongoClient, Db } from "mongodb";

const uri = process.env.DATABASE_URI!;

let client: MongoClient;
let db: Db;

export async function getDb() {
  if (db) {
    return db;
  }

  if (!client) {
    client = new MongoClient(uri, {
      connectTimeoutMS: 30000,
      keepAliveInitialDelay: 1,
      tls: true,
      tlsAllowInvalidCertificates: true, // For development only
      tlsAllowInvalidHostnames: true, // For development only
    });
    await client.connect();
  }

  db = client.db("guess-my-valentine");
  return db;
}

export async function getValentineCollection() {
  const database = await getDb();
  return database.collection("Valentine");
}

export async function getTokenCollection() {
  const database = await getDb();
  return database.collection("Token");
}
