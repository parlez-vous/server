import { Router } from 'express'

import {
  fetchComments,
  addComment,
  adminSignup,
  adminSignin,
  adminSignout,
 } from './request-handlers'

const rootRouter = Router()

const postsRouter = Router()


postsRouter
  .get('/:id/comments', fetchComments)
  .post('/:id/comments', addComment)

rootRouter.use('/posts', postsRouter)


const adminRouter = Router()

adminRouter
  .post('/signup', adminSignup)
  .post('/signin', adminSignin)
  .post('/signout', adminSignout)

rootRouter.use('/admins', adminRouter)

export default rootRouter
