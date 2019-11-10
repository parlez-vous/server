import { decode } from 'routes/parser'
import { String } from 'runtypes'

import { route, AppData } from 'routes/middleware'
import { chain3 } from 'utils'
import { getSingleSite } from 'db/actions'
import { buildSite, fetchSiteWithComments } from 'resources/sites'

import { Sites } from 'db/types'


const siteIdDecoder = String.withConstraint(
  s => !Number.isNaN(parseInt(s, 10))
)

const errorMsg = 'Request path requires an integer'


export const handler = route<Sites.Extended>((req, sessionManager) =>
  decode(siteIdDecoder, req.params.id, errorMsg)
  .map((siteId) => 
    chain3(
      sessionManager.getSessionUser(),
      ({ id }) => getSingleSite(id, parseInt(siteId, 10)),
      fetchSiteWithComments
    )
    .then((result) =>
      result.map((d) => AppData.init(buildSite(d)))
    ))
)
