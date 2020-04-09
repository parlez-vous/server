import { Record, String, Static } from 'runtypes'

import { createAdmin } from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'

import { err } from 'neverthrow'
import { Admin } from 'db/types'
import { RouteError } from 'routes/types'
import { removePassword } from 'resources/admins'

export type NewAdmin = Static<typeof adminSignupDecoder>

const adminSignupDecoder = Record({
  username: String,
  password: String,
  passwordConfirm: String,
})

export const handler = route<Admin.WithoutPassword>((req, session) => {
  return decode(adminSignupDecoder, req.body, 'Invalid request body').map(
    (parsed) => {
      // https://www.npmjs.com/package/bcrypt#security-issuesconcerns
      if (parsed.password.length <= 7 || parsed.password.length > 72) {
        return Promise.resolve(err(RouteError.Signup))
      }

      if (parsed.password !== parsed.passwordConfirm) {
        return Promise.resolve(err(RouteError.Signup))
      }

      if (parsed.username.length < 3 || parsed.username.length > 30) {
        return Promise.resolve(err(RouteError.Signup))
      }

      return createAdmin(parsed)
        .then((adminResult) =>
          adminResult.asyncMap(async (admin) => {
            const sessionResult = await session.createSession(admin)

            return sessionResult.map((sessionToken) =>
              AppData.init(removePassword(admin), sessionToken)
            )
          })
        )
        .then((appDataResult) =>
          appDataResult.andThen((innerResult) => innerResult)
        )
    }
  )
})
