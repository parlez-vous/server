import { decode } from 'routes/parser'
import * as rt from 'runtypes'
import { ok } from 'neverthrow'
import { isAlphanumeric } from 'validator'

import { route, AppData } from 'routes/middleware'
import { chain4 } from 'utils'
import { getSingleSite } from 'db/actions'
import { buildSite, fetchSiteWithComments, SiteWithExpiry } from 'resources/sites'

const siteIdDecoder = rt.String.withConstraint(
  s => s.startsWith('c') && isAlphanumeric(s)
)

const errorMsg = 'Request path requires a cuid'

export const handler = route<SiteWithExpiry>((req, sessionManager) =>
  decode(siteIdDecoder, req.params.id, errorMsg)
  .map((siteId) => 
    chain4(
      sessionManager.getSessionUser(),
      ({ id }) => getSingleSite(id, siteId),
      fetchSiteWithComments,
      (siteWithComments) => Promise.resolve(
        ok(buildSite(siteWithComments))
      ),
    )
    .then((result) =>
      result.map(AppData.init)
    ))
)
