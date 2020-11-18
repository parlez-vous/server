/**
 * This cache holds the set of leaf comments per post.
 *
 *
 *
 * Data Structure:
 * -----------------
 *
 * {
 *   [PostID]: Set<CommentId> <-- Stores the set of leaf nodes
 * }
 *
 *
 * This helps to inform the front end of which paths in the comment tree are not yet completed / loaded.
 *
 * When calling getComments you get a recursive tree of comments
 * But you don't yet know if the tree is "complete"
 *    in other words, the leaf nodes may not actually be leaf nodes. You simply hit the depth limit in your query.
 */

// Consider maybe moving this logic into redis.
// Although GCP MemoryStore for Redis does not currently support presistence.
// https://github.com/luin/ioredis

import { ResultAsync } from 'neverthrow'
import { client } from './client'
import * as Errors from 'errors'
import { Comment, Cuid } from './types'
import { wrapPrismaQuery } from './db-utils'

type RouteError = Errors.RouteError

type CommentId = string

type CommentTreeState = {
  [postId: string]: CommentId[]
}

class CommentTreeCache {
  private commentTree: CommentTreeState = {}

  public async loadCommentTreeState(): Promise<void> {
    const treeState = await client.commentTreeState.findMany()

    this.commentTree = treeState.reduce((state, postTreeState) => {
      return {
        ...state,
        [postTreeState.post_id]: postTreeState.comment_tree_leafs as CommentId[],
      }
    }, {} as CommentTreeState)
  }

  public addComment(
    postId: Cuid,
    comment: Comment
  ): ResultAsync<{}, RouteError> {
    const postLeafCommentIds: string[] | undefined = this.commentTree[
      postId.val
    ]

    if (postLeafCommentIds) {
      // if comment has a parent, then remove parent and add new comment id
      const newTreeLeafStateForPost = postLeafCommentIds
        .filter((id) => id !== comment.parent_comment_id)
        .concat(comment.id)

      // update cache
      this.commentTree[postId.val] = newTreeLeafStateForPost

      return wrapPrismaQuery(
        'CommentTreeCache.addComment.updateState',
        client.commentTreeState.update({
          select: null,
          where: {
            /* eslint-disable @typescript-eslint/camelcase */
            post_id: postId.val,
          },
          data: {
            /* eslint-disable @typescript-eslint/camelcase */
            comment_tree_leafs: newTreeLeafStateForPost,
          },
        })
      )
    } else {
      // create tree state for first comment in post
      const leafComments = [comment.id]

      this.commentTree[postId.val] = leafComments

      return wrapPrismaQuery(
        'CommentTreeCache.addComment.createState',
        client.commentTreeState.create({
          select: null,
          data: {
            /* eslint-disable @typescript-eslint/camelcase */
            comment_tree_leafs: leafComments,
            post: {
              connect: {
                id: postId.val,
              },
            },
          },
        })
      )
    }
  }

  public getLeafCommentsForPost(postId: Cuid): CommentId[] {
    return this.commentTree[postId.val] || []
  }
}

export const commentTreeLeafState = new CommentTreeCache()
