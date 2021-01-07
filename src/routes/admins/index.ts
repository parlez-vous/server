import { Router } from 'express'

import sitesRoutes from './sites'

const router = Router()

router.use('/sites', sitesRoutes)

export default router
