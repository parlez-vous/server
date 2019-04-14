import { Router } from 'express'
import * as cors from 'cors'

import {
  adminSignup,
  adminSignin,
  getAdminProfile,
  getAdminSites
 } from './request-handlers'

const rootRouter = Router()

const corsOptions = {
  allowedHeaders : ['Authorization', 'Content-Type']
}

rootRouter.use(cors(corsOptions))

rootRouter.use(
  '/admins',
  Router()
    .post('/signup', adminSignup)
    .post('/signin', adminSignin)
    .get('/profile', getAdminProfile)
    .get('/sites', getAdminSites)
)

export default rootRouter
