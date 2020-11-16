export type RouteError =
  | { type: 'NotFound'; context?: string }
  | { type: 'Conflict'; context?: string }
  | { type: 'Other'; error?: Error; context?: string }
  | { type: 'MissingHeader' }
  | { type: 'InvalidToken' }
  | { type: 'InvalidSession' }
  | { type: 'BadRequest'; context: string }

export const notFound = (context?: string): RouteError => ({
  type: 'NotFound',
  context,
})

export const conflict = (context?: string): RouteError => ({
  type: 'Conflict',
  context,
})

export const other = (context: string, error?: Error): RouteError => ({
  type: 'Other',
  context,
  error,
})

export const missingHeader = (): RouteError => ({
  type: 'MissingHeader',
})

export const invalidToken = (): RouteError => ({
  type: 'InvalidToken',
})

export const invalidSession = (): RouteError => ({
  type: 'InvalidSession',
})

export const badRequest = (context: string): RouteError => ({
  type: 'BadRequest',
  context,
})
