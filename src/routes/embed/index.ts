import { Router } from 'express'

import { handler as getComments } from './get-comments'
import { handler as addComment } from './add-comment'
import { handler as commentVote } from './comment-vote'
import { handler as getUserInteractions } from './get-interactions'

const router = Router()

router.get('/sites/:siteId/comments', getComments)
router.post('/posts/:postId/comments', addComment)
router.post('/comments/:commentId/vote', commentVote)
router.get('/interactions', getUserInteractions)

export default router
