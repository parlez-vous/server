import { Uuid } from 'db/types'

export interface RequestData<B = null> {
  postId: Uuid
  host: string
  body?: B
}
