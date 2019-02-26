import { Request, Response } from 'express'

import { initAdminSession, destroyAdminSession } from 'db/sessions'

import { Record, String, Static, Runtype } from 'runtypes'
import * as cookie from 'cookie'

import { Admins } from 'db/types'
import { Result, isUUID } from 'utils'


const metaDecoder = Record({
  id: String.withConstraint(s => isUUID(s) || 'path must be valid uuid'),
  host: String
})

export type Meta = Static<typeof metaDecoder>


export const getMeta = (req: Request): Result<Meta, string> => {
  const rawMeta = {
    id: req.params.id,
    host: req.hostname
  }

  return decode(metaDecoder, rawMeta, 'Invalid request metadata')
}

export const decode = <T>(decoder: Runtype<T>, raw: unknown, msg?: string): Result<T, string> => {
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

enum CookieField {
  Admin = 'admin_session'
}

class WrappedResponse {
  private req: Request
  private res: Response

  constructor(res: Response, req: Request) {
    this.res = res
    this.req = req
  }

  createSession = async (user: Admins.Schema): Promise<Result<Admins.Schema, string>> => {
    const oneWeekExpiry = 1000 * 60 * 60 * 24 * 7

    const sessionResult = await initAdminSession(user)

    return sessionResult.mapOk((uuid) => {
      this.res.cookie(
        CookieField.Admin,
        uuid,
        {
          maxAge: oneWeekExpiry,
          httpOnly: true,
          sameSite: true,
          secure: process.env.NODE_ENV === 'production'
        }
      )
  
      return user
    })
  }

  destroySession = async (): Promise<Result<string, string>> => {
    try {
      const cookieHeader = this.req.get('Cookie')

      if (!cookieHeader) {
        // User-Agent does not have any cookies
        return Result.err('Unable to destroy session')
      }

      const cookies = cookie.parse(cookieHeader)

      const sessionCoookie = cookies[CookieField.Admin]
      
      if (!sessionCoookie) {
        return Result.err('Unable to destroy session')
      }

      const sessionResult = await destroyAdminSession(sessionCoookie)

      return sessionResult.mapOk(() => {
        this.res.clearCookie(CookieField.Admin)
        
        return 'Successfully deauthenticated user'
      })
    } catch (e) {
      return Result.err('Error while parsing cookie header')
    }
  }
}

export const route = <T>(
  handler: (req: Request, res: WrappedResponse) => Result<Promise<Result<T, string>>, string>
) => {
  return async (req: Request, res: Response) => {
    const response = new WrappedResponse(res, req)

    handler(req, response)
      .mapOk(async (action) => {
        const result = await action

        result
          .mapOk((data) => {
            // TODO: implement enum to map to http status codes
            res.status(200).json({ data })
          })
          .mapErr((error) => {
            res.status(400).json({ error })
          })
      })
      .mapErr((error) => {
        // TODO: implement enum to map to http status codes
        res.status(400).json({ error })
      })
  }
}
