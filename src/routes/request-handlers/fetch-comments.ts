import { fetchComments } from 'db/actions'
import { handleRequest } from './middleware'

import { metaDecoder } from 'routes/request-handlers/middleware'

export const handler = handleRequest(
  fetchComments,
  null,
  metaDecoder
)
