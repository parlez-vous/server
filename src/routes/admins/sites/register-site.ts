import { registerSite } from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'

import { isURL } from 'validator'
import { resolveTXTRecord } from 'utils'

import { err } from 'neverthrow'
import { Record, String, Static } from 'runtypes'
import { URL } from 'url'
import { RouteError } from 'routes/types'

export type Site = Static<typeof siteDataDecoder>

const siteDataDecoder = Record({
  hostname: String.withConstraint(s =>
    isURL(s, {
      protocols: [ 'http', 'https' ],
      require_protocol: true
    })
  ),
})

export const handler = route<Site>((req, session) =>
  decode(siteDataDecoder, req.body, 'Invalid request body')
    .map(async (parsed) => {
      const sessionResult = await session.getSessionUser()

      const siteRegistrationResult = await sessionResult
        .asyncMap(async (admin) => {
          const url = new URL(parsed.hostname)

          const dnsLookupResult = await resolveTXTRecord(url.hostname)

          return dnsLookupResult.match(
            _ok => registerSite(admin.id, url),
            _dnsError => err(RouteError.NotFound)
          )
        })

      return siteRegistrationResult
        .andThen((r) => r)
        .map(AppData.init)
    })
)
