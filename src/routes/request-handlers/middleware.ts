import { Request, Response } from 'express'

import { initAdminSession } from 'db/sessions'

import { Record, String, Static, Runtype } from 'runtypes'

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

class WrappedResponse {
  private res: Response

  constructor(res: Response) {
    this.res = res
  }

  createSession = async (user: Admins.Schema): Promise<Admins.Schema> => {
    const oneWeekExpiry = 1000 * 60 * 60 * 24 * 7

    const uuid = await initAdminSession(user)

    this.res.cookie(
      'admin_session',
      uuid,
      {
        maxAge: oneWeekExpiry,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    )

    return user
  }
}

export const route = <T>(
  handler: (req: Request, res: WrappedResponse) => Result<Promise<Result<T, string>>, string>
) => {
  return async (req: Request, res: Response) => {
    const response = new WrappedResponse(res)

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
