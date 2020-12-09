import { registerSite } from 'db/actions'
import { protectedRoute, AppData } from 'router'
import { decode } from 'routes/parser'
import { buildSite, SiteWithExpiry, serialize } from 'resources/sites'

import validator from 'validator'

import { Record, String } from 'runtypes'

/* eslint-disable @typescript-eslint/camelcase */
const siteDataDecoder = Record({
  hostname: String.withConstraint((s) =>
    validator.isURL(s, {
      require_protocol: false,
      require_tld: true,
    })
  ),
})
/* eslint-enable @typescript-eslint/camelcase */

const decodeErrorMessage = [
  'Invalid request body.',
  'This endpoint only accepts Fully Qualified Domain Names',
].join(' ')

export const handler = protectedRoute<SiteWithExpiry>(
  (req, admin) =>
    decode(siteDataDecoder, req.body, decodeErrorMessage).map((parsed) =>
      registerSite(admin.id, parsed.hostname).map(buildSite).map(AppData.init)
    ),
  serialize
)
