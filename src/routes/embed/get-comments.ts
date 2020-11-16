import { route, AppData } from 'routes/middleware'

import { ResultAsync } from 'neverthrow'
import * as rt from 'runtypes'
import { Comment, Id } from 'db/types'
import { decode } from 'routes/parser'
import { findOrCreatePost, getComments, getSingleSite } from 'db/actions'
import * as Errors from 'errors'

type RouteError = Errors.RouteError

interface CommentResponse {
  comments: Comment[]
  siteVerified: boolean
}

const getSiteComments = (
  siteId: Id,
  postId: string
): ResultAsync<CommentResponse, RouteError> =>
  getSingleSite(siteId)
    .andThen((site) =>
      findOrCreatePost(postId, site.id).map((post) => ({ post, site }))
    )
    .andThen(({ post, site }) =>
      getComments(site.id, post.id).map((comments) => ({
        comments,
        siteVerified: site.verified,
      }))
    )

const requestParamsDecoder = rt.Record({
  siteId: rt.String,
  postId: rt.String,
})

export const handler = route<CommentResponse>((req, _) =>
  decode(requestParamsDecoder, req.params, 'Url params not valid').map(
    ({ siteId, postId }) =>
      // Currently assuming that siteId is always the site's hostname value
      // and not a cuid
      getSiteComments({ type_: 'Canonical', val: siteId }, postId).map(
        AppData.init
      )
  )
)
