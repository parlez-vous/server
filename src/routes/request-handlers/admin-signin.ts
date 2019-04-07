import { getAdmin } from 'db/actions'
import { route, decode, AppData } from './middleware'

import { Record, String, Static } from 'runtypes'
import { Admins } from 'db/types'

export type Admin = Static<typeof adminDecoder>

const adminDecoder = Record({
  username: String,
  password: String,
})

export const handler = route<Admins.WithoutPassword>((req, session) =>
  decode(adminDecoder, req.body, 'Invalid request body')
    .mapOk((parsed) => {
      return getAdmin(parsed).then((adminResult) =>
        adminResult.asyncMap(async (admin) => {
          const sessionResult = await session.createSession(admin)

          return sessionResult.mapOk((sessionToken) =>
            AppData.init(
              Admins.removePassword(admin),
              sessionToken
            )
          )
        })
      )
      .then((outerResult) => 
          // extendOk can be used to flatten
          // a Result<Result<T, E2>, E1>
          // into a Result<T, E2>
          outerResult.extendOk(
            (innerResult) => innerResult
          )
      )
    })
)
