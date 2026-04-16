import { db } from '../database'
import { users } from '../database/schema'

export default defineEventHandler(async () => {
  return db.select().from(users)
})
