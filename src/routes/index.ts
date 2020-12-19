import { Router } from 'express'
import cors from 'cors'

import adminRoutes from './admins'
import embedRoutes from './embed'
import errorReportingRoutes from './error-reporting'


const rootRouter = Router()

const corsOptions = {
  allowedHeaders: ['Authorization', 'Content-Type'],
  origin: [
    'http://localhost:3060',
    'http://localhost:8080',
    'http://dev.parlezvous.io:8080',
    'https://demo.parlezvous.io'
  ]
}

rootRouter.use(cors(corsOptions))


rootRouter.use('/error-reporting', errorReportingRoutes)

// Routes to be used by the Admins / Mods who control a website(s)
rootRouter.use('/admins', adminRoutes)

// Routes to be used by the embed widget
// Hence all of these routes are public
rootRouter.use('/embed', embedRoutes)

export default rootRouter
