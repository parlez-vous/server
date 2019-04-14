import { Request, Response } from 'express'

import { AuthError, SessionManager } from 'routes/session'
import { DbError } from 'db/types'
import { DecodeResult } from 'routes/parser'
import { Result } from 'utils'


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

export type RouteError
  = AuthError
  | DbError


interface RouteErrorHttpResponse {
  statusCode: number
  errorMsg: string
}

const mapRouteError = (err: RouteError): RouteErrorHttpResponse => {
  switch (err) {
    case AuthError.InvalidToken: {
      return {
        statusCode: 400,
        errorMsg: 'Invalid Token Format'
      }
    }

    case AuthError.MissingHeader: {
      return {
        statusCode: 400,
        errorMsg: 'Missing `Authorization` header'
      }
    }

    case AuthError.InvalidSession: {
      return {
        statusCode: 401,
        errorMsg: 'Invalid Session'
      }
    }

    case AuthError.Signup: {
      const errorMsg = [
        'Error while signing up',
        'Username must be between 3 and 30 characters in length',
        'Password must be between 8 and 72 characters in length',
      ].join('. ')

      return {
        statusCode: 400,
        errorMsg  
      }
    }

    case DbError.Conflict: {
      return {
        statusCode: 409,
        errorMsg: 'Conflict'
      }
    }

    case DbError.NotFound: {
      return {
        statusCode: 404,
        errorMsg: 'Not Found'
      }
    }

    case DbError.Other: {
      return {
        statusCode: 500,
        errorMsg: 'An Internal Error Occurred :('
      }
    }
  }
}


export type RouteResult<T> = Result<AppData<T>, RouteError>

export const route = <T>(
  handler: (req: Request, res: SessionManager) => DecodeResult<Promise<RouteResult<T>>>
) => {
  return async (req: Request, res: Response) => {
    const sessionMgr = new SessionManager(req)

    handler(req, sessionMgr)
      .mapOk(async (action) => {
        const result = await action

        result
          .mapOk((appData) => {
            res.status(200).json(appData)
          })
          .mapErr((error) => {
            const { statusCode, errorMsg } = mapRouteError(error)
            res.status(statusCode).json({ error: errorMsg })
          })
      })
      .mapErr((parseError) => {
        res.status(400).json({ 
          error: parseError 
        })
      })
  }
}
