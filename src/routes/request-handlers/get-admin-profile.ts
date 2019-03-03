import { route, SessionError } from './middleware'

import { Result } from 'utils'

import { Admins } from 'db/types'

export const handler = route<Admins.WithoutPassword>((_, session) => 
  Result.ok(
    session.getSessionUser()
      .then((result) => result.mapErr(SessionError.toString))
  )
)
