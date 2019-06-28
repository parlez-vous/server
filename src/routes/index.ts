import { Router } from 'express'
import * as cors from 'cors'

import adminRoutes from './admins'

const rootRouter = Router()

const corsOptions = {
  allowedHeaders : ['Authorization', 'Content-Type']
}

rootRouter.use(cors(corsOptions))


rootRouter.use(
  '/admins',
  adminRoutes
)


export default rootRouter
