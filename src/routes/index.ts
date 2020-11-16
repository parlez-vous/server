import { Router } from 'express'
import * as cors from 'cors'

import adminRoutes from './admins'
import embedRoutes from './embed'

const rootRouter = Router()

const corsOptions = {
  allowedHeaders: ['Authorization', 'Content-Type'],
}

rootRouter.use(cors(corsOptions))

// Routes to be used by the Admins / Mods who control a website(s)
rootRouter.use('/admins', adminRoutes)

// Routes to be used by the embed widget
// Hence all of these routes are public
rootRouter.use('/embed/', embedRoutes)

export default rootRouter
