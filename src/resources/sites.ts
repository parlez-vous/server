
import { Result, ok } from 'neverthrow'

import { txtRecordValue } from 'utils'
import { getSiteComments } from 'db/actions'

import { RouteError } from 'routes/types'
import { Sites } from 'db/types'

export type WithComments = Omit<Sites.Extended, 'expires_by'>

// TODO: refactor
// this approach is likely not going to scale
export const fetchSiteWithComments = async (
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


// constructs a site that is to be consumed by a front end
export const buildSite = (site: WithComments): Sites.Extended => {
  // Consider moving this logic to the db
  // new column that gets auto calculated
  const expiryDay = site.created_at.getDate() + 7

  const expiryDate = new Date(site.created_at)
  expiryDate.setDate(expiryDay)

  return {
    ...site,
    dns_tag: txtRecordValue(site.dns_tag),
    expires_by: expiryDate
  }
}
