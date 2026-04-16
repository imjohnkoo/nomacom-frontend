import { esimDb } from '../../database/esim'
import { planTypes } from '../../database/esim-schema'

export default defineEventHandler(async () => {
  return esimDb.select().from(planTypes)
})
