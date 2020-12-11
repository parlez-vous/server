/**
 * Contains shared output types that are used by request handlers
 */

import { Comment } from 'db/types'

// replies here represent ids of comments
export type FlattenedComment = Comment.WithAuthor & {
  replyIds: Array<Comment['id']>
  isLeaf: boolean
}

