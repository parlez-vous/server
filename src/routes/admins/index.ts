import { Router } from 'express'

import { handler as signin } from './signin'
import { handler as signup } from './signup'
import { handler as getProfile } from './get-profile'


import sitesRoutes from './sites'


const router = Router()

router
  .post('/signup', signup)
  .post('/signin', signin)
  .get('/profile', getProfile)


router.use('/sites', sitesRoutes)


export default router
