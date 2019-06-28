import { getAdmin } from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'

import { Record, String, Static } from 'runtypes'
import { Admins } from 'db/types'

export type Admin = Static<typeof adminDecoder>

const adminDecoder = Record({
  username: String,
  password: String,
})

export const handler = route<Admins.WithoutPassword>((req, session) =>
  decode(adminDecoder, req.body, 'Invalid request body')
    .map(async (parsed) => {
      const adminResult = await getAdmin(parsed)

      const outerResult = await adminResult.asyncMap(async (admin) => {
        const sessionResult = await session.createSession(admin)

        return sessionResult.map((sessionToken) =>
          AppData.init(
            Admins.removePassword(admin),
            sessionToken
          )
        )
      })

      // extendOk can be used to flatten
      // a Result<Result<T, E2>, E1>
      // into a Result<T, E2>
      return outerResult.andThen(
        (innerResult) => innerResult
      )
    })
)
