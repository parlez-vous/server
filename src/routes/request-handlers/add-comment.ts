import { handleRequest } from './middleware'

import { Record, String, Number, Null, Static } from 'runtypes'

import { addComment } from 'db/actions'

import { metaDecoder } from 'routes/request-handlers/middleware'

export type Comment = Static<typeof commentDecoder>

const commentDecoder = Record({
  body: String,
  authorId: Number.Or(Null),
  parentId: Number.Or(Null),
})

export const handler = handleRequest(addComment, commentDecoder, metaDecoder)
