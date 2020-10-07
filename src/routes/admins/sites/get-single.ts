import { decode } from 'routes/parser'
import * as rt from 'runtypes'
import { isAlphanumeric } from 'validator'
import { ok, err, ResultAsync } from 'neverthrow'

import { route, AppData } from 'routes/middleware'
import { RouteError } from 'routes/types'
import { getSingleSite } from 'db/actions'
import { Admin, Site } from 'db/types'
import { buildSite, SiteWithExpiry } from 'resources/sites'

const siteIdDecoder = rt.String.withConstraint(
  (s) => s.startsWith('c') && isAlphanumeric(s)
)

const errorMsg = 'Request path requires a cuid'

const getAdminSite = (
  siteId: Site['id'],
  adminId: Admin.WithoutPassword['id']
): ResultAsync<Site, RouteError> =>
  getSingleSite(siteId).andThen((site) =>
    // ensure that the admin owns the site they are requesting
    site.admin_id === adminId ? ok(site) : err(RouteError.NotFound)
  )

export const handler = route<SiteWithExpiry>((req, sessionManager) =>
  decode(siteIdDecoder, req.params.id, errorMsg).map((siteId) =>
    sessionManager
      .getSessionUser()
      .andThen((admin) => getAdminSite(siteId, admin.id))
      .map(buildSite)
      .map(AppData.init)
  )
)
