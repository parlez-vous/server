import { txtRecordValue } from 'utils'

import { Site } from 'db/types'

export type SiteWithExpiry = Site & {
  expires_by: Date
}

// constructs a site that is to be consumed by a front end
// FIXME: https://github.com/parlez-vous/server/issues/32
export const buildSite = (site: Site): SiteWithExpiry => {
  // Consider moving this logic to the db
  // new column that gets auto calculated
  const expiryDay = new Date(site.created_at).getDate() + 7

  const expiryDate = new Date(site.created_at)
  expiryDate.setDate(expiryDay)

  /* eslint-disable @typescript-eslint/camelcase */
  return {
    ...site,
    dns_tag: txtRecordValue(site.dns_tag),
    expires_by: expiryDate,
  }
}
