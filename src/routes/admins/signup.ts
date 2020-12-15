import { Record, String, Static } from 'runtypes'

import validator from 'validator'
import { createUser } from 'db/actions'
import { route, AppData } from 'router'
import { decode } from 'routes/parser'

import { errAsync } from 'neverthrow'
import { User } from 'db/types'
import * as Errors from 'errors'

export type NewUser = Static<typeof userSignupDecoder>

const userSignupDecoder = Record({
  username: String,
  email: String.withConstraint((s) => validator.isEmail(s)),
  password: String,
  passwordConfirm: String,
})

export const handler = route<User>((req, session) =>
  decode(userSignupDecoder, req.body, 'Invalid request body').map((parsed) => {
    // https://www.npmjs.com/package/bcrypt#security-issuesconcerns
    if (parsed.password.length <= 7 || parsed.password.length > 72) {
      return errAsync(
        Errors.badRequest(
          'Password must be between 8 and 71 characters in length'
        )
      )
    }

    if (parsed.password !== parsed.passwordConfirm) {
      return errAsync(Errors.badRequest('Passwords do not match'))
    }

    if (parsed.username.length < 3 || parsed.username.length > 30) {
      return errAsync(
        Errors.badRequest(
          'Username must be between 3 and 30 characters in length'
        )
      )
    }

    return createUser(parsed)
      .andThen(session.createSession)
      .map(({ sessionToken, admin }) => AppData.init(admin, sessionToken))
  })
)
