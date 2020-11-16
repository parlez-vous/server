import { Router } from 'express'

import { handler as getComments } from './get-comments'

const router = Router()

router.get('/sites/:siteId/posts/:postId/comments', getComments)

export default router
