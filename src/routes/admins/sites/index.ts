import { Router } from 'express'

import { handler as getAllSites } from './get-admin-sites'
import { handler as registerSite } from './register-site'

const router = Router()


router.get('/', getAllSites)
router.post('/register', registerSite)

export default router
