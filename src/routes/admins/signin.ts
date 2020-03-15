import { validateAdmin } from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'
import { ok, chain3 } from 'neverthrow'

import { Record, String } from 'runtypes'
import { Admin } from 'db/types'
import { removePassword } from 'resources/admins'

const adminDecoder = Record({
  username: String,
  password: String,
})

export const handler = route<Admin.WithoutPassword>((req, session) =>
  decode(adminDecoder, req.body, 'Invalid request body')
    .map((parsed) => chain3(
      validateAdmin(parsed.username, parsed.password),
      async (admin) => {
        const sessionResult = await session.createSession(admin)

        return sessionResult.map((sessionToken) => {
          return {
            sessionToken,
            admin
          }
        })
      },
      ({ sessionToken, admin }) => Promise.resolve(
        ok(AppData.init(
          removePassword(admin),
          sessionToken
        ))
      )
    ))
)
