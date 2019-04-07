import { Router } from 'express'
import * as cors from 'cors'

import {
  adminSignup,
  adminSignin,
  getAdminProfile,
 } from './request-handlers'

const rootRouter = Router()

rootRouter.use(cors())

rootRouter.use(
  '/admins',
  Router()
    .post('/signup', adminSignup)
    .post('/signin', adminSignin)
    .get('/profile', getAdminProfile)
)

export default rootRouter
