import { decode } from 'routes/parser'
import { String } from 'runtypes'
import { ok } from 'neverthrow'

import { route, AppData } from 'routes/middleware'
import { chain4 } from 'utils'
import { getSingleSite } from 'db/actions'
import { buildSite, fetchSiteWithComments, SiteWithExpiry } from 'resources/sites'

const siteIdDecoder = String.withConstraint(
  s => !Number.isNaN(parseInt(s, 10))
)

const errorMsg = 'Request path requires an integer'


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
