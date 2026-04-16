import { esimDb } from '../../database/esim'
import { naverOauth } from '../../database/esim-schema'

export default defineEventHandler(async () => {
  return esimDb.select().from(naverOauth)
})
