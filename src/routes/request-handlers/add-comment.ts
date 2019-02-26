import { addComment } from 'db/actions'
import { route, getMeta, decode } from './middleware'

import { Record, String, Number, Null, Static } from 'runtypes'

export type Comment = Static<typeof commentDecoder>

const commentDecoder = Record({
  body: String,
  authorId: Number.Or(Null),
  parentId: Number.Or(Null),
})

export const handler = route((req) => {
  return getMeta(req).extendOk(meta => {
    return decode(commentDecoder, req.body).mapOk((body) => {
      return addComment({ meta, body })
    })
  })
})
