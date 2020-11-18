import { Router } from 'express'

import { handler as getComments } from './get-comments'
import { handler as addComment } from './add-comment'

const router = Router()

router.get('/sites/:siteId/posts/:postId/comments', getComments)
router.post('/posts/:postId/comments', addComment)

export default router
