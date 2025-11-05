// Constants
export const APP_NAME = 'Next.js Template';
export const APP_DESCRIPTION = 'Ein vollständiges Next.js Starter-Template mit Prisma & MongoDB';

export const API_ROUTES = {
  USERS: '/api/users',
  POSTS: '/api/posts',
} as const;

export const DATABASE_MESSAGES = {
  CONNECTED: '✅ Connected',
  DISCONNECTED: '❌ Disconnected',
  ERROR: 'Failed to connect to database',
} as const;
