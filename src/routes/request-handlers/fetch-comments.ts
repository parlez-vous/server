import { fetchComments } from 'db/actions'
import { route, getMeta } from './middleware'

export const handler = route((req) =>
  getMeta(req).mapOk(fetchComments)
)
