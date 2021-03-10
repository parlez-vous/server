import * as db from 'db/actions'
import { protectedRoute, AppData } from 'router'
import { DecodeResult } from 'routes/parser'
import { Site } from 'db/types'

export const handler = protectedRoute<Array<Site>>((_, admin) =>
  DecodeResult.pass(db.getAdminSites(admin.id).map(AppData.init))
)
