import { fetchComments } from 'db/actions'
import { route, getMeta } from './middleware'

import { Result } from 'utils'
import { Comments } from 'db/types'

export const handler = route(async (req) => {
  type Ok = Array<Comments.Schema>
  type Err = string

  const metadata = getMeta(req)

  if (metadata.isErr()) {
    return new Result.Err<Ok, Err>('invalid request')
  }

  return fetchComments(metadata.unwrap())
})
