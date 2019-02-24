import { Request, Response } from 'express'

import { Record, String, Static, Runtype } from 'runtypes'

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

  return decode(metaDecoder, rawMeta)
}

export const decode = <T>(decoder: Runtype<T>, raw: unknown): Result<T, string> => {
  try {
    const parsed = decoder.check(raw)

    return Result.ok(parsed)
  } catch (e) {
    return Result.err('Invalid data')
  }
}

// export enum RouteError {

// }

// export enum DbError {
//   NotFound,
//   ???
// }


export const route = <T>(handler: (req: Request) => Promise<Result<T, string>>) => {
  return async (req: Request, res: Response) => {
    const result = await handler(req)

    result
      .mapOk((data) => {
        // TODO: implement enum to map to http status codes
        res.status(200).json({ data })
      })
      .mapErr((error) => {
        // TODO: implement enum to map to http status codes
        res.status(400).json({ error })
      })
  }
}
