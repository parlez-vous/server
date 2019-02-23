import { Request, RequestHandler } from 'express'

import { Record, String, Static, Runtype } from 'runtypes'

import { RequestData } from './types'

import { Result, isUUID } from 'utils'


export const metaDecoder = Record({
  id: String.withConstraint(s => isUUID(s) || 'path must be valid uuid'),
  host: String
})

export type Meta = Static<typeof metaDecoder>


const decode = <T, R extends Runtype<T>>(decoder: R, raw: unknown): Result<T, string> => {
  try {
    const parsed = decoder.check(raw)

    return Result.ok(parsed)
  } catch (e) {
    return Result.err('Invalid data')
  }
}

export const deserializeRequest = <B, M, R1 extends Runtype<B>, R2 extends Runtype<M>>(
  req: Request,
  bodyDecoder?: R1,
  metaDecoder?: R2,
): Result<RequestData<B, M>, string> => {
  const rawMeta = {
    id: req.params.id,
    host: req.hostname
  }
  
  const meta = metaDecoder
    ? decode(metaDecoder, rawMeta)
    : Result.ok(null)

    
  if (meta.isErr()) {
    return Result.err('invalid metadata')
  }

  console.log('> Meta....')
  console.log(meta.unwrap())

  const body = bodyDecoder
    ? decode(bodyDecoder, req.body)
    : Result.ok(null)

  // TODO: prevent "localhost" as host in production

  if (body.isErr()) {
    return Result.err('invalid request body')
  }
  
  // TODO: unwrap is dangerous,
  // think of better way to "unwrap"
  return Result.ok({
    meta: meta.unwrap(),
    body: body.unwrap(),
  })
}

export const handleRequest = <U, D, M, R1 extends Runtype<D>, R2 extends Runtype<M>>(
  action: (data: RequestData<D, M>) => Promise<Result<U, string>>,
  bodyDecoder?: R1,
  metaDecoder?: R2,
): RequestHandler  => {
  return (req, res) => {
    deserializeRequest<D, M, R1, R2>(req, bodyDecoder, metaDecoder)
      .mapOk(action)
      .mapErr(e => {
        res.status(400).json({ err: e })
      })
      .map((p) => {
        p.then((result) => {
          result
            .mapOk((actionSuccess) => {
              res.status(200).json(actionSuccess)
            })
            .mapErr((e) => {
              res.status(400).json({ err: e })
            })
        })
      })
  }
}
