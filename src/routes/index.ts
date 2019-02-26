import { Router } from 'express'

import {
  fetchComments,
  addComment,
  adminSignup,
  adminSignin,
  adminSignout,
 } from './request-handlers'

const rootRouter = Router()

rootRouter.use(
  '/posts',
  Router()
    .get('/:id/comments', fetchComments)
    .post('/:id/comments', addComment)
)

rootRouter.use(
  '/admins',
  Router()
    .post('/signup', adminSignup)
    .post('/signin', adminSignin)
    .post('/signout', adminSignout)
)

export default rootRouter
