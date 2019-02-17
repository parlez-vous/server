import { Router } from 'express'

import { fetchComments, addComment } from './request-handlers'

const rootRouter = Router()

const postsRouter = Router()

// const newsletterRouter = Router ()

postsRouter
  .get('/:id/comments', fetchComments)
  .post('/:id/comments', addComment)

rootRouter.use('/posts', postsRouter)

export default rootRouter
