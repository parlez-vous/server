import { route, AppData } from 'router'

import { ResultAsync } from 'neverthrow'
import * as rt from 'runtypes'
import { Comment, Id, canonicalId, CanonicalId, Cuid, cuid } from 'db/types'
import { commentTreeLeafState } from 'db/comment-cache'
import { decode } from 'routes/parser'
import { findOrCreatePost, getComments, getSingleSite } from 'db/actions'
import * as Errors from 'errors'
import { isCuid } from 'utils'

type RouteError = Errors.RouteError

interface CommentResponse {
  comments: Comment.WithRepliesAndAuthor[]
  leafIds: string[]
  siteVerified: boolean
  postId: string
}

const serializer = (data: CommentResponse) => ({
  ...data,
  comments: data.comments.map(Comment.serialize),
})

const getSiteComments = (
  siteId: Id,
  postId: CanonicalId,
  parentCommentId?: Cuid
): ResultAsync<CommentResponse, RouteError> =>
  getSingleSite(siteId)
    .andThen((site) =>
      findOrCreatePost(postId, cuid(site.id)).map((post) => ({ post, site }))
    )
    .andThen(({ post, site }) => {
      const filters = {
        postId: post.id,
        parentCommentId: parentCommentId?.val,
      }

      return getComments(site.id, filters).map((comments) => ({
        comments,
        siteVerified: site.verified,
        postId: post.id,
        leafIds: commentTreeLeafState.getLeafCommentsForPost(cuid(post.id)),
      }))
    })

const cuidDecoder = rt.String.withConstraint(isCuid)

const requestParamsDecoder = rt.Record({
  siteId: rt.String,
  postId: rt.String,
  parentCommentId: cuidDecoder.Or(rt.Undefined),
})

export const handler = route<CommentResponse>(
  (req, _) =>
    decode(
      requestParamsDecoder,
      { ...req.params, ...req.query },
      'invalid data'
    ).map(({ siteId, postId, parentCommentId }) => {
      const siteId_ = canonicalId(siteId)
      const postId_ = canonicalId(postId)
      const parentCommentId_ = parentCommentId
        ? cuid(parentCommentId)
        : undefined

      // Currently assuming that siteId is always the site's hostname value
      // and not a cuid
      return getSiteComments(siteId_, postId_, parentCommentId_).map(
        AppData.init
      )
    }),
  serializer
)
