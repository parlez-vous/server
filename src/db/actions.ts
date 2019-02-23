import db from './index'
import { Result } from 'utils'

import { Comment } from 'routes/request-handlers/add-comment'

import { Comments, Posts, Sites } from './types'
import { RequestData } from 'routes/request-handlers/types'
import { Meta } from 'routes/request-handlers/middleware'

export const fetchComments = async ({
  meta,
}: RequestData<null, Meta>): Promise<Result<Array<Comments.Schema>, string>> => {
  type Ok = Array<Comments.Schema>

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
        meta.id
      )
      .andWhere(
        `${Sites.Table.name}.${Sites.Table.cols.hostname}`,
        meta.host
      )
  
    return Result.ok<Ok, string>(comments)
  } catch (e) {
    // TODO: log `e`
    console.log(e)
    return Result.err<Ok, string>('Error while retrieving comments')
  }
}


export const addComment = async ({ body, meta }: RequestData<Comment, Meta>): Promise<Result<Comments.Schema, string>> => {
  type Ok = Comments.Schema

  try {
    const postId = await db(Posts.Table.name)
      .first('id')
      .where({ uuid: meta.id })

    if (!postId) {
      return Result.err<Ok, string>('Post not found')
    }

    const comment = await db(Comments.Table.name)
      .insert({
        post_id: postId,
        parent_id: body.parentId,
        author_id: body.authorId,
        body: body.body,
      })
      .returning('*')

    return Result.ok<Ok, string>(comment)
  } catch (e) {
    return Result.err<Ok, string>('Error while creating comment')
  }
}
