import { fetchComments } from 'db/actions'
import { handleRequest } from './middleware'

export const handler = handleRequest(fetchComments)
