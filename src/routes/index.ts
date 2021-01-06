import { Router } from 'express'
import cors from 'cors'

import adminRoutes from './admins'
import commonRoutes from './common'
import embedRoutes from './embed'
import errorReportingRoutes from './error-reporting'

const rootRouter = Router()

const corsOptions = {
  maxAge: 7200,
  allowedHeaders: ['Authorization', 'Content-Type'],
  origin: [
    'http://localhost:3060',
    'http://localhost:3000',
    'http://dev.parlezvous.io:3000',
    'https://demo.parlezvous.io',
  ],
}

rootRouter.use(cors(corsOptions))

rootRouter.use('/error-reporting', errorReportingRoutes)

rootRouter.use('/common', commonRoutes)

// Routes to be used by the Admins / Mods who control a website(s)
rootRouter.use('/admins', adminRoutes)

// Routes to be used by the embed widget
// Hence all of these routes are public
rootRouter.use('/embed', embedRoutes)

export default rootRouter

