import { Uuid } from 'db/types'

export interface RequestInfo<B = null> {
  postId: Uuid
  host: string
  body?: B
}
