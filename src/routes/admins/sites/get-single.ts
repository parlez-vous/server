import { decode } from 'routes/parser'
import * as rt from 'runtypes'
import { isAlphanumeric } from 'validator'
import { ok, err, ResultAsync } from 'neverthrow'

import { route, AppData } from 'routes/middleware'
import * as Errors from 'errors'
import { getSingleSite } from 'db/actions'
import { Admin, Site } from 'db/types'
import { buildSite, SiteWithExpiry } from 'resources/sites'

type RouteError = Errors.RouteError

const siteIdDecoder = rt.String.withConstraint(
  (s) => s.startsWith('c') && isAlphanumeric(s)
)

const errorMsg = 'Request path requires a cuid'

const getAdminSite = (
  siteId: Site['id'],
  adminId: Admin.WithoutPassword['id']
): ResultAsync<Site, RouteError> =>
  getSingleSite({ type_: 'Cuid', val: siteId }).andThen((site) =>
    // ensure that the admin owns the site they are requesting
    // looks like i'm re-inventing the wheel on authorization
    // TODO
    //    look into Role-Based Access Control and other control mechanisms
    site.admin_id === adminId ? ok(site) : err(Errors.notFound())
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
