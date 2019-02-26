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

export const handler = route((req) => {
  const metadata = getMeta(req)

  if (metadata.isErr()) {
    return Result.err('Invalid metadata')
  }

  const body = decode<Comment>(commentDecoder, req.body)
  
  if (body.isErr()) {
    return Result.err('Invalid request body')
  }

  return Result.ok(addComment({
    meta: metadata.unwrap(),
    body: body.unwrap(),
  }))
})
