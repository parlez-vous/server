import { Router } from 'express'
import * as cors from 'cors'

import {
  fetchComments,
  addComment,
  adminSignup,
  adminSignin,
  adminSignout,
  getAdminSession,
 } from './request-handlers'

const rootRouter = Router()

rootRouter.use(cors())

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
    .get('/session_status', getAdminSession)
)

export default rootRouter
