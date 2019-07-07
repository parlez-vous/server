import { registerSite } from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'

import { isURL } from 'validator'

import { Record, String, Static } from 'runtypes'
import { URL } from 'url'

export type Site = Static<typeof siteDataDecoder>

const siteDataDecoder = Record({
  hostname: String.withConstraint(s =>
    isURL(s, {
      protocols: [ 'http', 'https' ],
      require_protocol: true,
      require_tld: true
    })
  ),
})

const decodeErrorMessage = [
  'Invalid request body',
  'This endpoint only accepts Fully Qualified Domain Names'
].join(' ')

export const handler = route<Site>((req, session) =>
  decode(
    siteDataDecoder,
    req.body, 
    decodeErrorMessage
  )
  .map(async (parsed) => {
    const sessionResult = await session.getSessionUser()

    const siteRegistrationResult = await sessionResult
      .asyncMap(async (admin) => {
        const url = new URL(parsed.hostname)

        const registrationResult = await registerSite(admin.id, url)

        return registrationResult
      })

    return siteRegistrationResult
      .andThen((r) => r)
      .map(AppData.init)
  })
)
