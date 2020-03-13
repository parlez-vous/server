import { registerSite } from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'

import { isURL } from 'validator'

import { Record, String, Static } from 'runtypes'

type Site = Static<typeof siteDataDecoder>

const siteDataDecoder = Record({
  hostname: String.withConstraint(s =>
    isURL(s, {
      require_protocol: false,
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
      .asyncMap((admin) =>
        registerSite(admin.id, parsed.hostname)
      )

    return siteRegistrationResult
      .andThen((r) => r)
      .map(AppData.init)
  })
)
