import { esimDb } from '../../database/esim'
import { plans } from '../../database/esim-schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return esimDb.select().from(plans).orderBy(desc(plans.createdAt))
})
