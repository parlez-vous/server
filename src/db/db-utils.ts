import { ResultAsync } from 'neverthrow'
import { Nullable } from './types'
import * as Errors from 'errors'

type RouteError = Errors.RouteError

// Reduces boilerplate needed to "connect" optional models together in a prisma query
export const connectOptionalById = <T>(
  fieldName: string,
  value: Nullable<T>
) => {
  if (value) {
    return {
      [fieldName]: { connect: { id: value } },
    }
  }

  return {}
}

const mapPrismaErrorToRouteError = (err: Error): RouteError => {
  // https://github.com/prisma/prisma-client-js/issues/914
  if (
    err.message.includes(
      'Expected a valid parent ID to be present for a nested connect on a one-to-many relation.'
    )
  ) {
    return Errors.notFound('You specified an ID that is not valid')
  }

  // Example: Unique constraint failed on the fields: (`email`)
  if (err.message.includes('Unique constraint failed on the fields')) {
    return Errors.conflict()
  }

  return Errors.other('Could not find an appropriate error', err)
}

export const wrapPrismaQuery = <T>(
  descriptor: string,
  query: Promise<T>
): ResultAsync<T, RouteError> =>
  ResultAsync.fromPromise(query, (prismaError) => {
    if (prismaError instanceof Error) {
      return mapPrismaErrorToRouteError(prismaError)
    } else {
      return Errors.other(`[${descriptor}] - Unkown Error: ${prismaError}`)
    }
  })
