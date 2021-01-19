import { recordCommentVote } from 'db/actions'
import { cuid } from 'db/types'
import * as rt from 'runtypes'
import { protectedRoute, AppData } from 'router'
import { decode } from 'routes/parser'
import { cuidDecoder } from 'routes/parser-utils'

const voteDecoder = rt.Record({
  // request body
  vote: rt.Union(rt.Literal(1), rt.Literal(0), rt.Literal(-1)),

  // request params
  commentId: cuidDecoder,
})

export const handler = protectedRoute<null>((req, user) => {
  return decode(voteDecoder, {
    ...req.body,
    ...req.params,
  }).map(({ vote, commentId }) =>
    recordCommentVote(vote, user, cuid(commentId)).map(() => AppData.init(null))
  )
})
