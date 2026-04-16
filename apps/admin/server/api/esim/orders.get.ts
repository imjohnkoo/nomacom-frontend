import { esimDb } from '../../database/esim'
import { orders } from '../../database/esim-schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return esimDb.select().from(orders).orderBy(desc(orders.createdAt))
})
