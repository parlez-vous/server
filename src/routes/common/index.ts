/*
 * Common routes shared between admin dashboard and embed app
 *
 */

import { Router } from 'express'

import { handler as signin } from './signin'
import { handler as signup } from './signup'
import { handler as getProfile } from './get-profile'

const router = Router()

router
  .post('/signup', signup)
  .post('/signin', signin)
  .get('/profile', getProfile)

export default router
