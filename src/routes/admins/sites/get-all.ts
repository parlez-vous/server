import * as db from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { DecodeResult } from 'routes/parser'
import { buildSite, SiteWithExpiry } from 'resources/sites'

export const handler = route<Array<SiteWithExpiry>>((_, sessionManager) =>
  DecodeResult.pass(
    sessionManager
      .getSessionUser()
      .andThen(({ id }) => db.getAdminSites(id))
      .map((sitesWithComments) => sitesWithComments.map(buildSite))
      .map(AppData.init)
  )
)
