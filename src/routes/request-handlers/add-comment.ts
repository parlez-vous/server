import { addComment } from 'db/actions'
import { route, getMeta, decode } from './middleware'

import { Record, String, Number, Null, Static } from 'runtypes'

import { Result } from 'utils'

export type Comment = Static<typeof commentDecoder>

const commentDecoder = Record({
  body: String,
  authorId: Number.Or(Null),
  parentId: Number.Or(Null),
})

export const handler = route(async (req) => {
  const metadata = getMeta(req)

  if (metadata.isErr()) {
    return new Result.Err('Invalid metadata')
  }

  const body = decode<Comment>(commentDecoder, req.body)
  
  if (body.isErr()) {
    return new Result.Err('Invalid request body')
  }

  return addComment({
    meta: metadata.unwrap(),
    body: body.unwrap(),
  })
})
