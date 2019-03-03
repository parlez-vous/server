import { route, SessionError } from './middleware'

import { Result } from 'utils'

export const handler = route((_, session) => 
  Result.ok(
    session.getSessionUser()
      .then((result) => result.mapErr(SessionError.toString))
  )
)
