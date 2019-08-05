import * as db from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'
import { String } from 'runtypes'
import { txtRecordValue, chain3 } from 'utils'
import { Result, ok } from 'neverthrow'
import { getSiteComments } from 'db/actions'

import { Sites, Comments } from 'db/types'
import { RouteError } from 'routes/types'


const siteIdDecoder = String.withConstraint(
  s => !Number.isNaN(parseInt(s, 10))
)

const errorMsg = 'Request path requires an integer'



type WithComments = Sites.Schema & {
  comments: Array<Comments.Schema>
}

type ExtendedSite = WithComments & {
  expires_by: Date
}


const fetchSiteWithComments = async (
  site: Sites.Schema
): Promise<Result<WithComments, RouteError>> => {
  if (!site.verified) {
    return ok(({
      ...site,
      comments: []
    }))
  }

  const commentsResult = await getSiteComments(site.id)

  return commentsResult.map((comments) => ({
    ...site,
    comments,
  }))
}


export const handler = route<ExtendedSite>((req, sessionManager) =>
  decode(siteIdDecoder, req.params.id, errorMsg)
  .map((siteId) => 
    chain3(
      sessionManager.getSessionUser(),
      ({ id }) => db.getSingleSite(id, parseInt(siteId, 10)),
      fetchSiteWithComments
    )
    .then((result) =>
      result.map((d) => {

        // Consider moving this logic to the db
        // new column that gets auto calculated
        const expiryDay = d.created_at.getDate() + 7

        const expiryDate = new Date(d.created_at)
        expiryDate.setDate(expiryDay)

        return AppData.init({
          ...d,
          dns_tag: txtRecordValue(d.dns_tag),
          expires_by: expiryDate
        })
      })
    ))
)
