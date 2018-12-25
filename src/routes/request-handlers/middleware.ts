import { Request, RequestHandler } from 'express'

import { RequestInfo } from './types'

import { Result } from 'utils'

type Type
  = 'string'
  | 'number'

export interface RequestBodyInfo {
  name: string
  type: Type
}


type RawBody = {
  [k: string]: any
}

const getRequestBody = <T>(
  requestBody: RawBody,
  bodyInfo: Array<RequestBodyInfo>
): Result<T, string> => {
  return bodyInfo.reduce((kvMap: Result<T, string>, info) => {
    if (kvMap.isErr()) {
      return kvMap
    }

    const bodyValue = requestBody[info.name]

    if (!!bodyValue && typeof bodyValue === info.type) {
      return kvMap.map(val => ({
        ...val,
        [info.name]: bodyValue
      }))
    }

    return Result.err('invalid request body')
  }, Result.ok({} as T))
}

export const deserializeRequest = <T = null>(
  req: Request,
  bodyKeys?: Array<RequestBodyInfo>,
): Result<RequestInfo<T>, string> => {
  const uuid = req.params.id
  const host = req.hostname

  // TODO: assert that req.params.id is
  // in fact a UUID

  const body = !!bodyKeys && !!req.body
    ? getRequestBody<T>(req.body, bodyKeys)
    : Result.ok(null as null)

  if (body.isErr()) {
    return Result.err('invalid request body')
  }

  return Result.ok({
    postId: uuid,
    host,
    body: body.unwrap()
  })
}

export const handleRequest = <U, D = null>(
  action: (data: RequestInfo<D>) => Promise<Result<U, string>>,
  bodyParams?: Array<RequestBodyInfo>
): RequestHandler  => {
  return (req, res) => {
    deserializeRequest<D>(req, bodyParams)
      .map(action)
      .mapErr(e => {
        res.status(400).json({ err: e })
      })
      .map((p) => {
        p.then((result) => {
          result
            .map((actionSuccess) => {
              res.status(200).json(actionSuccess)
            })
            .mapErr(() => {
              res.sendStatus(500)
            })
        })
      })
  }
}
