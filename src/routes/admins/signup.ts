/**
 * Signup Route
 */

import { Record, String, Static } from 'runtypes'

import { createAdmin } from 'db/actions'
import { route, AppData } from 'routes/middleware'
import { decode } from 'routes/parser'

import { errAsync } from 'neverthrow'
import { Admin } from 'db/types'
import { RouteError } from 'routes/types'

export type NewAdmin = Static<typeof adminSignupDecoder>

const adminSignupDecoder = Record({
  username: String,
  email: String,
  password: String,
  passwordConfirm: String,
})

export const handler = route<Admin.WithoutPassword>((req, session) =>
  decode(adminSignupDecoder, req.body, 'Invalid request body').map((parsed) => {
    // https://www.npmjs.com/package/bcrypt#security-issuesconcerns
    if (parsed.password.length <= 7 || parsed.password.length > 72) {
      return errAsync(RouteError.Signup)
    }

    if (parsed.password !== parsed.passwordConfirm) {
      return errAsync(RouteError.Signup)
    }

    if (parsed.username.length < 3 || parsed.username.length > 30) {
      return errAsync(RouteError.Signup)
    }

    return createAdmin(parsed)
      .andThen(session.createSession)
      .map(({ sessionToken, admin }) => AppData.init(admin, sessionToken))
  })
)
