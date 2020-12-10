import { route, AppData } from 'router'

import * as rt from 'runtypes'
import { Comment } from 'db/types'
import { decode } from 'routes/parser'
import { createComment } from 'db/actions'

const rawCommentDecoder = rt.Record({
  body: rt.String,
  parentCommentId: rt.String.Or(rt.Null),
  authorId: rt.String.Or(rt.Null),
  anonAuthorName: rt.String.Or(rt.Null),
})

const requestParamsDecoder = rt.Record({
  postId: rt.String,
})

const dataDecoder = requestParamsDecoder.And(rawCommentDecoder)

export const handler = route<Comment>((req, _) => {
  const data = {
    ...req.params,
    ...req.body,
  }

  return decode(dataDecoder, data).map(({ postId, ...rawComment }) =>
    createComment(postId, rawComment).map(AppData.init)
  )
})

