import { Request, Response } from 'express'

import { initAdminSession } from 'db/sessions'
import { getAdminFromSession } from 'db/actions'

import { String, Runtype } from 'runtypes'

import { Admins, Uuid } from 'db/types'
import { Result, isUUID } from 'utils'


export const getAuthToken = (authHeader: string): Result<string, AuthorizationError> => {
  const uuidDecoder = String.withConstraint(
    s => isUUID(s)
  )

  return decode(uuidDecoder, authHeader)
    .mapErr(() => AuthorizationError.InvalidToken)
}


export type DecodeResult<T> = Result<T, string>

export const decode = <T>(decoder: Runtype<T>, raw: unknown, msg?: string): DecodeResult<T> => {
  try {
    const parsed = decoder.check(raw)

    return Result.ok(parsed)
  } catch (e) {
    return Result.err(msg || 'Invalid data')
  }
}

// export enum RouteError {

// }

// export enum DbError {
//   NotFound,
//   ???
// }

export enum AuthorizationError {
  MissingHeader,
  InvalidToken,
}

export namespace AuthorizationError {
  export const toString = (e: AuthorizationError): string => {
    switch (e) {
      case AuthorizationError.InvalidToken: {
        return 'Invalid Token'
      }

      case AuthorizationError.MissingHeader: {
        return 'Missing `Authorization` header'
      }
    }
  }
}

export enum SessionError {
  InvalidSession,
}

export namespace SessionError {
  export const toString = (e: SessionError): string => {
    switch (e) {
      case SessionError.InvalidSession: {
        return 'Invalid Session'
      }
    }
  }
}

class SessionManager {
  private req: Request

  constructor(req: Request) {
    this.req = req
  }

  private getSessionToken = (): Result<string, AuthorizationError> => {
    const authHeader = this.req.get('Authorization')

    if (!authHeader) {
      return Result.err(AuthorizationError.MissingHeader)
    }

    return getAuthToken(authHeader)
  }

  getSessionUser = (): Result<Promise<Result<Admins.WithoutPassword, SessionError>>, AuthorizationError> => {

    return this
      .getSessionToken()
      .mapOk(async (token) => {
        const userResult = await getAdminFromSession(token)

        return userResult
          .mapOk(Admins.removePassword)
          .mapErr(() => SessionError.InvalidSession)
      })
  }

  createSession = async (user: Admins.Schema): Promise<Result<Uuid, string>> => {
    return initAdminSession(user)
  }
}




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

export const route = <T>(
  handler: (req: Request, res: SessionManager) => DecodeResult<Promise<Result<AppData<T>, string>>>
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
