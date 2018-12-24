import { Router } from 'express'

import { addVote, fetchComments } from './request-handlers'

const rootRouter = Router()

const postsRouter = Router()

// TODO: missing routes
// .post('/comments', addComment)
postsRouter
  .post('/vote', addVote)
  .get('/comments', fetchComments)

rootRouter.use('/posts/:id', postsRouter)

export default rootRouter
