import { createAdmin } from 'db/actions'
import { route, decode } from './middleware'

import { Record, String, Static } from 'runtypes'

import { Result } from 'utils'
import { Admins } from 'db/types'

export type NewAdmin = Static<typeof adminSignupDecoder>

const adminSignupDecoder = Record({
  username: String,
  password: String,
  passwordConfirm: String,
})

export const handler = route<Admins.WithoutPassword>((req, session) => {
  return decode(adminSignupDecoder, req.body, 'Invalid request body')
    .mapOk((parsed) => {
      // https://www.npmjs.com/package/bcrypt#security-issuesconcerns
      if (
        parsed.password.length <= 7 ||
        parsed.password.length > 72
      ) {
        return Promise.resolve(
          Result.err('Password must be between 8 and 72 characters in length')
        )
      }
    
      if (parsed.password !== parsed.passwordConfirm) {
        return Promise.resolve(
          Result.err('Passwords do not match')
        )
      }
    
      if (parsed.username.length < 3) {
        return Promise.resolve(
          Result.err('Username must be at least 3 characters in length')
        )
      }
    
      return createAdmin(parsed)
        .then(result =>
          result.asyncMap((admin) =>
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
})
