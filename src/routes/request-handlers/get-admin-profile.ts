import { route, AppData, AuthorizationError, SessionError } from './middleware'

import { Admins } from 'db/types'

export const handler = route<Admins.WithoutPassword>((_, session) => 
  session.getSessionUser()
    .mapOk(async (adminResultPromise) => {
      const adminResult = await adminResultPromise

      return adminResult
        .mapOk((user) => AppData.init(user))
        .mapErr((e) => SessionError.toString(e))
    })
    .mapErr((e) => AuthorizationError.toString(e))
)
