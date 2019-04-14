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
            // TODO: implement enum to map to http status codes
            res.status(400).json({ error })
          })
      })
      .mapErr((parseError) => {
        res.status(400).json({ 
          error: parseError 
        })
      })
  }
}
