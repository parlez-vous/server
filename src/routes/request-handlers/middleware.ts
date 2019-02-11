import { Request, RequestHandler } from 'express'

import { RequestData } from './types'

import { Result, isUUID } from 'utils'


type Type
  = 'string'
  | 'number'
  | 'null'

export interface RequestBodyInfo<T> {
  fieldName: keyof T
  type: Array<Type>
}

type RawBody = {
  [k: string]: any
}

const getRequestBody = <T>(
  requestBody: RawBody,
  bodyInfo: Array<RequestBodyInfo<T>>
): Result<T, string> => {
  return bodyInfo.reduce((kvMap: Result<T, string>, info) => {
    if (kvMap.isErr()) {
      return kvMap
    }

    const fieldName = info.fieldName as string

    const bodyValue = requestBody[fieldName]

    if (!bodyValue) {
      return Result.err(`Missing field: ${fieldName}`)
    }

    const validType = info.type.some((t) =>
      t === 'null'
        ? bodyValue === null
        : typeof bodyValue === t
    )

    if (!!bodyValue && validType) {
      return kvMap.map(val => ({
        ...val,
        [fieldName]: bodyValue
      }))
    }

    return Result.err('invalid request body')
  }, Result.ok({} as T))
}

export const deserializeRequest = <T = null>(
  req: Request,
  bodyKeys?: Array<RequestBodyInfo<T>>,
): Result<RequestData<T>, string> => {
  const host = req.hostname
  
  const validUUID = typeof req.params.id === 'string' && isUUID(req.params.id)
  
  if (!validUUID) {
    return Result.err('Invalid request path.')
  }

  const uuid = req.params.id as string

  // TODO: prevent "localhost" as host in production

  if (!!bodyKeys && !req.body) {
    return Result.err([
      'Missing request body.',
      'Required Fields:',
      bodyKeys.map(k => k.fieldName).join(', ')
    ].join('\n'))
  }

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
  action: (data: RequestData<D>) => Promise<Result<U, string>>,
  bodyParams?: Array<RequestBodyInfo<D>>
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
