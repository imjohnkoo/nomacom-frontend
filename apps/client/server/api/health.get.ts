export default defineEventHandler((event) => ({
  status: 'ok',
  app: 'nomacom-client',
  commit: process.env.GIT_COMMIT ?? 'unknown',
  timestamp: new Date().toISOString(),
  auth: event.context.auth ?? null,
}))
