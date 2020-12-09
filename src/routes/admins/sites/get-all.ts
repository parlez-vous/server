import * as db from 'db/actions'
import { protectedRoute, AppData } from 'router'
import { DecodeResult } from 'routes/parser'
import { buildSite, SiteWithExpiry, serialize } from 'resources/sites'

export const handler = protectedRoute<Array<SiteWithExpiry>>(
  (_, admin) =>
    DecodeResult.pass(
      db
        .getAdminSites(admin.id)
        .map((sitesWithComments) => sitesWithComments.map(buildSite))
        .map(AppData.init)
    ),
  (sites) => sites.map(serialize)
)
