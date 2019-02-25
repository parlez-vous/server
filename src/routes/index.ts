import { Router } from 'express'

import { fetchComments, addComment, adminSignup } from './request-handlers'

const rootRouter = Router()

const postsRouter = Router()


postsRouter
  .get('/:id/comments', fetchComments)
  .post('/:id/comments', addComment)

rootRouter.use('/posts', postsRouter)


const adminRouter = Router()

adminRouter
  .post('/signup', adminSignup)

rootRouter.use('/admins', adminRouter)

export default rootRouter
