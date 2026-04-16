import { esimDb } from '../../database/esim'
import { esims } from '../../database/esim-schema'

export default defineEventHandler(async () => {
  return esimDb.select().from(esims)
})
