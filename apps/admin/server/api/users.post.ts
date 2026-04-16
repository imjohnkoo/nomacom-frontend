import { db } from '../database'
import { users } from '../database/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = db.insert(users).values({
    email: body.email,
    name: body.name,
    role: body.role ?? 'viewer',
  }).returning()
  return result
})
