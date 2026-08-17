import { MongoClient, type Collection, type Db } from "mongodb";
import type { GatewayEvent, PaymentLink, User } from "./types";

/**
 * Serverless invocations reuse module scope, so the client is cached on a global.
 * Creating a MongoClient per request exhausts the Atlas connection limit within a day.
 */
const globalForMongo = globalThis as unknown as { _mongoClient?: Promise<MongoClient> };

function connect(): Promise<MongoClient> {
  // Read lazily: importing this module during `next build` must not require env vars.
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  return new MongoClient(uri).connect();
}

export function getClient(): Promise<MongoClient> {
  return (globalForMongo._mongoClient ??= connect());
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(process.env.MONGODB_DB ?? "soraia_payments");
}

export async function users(): Promise<Collection<User>> {
  return (await getDb()).collection<User>("users");
}

export async function paymentLinks(): Promise<Collection<PaymentLink>> {
  return (await getDb()).collection<PaymentLink>("paymentLinks");
}

export async function gatewayEvents(): Promise<Collection<GatewayEvent>> {
  return (await getDb()).collection<GatewayEvent>("gatewayEvents");
}

/**
 * Idempotent — safe to call on every deploy. createIndex is a no-op when the index
 * already exists with the same options.
 */
export async function ensureIndexes(): Promise<void> {
  const [u, p, g] = [await users(), await paymentLinks(), await gatewayEvents()];

  await u.createIndex({ email: 1 }, { unique: true });

  await p.createIndex({ token: 1 }, { unique: true });
  // Uniqueness across attempts is what stops a duplicate callback creating a second
  // payment record. Partial filter: links start with an empty attempts array.
  await p.createIndex(
    { "attempts.merchantTxnNo": 1 },
    { unique: true, partialFilterExpression: { "attempts.merchantTxnNo": { $exists: true } } }
  );
  await p.createIndex({ status: 1, expiresAt: 1 }); // expiry cron
  await p.createIndex({ createdBy: 1, createdAt: -1 }); // a staff member's own links

  await g.createIndex({ merchantTxnNo: 1, receivedAt: -1 });
}
