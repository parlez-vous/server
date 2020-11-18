import * as db from 'db/actions'
import { protectedRoute, AppData } from 'routes/middleware'
import { DecodeResult } from 'routes/parser'
import { buildSite, SiteWithExpiry } from 'resources/sites'

export const handler = protectedRoute<Array<SiteWithExpiry>>((_, admin) =>
  DecodeResult.pass(
    db
      .getAdminSites(admin.id)
      .map((sitesWithComments) => sitesWithComments.map(buildSite))
      .map(AppData.init)
  )
)
