import { Router } from 'express'

import { handler as handleBugReport } from './handle-error-report'

const router = Router()

router.post('/', handleBugReport)

export default router


