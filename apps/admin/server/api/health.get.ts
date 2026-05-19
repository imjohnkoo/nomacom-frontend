export default defineEventHandler(() => ({
  status: 'ok',
  app: 'nomacom-admin',
  commit: process.env.GIT_COMMIT ?? 'unknown',
  timestamp: new Date().toISOString(),
}))
