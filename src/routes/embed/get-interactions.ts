import { getPostCommentVotesForUser } from 'db/actions'
import { CommentVote, Interactions, Id, User, canonicalId } from 'db/types'
import { RouteError } from 'errors'
import { protectedRoute, AppData } from 'router'
import { decode } from 'routes/parser'
import { ResultAsync } from 'neverthrow'
import { postIdDecoder } from 'routes/parser-utils'

type CommentVoteMap = Record<CommentVote['comment_id'], CommentVote>

const intoInteractions = (commentVotes: CommentVote[]): Interactions => ({
  commentVotes: commentVotes.reduce(
    (dictionary, vote) => ({
      ...dictionary,
      [vote.comment_id]: vote,
    }),
    {} as CommentVoteMap
  ),
})

const getInteractionsForUser = (
  user: User.WithoutPassword,
  postId: Id
): ResultAsync<Interactions, RouteError> =>
  getPostCommentVotesForUser(user, postId).map(intoInteractions)

export const handler = protectedRoute<Interactions>((req, user) =>
  decode(
    postIdDecoder(req.hostname),
    req.query.postId,
    'Invalid request body'
  ).map((postId) => {
    // FIXME: assuming postId is always canonical for now
    const canonicalPostId = canonicalId(postId)

    return getInteractionsForUser(user, canonicalPostId).map(AppData.init)
  })
)
