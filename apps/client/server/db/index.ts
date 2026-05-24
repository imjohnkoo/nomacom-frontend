import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let db: ReturnType<typeof drizzle<typeof schema>> | null = null
let client: ReturnType<typeof postgres> | null = null

export const useDB = () => {
  if (db) {
    return db
  }

  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  // prod RDS requires SSL (pg_hba.conf); local dev postgres typically doesn't.
  const ssl = process.env.NODE_ENV === 'production' ? 'require' : false

  client = postgres(databaseUrl, { ssl })
  db = drizzle(client, { schema })

  return db
}

export { schema }
