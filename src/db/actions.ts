import db from './index'
import { Result } from 'utils'

import { Comment } from 'routes/request-handlers/add-comment'

import { Comments, Posts, Sites } from './types'
import { RequestData } from 'routes/request-handlers/types'

export const fetchComments = async ({
  postId,
  host,
}: RequestData): Promise<Result<Array<Comments.Schema>, string>> => {
  try {
    const comments = await db(Comments.Table.name)
      .select(`${Comments.Table.name}.*`)
      .join(
        Posts.Table.name,
        `${Comments.Table.name}.${Comments.Table.cols.post_id}`,
        `${Posts.Table.name}.${Posts.Table.cols.id}`
      )
      .join(
        Sites.Table.name,
        `${Posts.Table.name}.${Posts.Table.cols.site_id}`,
        `${Sites.Table.name}.${Sites.Table.cols.id}`
      )
      .where(
        `${Posts.Table.name}.${Posts.Table.cols.uuid}`,
        postId
      )
      .andWhere(
        `${Sites.Table.name}.${Sites.Table.cols.hostname}`,
        host
      )
  
    return Result.ok(comments)
  } catch (e) {
    // TODO: log `e`
    console.log(e)
    return Result.err('Error while retrieving comments')
  }
}


export const addComment = async ({ postId, body }: RequestData<Comment>): Promise<Result<Comments.Schema, string>> => {
  try {
    const comment = await db(Comments.Table.name)
      .insert({
        post_id: postId,
        parent_id: body.parentId,
        author_id: body.authorId,
        body: body.body,
      })
      .returning('*')

    return Result.ok(comment)
  } catch (e) {
    return Result.err('Error while creating comment')
  }
}
