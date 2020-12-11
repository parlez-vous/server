import { route, AppData } from 'router'

import { ResultAsync } from 'neverthrow'
import * as rt from 'runtypes'
import {
  Comment,
  Id,
  canonicalId,
  CanonicalId,
  Cuid,
  cuid,
  Site,
} from 'db/types'
import { commentTreeLeafState } from 'db/comment-cache'
import { decode } from 'routes/parser'
import { findOrCreatePost, getComments, getSingleSite } from 'db/actions'
import * as Errors from 'errors'
import { FlattenedComment } from '../output'
import { isCuid, omit } from 'utils'

type RouteError = Errors.RouteError

// RecursiveCommentTree is a comment with an indefinite level of nested replies / comments
type RecursiveCommentTree = Comment.WithRepliesAndAuthor[]

type CommentsMap = Record<Comment['id'], FlattenedComment>

interface CommentResponse {
  comments: CommentsMap
  topLevelComments: Array<Comment['id']>
  siteVerified: boolean
  postId: Site['id']
}

const flattenRecursiveCommentTree = (
  tree: RecursiveCommentTree,
  postId: Cuid,
  leafIds: Array<Comment['id']>
): CommentsMap =>
  tree.reduce((flattened, comment) => {
    const [replyIds, flattenedReplies] = comment.replies
      ? // note that these operations are _NOT_ running in parallel.
        // they are running sequentially.
        [
          comment.replies.map(({ id }) => id),
          flattenRecursiveCommentTree(comment.replies, postId, leafIds),
        ]
      : [[], {} as CommentsMap]

    const withoutReplies = omit(comment, ['replies'])

    const flattenedComment: FlattenedComment = {
      ...withoutReplies,
      replyIds,
      isLeaf: leafIds.includes(withoutReplies.id),
    }

    return {
      ...flattened,
      ...flattenedReplies,
      [flattenedComment.id]: flattenedComment,
    }
  }, {})

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

      return getComments(site.id, filters).map((comments) => {
        const postCuid = cuid(post.id)
        const leafIds = commentTreeLeafState.getLeafCommentsForPost(postCuid)
        const commentsMap = flattenRecursiveCommentTree(
          comments,
          postCuid,
          leafIds
        )
        const topLevelComments = comments.map(({ id }) => id)

        return {
          comments: commentsMap,
          siteVerified: site.verified,
          postId: post.id,
          topLevelComments,
        }
      })
    })

const cuidDecoder = rt.String.withConstraint(isCuid)

const requestParamsDecoder = rt.Record({
  siteId: rt.String,
  postId: rt.String,
  parentCommentId: cuidDecoder.Or(rt.Undefined),
})

export const handler = route<CommentResponse>((req, _) =>
  decode(
    requestParamsDecoder,
    { ...req.params, ...req.query },
    'invalid data'
  ).map(({ siteId, postId, parentCommentId }) => {
    const siteId_ = canonicalId(siteId)
    const postId_ = canonicalId(postId)
    const parentCommentId_ = parentCommentId ? cuid(parentCommentId) : undefined

    // Currently assuming that siteId is always the site's hostname value
    // and not a cuid
    return getSiteComments(siteId_, postId_, parentCommentId_).map(AppData.init)
  })
)
