import { Request, Response } from 'express'

import { SessionManager } from 'routes/session'
import { DecodeResult } from 'routes/parser'
import { ResultAsync } from 'neverthrow'
import * as Errors from 'errors'
import logger from 'logger'

type RouteError = Errors.RouteError

interface AppData<T> {
  data: T
  sessionToken?: string
}

export namespace AppData {
  export const init = <T>(data: T, sessionToken?: string): AppData<T> => ({
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
      return {
        statusCode: 404,
        errorMsg: 'Not Found',
      }
    }

    case 'Other': {
      const errorInfo = [
        err.error ? err.error : '',
        `Context: ${err.context}`,
      ]
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

export const route = <T>(handler: RouteHandler<T>) => {
  return async (req: Request, res: Response) => {
    const sessionMgr = new SessionManager(req)

    handler(req, sessionMgr)
      .map((action) => {
        action
          .map((appData) => {
            res.status(200).json(appData)
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
}
