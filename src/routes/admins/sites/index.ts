import { Router } from 'express'

import { handler as getAllSites } from './get-all'
import { handler as getSingle } from './get-single'
import { handler as registerSite } from './register-site'

const router = Router()


router.get('/', getAllSites)
router.post('/register', registerSite)
router.get('/:id', getSingle)

export default router
