import { registerSite } from 'db/actions'
import { protectedRoute, AppData } from 'router'
import { decode } from 'routes/parser'
import { Site } from 'db/types'

import validator from 'validator'

import { Record, String } from 'runtypes'

const siteDataDecoder = Record({
  hostname: String.withConstraint((s) =>
    validator.isURL(s, {
      require_protocol: false,
      require_tld: true,
    })
  ),
})

const decodeErrorMessage = [
  'Invalid request body.',
  'This endpoint only accepts Fully Qualified Domain Names',
].join(' ')

export const handler = protectedRoute<Site>((req, admin) =>
  decode(siteDataDecoder, req.body, decodeErrorMessage).map((parsed) =>
    registerSite(admin.id, parsed.hostname).map(AppData.init)
  )
)
