import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let client: ReturnType<typeof postgres> | null = null;

export const useDB = () => {
  if (db) {
    return db;
  }

  const config = useRuntimeConfig();

  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }

  client = postgres(config.databaseUrl);
  db = drizzle(client, { schema });

  return db;
};

export { schema };
