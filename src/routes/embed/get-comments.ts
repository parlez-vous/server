import { route, AppData } from 'routes/middleware'

import { ResultAsync } from 'neverthrow'
import * as rt from 'runtypes'
import { Comment, Id, canonicalId, CanonicalId, cuid } from 'db/types'
import { commentTreeLeafState } from 'db/comment-cache'
import { decode } from 'routes/parser'
import { findOrCreatePost, getComments, getSingleSite } from 'db/actions'
import * as Errors from 'errors'

type RouteError = Errors.RouteError

interface CommentResponse {
  comments: Comment.WithRepliesAndAuthor[]
  leafIds: string[]
  siteVerified: boolean
  postId: string
}

const getSiteComments = (
  siteId: Id,
  postId: CanonicalId
): ResultAsync<CommentResponse, RouteError> =>
  getSingleSite(siteId)
    .andThen((site) =>
      findOrCreatePost(postId, cuid(site.id)).map((post) => ({ post, site }))
    )
    .andThen(({ post, site }) =>
      getComments(site.id, post.id).map((comments) => ({
        comments,
        siteVerified: site.verified,
        postId: post.id,
        leafIds: commentTreeLeafState.getLeafCommentsForPost(cuid(post.id)),
      }))
    )

const requestParamsDecoder = rt.Record({
  siteId: rt.String,
  postId: rt.String,
})

export const handler = route<CommentResponse>((req, _) =>
  decode(requestParamsDecoder, req.params, 'Url params not valid').map(
    ({ siteId, postId }) => {
      const siteId_ = canonicalId(siteId)
      const postId_ = canonicalId(postId)

      // Currently assuming that siteId is always the site's hostname value
      // and not a cuid
      return getSiteComments(siteId_, postId_).map(AppData.init)
    }
  )
)
