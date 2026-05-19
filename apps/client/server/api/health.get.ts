export default defineEventHandler(() => ({
  status: 'ok',
  app: 'nomacom-client',
  commit: process.env.GIT_COMMIT ?? 'unknown',
  timestamp: new Date().toISOString(),
}))
