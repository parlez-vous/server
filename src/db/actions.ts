import db from './index'
import { everything } from './utils'
import { Result } from 'utils'

import { Uuid, Comments, Posts, Sites } from './types'

interface PostInfo {
  postId: Uuid
  host: string
}

export const fetchComments = async ({
  postId,
  host
}: PostInfo): Promise<Result<Array<Comments.Schema>, string>> => {
  try {
    const comments = await db(Comments.Table.name)
      .select(everything(Comments.Table))
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
    return Result.err('Error while retrieving comments')
  }
}
