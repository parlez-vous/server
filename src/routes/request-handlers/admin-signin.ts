import { getAdmin } from 'db/actions'
import { route, decode } from './middleware'

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
        adminResult.asyncMap((admin) =>
          session.createSession(admin).then((sessionResult) => {
            return sessionResult.mapOk(Admins.removePassword)
          })
        )
      )
      .then((outerResult) => 
          // extendOk can be used to flatten
          // a Result<Result<T, E2>, E1>
          // into a Result<T, E2>
          outerResult.extendOk((innerResult) => innerResult)
      )
    })
)
