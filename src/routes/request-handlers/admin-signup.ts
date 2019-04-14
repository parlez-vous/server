import { Record, String, Static } from 'runtypes'

import { createAdmin } from 'db/actions'
import { route, AppData } from './middleware'
import { decode } from 'routes/parser'

import { Result } from 'utils'
import { Admins } from 'db/types'
import { AuthError } from '../session'

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
          Result.err(AuthError.Signup)
        )
      }
    
      if (parsed.password !== parsed.passwordConfirm) {
        return Promise.resolve(
          Result.err(AuthError.Signup)
        )
      }
    
      if (parsed.username.length < 3 || parsed.username.length > 30) {
        return Promise.resolve(
          Result.err(AuthError.Signup)
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
