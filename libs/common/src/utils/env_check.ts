import * as process from 'process'

export enum APP_ENV {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
}
export function isProductionEnv (): boolean {
  const currentEnv = process.env.NODE_ENV
  return currentEnv === APP_ENV.PRODUCTION
}

export function isDevelopmentEnv (): boolean {
  const currentEnv = process.env.NODE_ENV
  return currentEnv === APP_ENV.DEVELOPMENT
}
