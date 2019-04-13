import { createAdmin } from 'db/actions'
import { route, AppData } from './middleware'
import { decode } from 'routes/parser'

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
        .then((adminResult) => adminResult.asyncMap(async (admin) => {
          const sessionResult = await session.createSession(admin)
          
          return sessionResult.mapOk((sessionToken) =>
            AppData.init(
              Admins.removePassword(admin),
              sessionToken
            )
          )
        })
        )
        .then((appDataResult) =>
          appDataResult.extendOk(innerResult => innerResult)
        )
    })
})
