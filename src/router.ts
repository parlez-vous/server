/**
 * Abstraction on top of express JS.
 *
 * Takes care of sending consistently-shaped data (see `AppData`), sends consistent HTTP status codes based on a type, etc.
 *
 * Namely the `route` and `protectedRoute` functions.
 *
 */
import { Request, Response } from 'express'

import { Admin } from 'db/types'
import { SessionManager } from 'routes/session'
import { DecodeResult } from 'routes/parser'
import { ResultAsync } from 'neverthrow'
import * as Errors from 'errors'
import logger from 'logger'
import { valueSerializer } from './routes/serialize'

type RouteError = Errors.RouteError

/**
 * Custom subset of the JSON spec that omits the 'password' field from JSON objects.
 *
 * source:
 *  - https://www.typescriptlang.org/play?#code/FDAuE8AcFMAICkDKB5AcgNQIYBsCu0BnYWE2AXlgDtcBbAI2gCdjSAfWA0RgS0oHMWJdtWzZBsdnQD2U7NEyVx7AN6wA2gGsAXBy68+AXR1I0WPIVgBfWADJYqyJgIEA7lMYATAPw7K0AG5MVkoIKBg4+ARqBiAgvKBMAGaYAMZwAApMBFKU9uK4BEyUmDTQOpw8-OKOzm6e5XpVpLCYfGVUtAzMlrEA9L2wABI0IyOwAHST4yApOZywBUzGYWaR5HnNi4zFpToARADi3O7cfFJ7ADTifpzQHjpq4s3KT82kABbcOgDkddge3yub2BVEICXu6leINIL2hcNINB27W+fGOgKh8NINVc7gh3wATABGfEAZmJJO+GOhPUxsBi1PEBiBpFa7XJwB6wCAA
 *  - https://stackoverflow.com/q/58594051/4259341
 */
export type JSONValues =
  | number
  | string
  | null
  | boolean
  | JSONObject
  | JSONValues[]

export type JSONObject = { [k: string]: JSONValues } & { password?: never }

interface AppData<T> {
  data: T
  sessionToken?: string
}

export namespace AppData {
  export const init = <T>(data: T, sessionToken?: string): AppData<T> => ({
    // note that this data is serialized to JSON before getting sent out of the server
    data,
    sessionToken,
  })
}

interface RouteErrorHttpResponse {
  statusCode: number
  errorMsg: string
}

const mapRouteError = (err: RouteError): RouteErrorHttpResponse => {
  switch (err.type) {
    case 'InvalidToken': {
      return {
        statusCode: 400,
        errorMsg: 'Invalid Token Format',
      }
    }

    case 'MissingHeader': {
      return {
        statusCode: 400,
        errorMsg: 'Missing `Authorization` header',
      }
    }

    case 'InvalidSession': {
      return {
        statusCode: 401,
        errorMsg: 'Invalid Session',
      }
    }

    case 'BadRequest': {
      return {
        statusCode: 400,
        errorMsg: err.context,
      }
    }

    case 'Conflict': {
      return {
        statusCode: 409,
        errorMsg: 'Conflict',
      }
    }

    case 'NotFound': {
      const withMaybeContext = err.context ? ` - ${err.context}` : ''

      return {
        statusCode: 404,
        errorMsg: `Not Found${withMaybeContext}`,
      }
    }

    case 'Other': {
      const errorInfo = [err.error ? err.error : '', `Context: ${err.context}`]
        .filter((val) => val !== '')
        .join('\n')

      logger.error(errorInfo)

      return {
        statusCode: 500,
        errorMsg: 'An Internal Error Occurred :(',
      }
    }
  }
}

type RouteResult<T> = ResultAsync<AppData<T>, RouteError>

type RouteHandler<T> = (
  req: Request,
  mgr: SessionManager
) => DecodeResult<RouteResult<T>>

/*
 * Sends appropriate HTTP responses for a RouteHandler<T>
 */
const wrapHandler = <T>(
  handlerResult: ReturnType<RouteHandler<T>>,
  res: Response,
): void => {
  handlerResult
    .map((action) => {
      action
        .map(({ sessionToken, data }) => {
          res.status(200).json({
            sessionToken,
            data: valueSerializer(data),
          })
        })
        .mapErr((error) => {
          const { statusCode, errorMsg } = mapRouteError(error)
          res.status(statusCode).json({ error: errorMsg })
        })
    })
    .mapErr((parseError) => {
      res.status(400).json({
        error: parseError,
      })
    })
}

export const route = <T>(
  handler: RouteHandler<T>,
) => {
  return (req: Request, res: Response) => {
    const sessionMgr = new SessionManager(req)

    wrapHandler(handler(req, sessionMgr), res)
  }
}

type PrivateRouteHandler<T> = (
  req: Request,
  admin: Omit<Admin, 'password'>
) => DecodeResult<RouteResult<T>>

export const protectedRoute = <T>(
  handler: PrivateRouteHandler<T>,
) => {
  return (req: Request, res: Response) => {
    const sessionMgr = new SessionManager(req)

    sessionMgr
      .getSessionUser()
      .map((adminWithoutPassword) =>
        wrapHandler(handler(req, adminWithoutPassword), res)
      )
      .mapErr((error) => {
        const { statusCode, errorMsg } = mapRouteError(error)
        res.status(statusCode).json({ error: errorMsg })
      })
  }
}
