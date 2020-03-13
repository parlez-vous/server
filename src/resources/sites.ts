
import { Result, ok } from 'neverthrow'

import { txtRecordValue } from 'utils'
import { getSiteComments } from 'db/actions'

import { RouteError } from 'routes/types'
import { Site, Comment } from 'db/types'

type SiteWithComments = Site & {
  comments: Array<Comment>
}

export type SiteWithExpiry = SiteWithComments & {
  expires_by: Date
} 

// TODO: refactor
// this approach is likely not going to scale
export const fetchSiteWithComments = async (
  site: Site
): Promise<Result<SiteWithComments, RouteError>> => {
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
// FIXME: https://github.com/parlez-vous/server/issues/32
export const buildSite = (site: SiteWithComments): SiteWithExpiry => {
  // Consider moving this logic to the db
  // new column that gets auto calculated
  const expiryDay = new Date(site.created_at).getDate() + 7

  const expiryDate = new Date(site.created_at)
  expiryDate.setDate(expiryDay)

  return {
    ...site,
    dns_tag: txtRecordValue(site.dns_tag),
    expires_by: expiryDate
  }
}
