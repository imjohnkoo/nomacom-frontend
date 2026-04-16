import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './esim-schema'

const connectionString = process.env.ESIM_DATABASE_URL || 'postgresql://localhost:5432/nomacom_esim'
const client = postgres(connectionString)
export const esimDb = drizzle(client, { schema })
